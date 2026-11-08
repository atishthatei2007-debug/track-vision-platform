-- Track Vision schema. Run in Supabase SQL Editor on a new project.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  college text not null default '',
  best_time_ms bigint,
  status text not null default 'registered'
    check (status in ('registered','running','finished','disqualified')),
  created_at timestamptz not null default now()
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  status text not null default 'running'
    check (status in ('running','finished','disqualified','aborted')),
  started_at timestamptz not null default clock_timestamp(),
  finished_at timestamptz,
  elapsed_ms bigint,
  started_by uuid references auth.users(id),
  ended_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.checkpoint_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  checkpoint_no integer not null check (checkpoint_no between 1 and 4),
  device_id text not null default 'track-vision-esp32',
  detected_at timestamptz not null default clock_timestamp(),
  unique(run_id, checkpoint_no)
);

create index if not exists runs_status_idx on public.runs(status);
create index if not exists runs_team_idx on public.runs(team_id, created_at desc);
create index if not exists checkpoint_events_run_idx on public.checkpoint_events(run_id);

-- One active run per physical track.
create unique index if not exists one_active_run_per_track
on public.runs ((status)) where status = 'running';

alter table public.admin_users enable row level security;
alter table public.teams enable row level security;
alter table public.runs enable row level security;
alter table public.checkpoint_events enable row level security;

-- Spectator clients can read public competition data only.
drop policy if exists "public can read teams" on public.teams;
create policy "public can read teams" on public.teams for select to anon, authenticated using (true);
drop policy if exists "public can read runs" on public.runs;
create policy "public can read runs" on public.runs for select to anon, authenticated using (true);
drop policy if exists "public can read checkpoint events" on public.checkpoint_events;
create policy "public can read checkpoint events" on public.checkpoint_events for select to anon, authenticated using (true);
-- admin_users has no client-facing read policy. Server checks membership with service role.

create or replace function public.admin_start_run(p_team_id uuid, p_admin_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  new_run public.runs%rowtype;
  team_row public.teams%rowtype;
begin
  perform pg_advisory_xact_lock(hashtext('track-vision-single-track'));
  if not exists(select 1 from public.admin_users where user_id = p_admin_id) then
    raise exception 'Admin access required';
  end if;
  if exists(select 1 from public.runs where status='running') then
    raise exception 'Another run is already active';
  end if;
  select * into team_row from public.teams where id=p_team_id for update;
  if team_row.id is null then raise exception 'Team not found'; end if;
  if team_row.status='disqualified' then raise exception 'Disqualified team cannot start'; end if;
  insert into public.runs(team_id,status,started_at,started_by)
    values(p_team_id,'running',clock_timestamp(),p_admin_id)
    returning * into new_run;
  update public.teams set status='running' where id=p_team_id;
  return jsonb_build_object('id',new_run.id,'team_id',new_run.team_id,'started_at',new_run.started_at,'status',new_run.status);
end; $$;

create or replace function public.admin_abort_run(p_run_id uuid, p_admin_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare run_row public.runs%rowtype;
begin
  if not exists(select 1 from public.admin_users where user_id=p_admin_id) then
    raise exception 'Admin access required';
  end if;
  select * into run_row from public.runs where id=p_run_id and status='running' for update;
  if run_row.id is null then raise exception 'No matching active run'; end if;
  update public.runs set status='aborted',finished_at=clock_timestamp(),ended_by=p_admin_id where id=p_run_id;
  update public.teams set status='registered' where id=run_row.team_id and status='running';
  return jsonb_build_object('aborted',true,'run_id',p_run_id);
end; $$;

create or replace function public.record_checkpoint(p_run_id uuid,p_checkpoint_no integer,p_device_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  run_row public.runs%rowtype;
  event_time timestamptz := clock_timestamp();
  inserted_id uuid;
  elapsed bigint;
begin
  select * into run_row from public.runs where id=p_run_id and status='running' for update;
  if run_row.id is null then raise exception 'Run is not active'; end if;
  if p_checkpoint_no not between 1 and 4 then raise exception 'Invalid checkpoint number'; end if;
  if exists(select 1 from public.checkpoint_events where run_id=p_run_id and checkpoint_no=p_checkpoint_no) then
    return jsonb_build_object('duplicate',true,'run_id',p_run_id);
  end if;
  if p_checkpoint_no > 1 and not exists(
    select 1 from public.checkpoint_events where run_id=p_run_id and checkpoint_no=p_checkpoint_no-1
  ) then raise exception 'Checkpoint out of sequence'; end if;
  if p_checkpoint_no = 1 and exists(
    select 1 from public.checkpoint_events where run_id=p_run_id and checkpoint_no > 1
  ) then raise exception 'Invalid checkpoint order'; end if;
  insert into public.checkpoint_events(run_id,checkpoint_no,device_id,detected_at)
    values(p_run_id,p_checkpoint_no,coalesce(p_device_id,'track-vision-esp32'),event_time)
    returning id into inserted_id;
  if p_checkpoint_no=4 then
    elapsed := greatest(0,(extract(epoch from (event_time-run_row.started_at))*1000)::bigint);
    update public.runs set status='finished',finished_at=event_time,elapsed_ms=elapsed where id=p_run_id;
    update public.teams set status='finished',
      best_time_ms=case when best_time_ms is null then elapsed else least(best_time_ms,elapsed) end
      where id=run_row.team_id;
  end if;
  return jsonb_build_object('duplicate',false,'event_id',inserted_id,'run_id',p_run_id,'finished',p_checkpoint_no=4);
end; $$;

-- Only server service-role calls these SECURITY DEFINER RPCs after checking the admin/device secret.
revoke all on function public.admin_start_run(uuid,uuid) from public, anon, authenticated;
revoke all on function public.admin_abort_run(uuid,uuid) from public, anon, authenticated;
revoke all on function public.record_checkpoint(uuid,integer,text) from public, anon, authenticated;
grant execute on function public.admin_start_run(uuid,uuid) to service_role;
grant execute on function public.admin_abort_run(uuid,uuid) to service_role;
grant execute on function public.record_checkpoint(uuid,integer,text) to service_role;

-- Enable database change feeds for the public dashboard.
do $$ begin alter publication supabase_realtime add table public.teams; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.runs; exception when duplicate_object then null; when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.checkpoint_events; exception when duplicate_object then null; when others then null; end $$;

insert into public.teams(code,name,college) values
('TV-01','Circuit Breakers','Silicon University'),
('TV-02','Track Titans','BCET'),
('TV-03','RoboRangers','Silicon University'),
('TV-04','Byte Racers','KIIT')
on conflict(code) do nothing;
