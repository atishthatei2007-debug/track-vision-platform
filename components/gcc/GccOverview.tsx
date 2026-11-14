"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Radio,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  best_time_ms: number | null;
  status: string;
};

type Run = {
  id: string;
  team_id: string;
  started_at: string;
  finished_at: string | null;
  elapsed_ms: number | null;
  status: string;
  teams?: Team;
};

type Checkpoint = {
  id: string;
  run_id: string;
  checkpoint_no: number;
  detected_at: string;
};

interface GccOverviewProps {
  teams: Team[];
  active: Run | null;
  events: Checkpoint[];
  connected: boolean;
  onGoToLive: () => void;
}

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function GccOverview({
  teams,
  active,
  events,
  connected,
  onGoToLive,
}: GccOverviewProps) {
  const sorted = [...teams].sort(
    (a, b) => (a.best_time_ms ?? Infinity) - (b.best_time_ms ?? Infinity)
  );
  const p1 = sorted.find((t) => t.best_time_ms != null);
  const finishedCount = teams.filter((t) => t.status === "finished").length;
  const isRunning = active?.status === "running";
  const activeTeam = active
    ? teams.find((t) => t.id === active.team_id) || active.teams
    : null;

  return (
    <div className="grid gap-5">
      {/* ── Motorsport Race Protocol Banner ── */}
      <Panel
        variant={isRunning ? "racing" : "default"}
        padding="lg"
        className="gcc-brutal-box flex justify-between items-center flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FF8A32] text-[#292929] border border-[#292929] shadow-[1px_1px_0_#292929] flex items-center gap-1.5 rounded">
              <Zap size={12} color="#292929" /> GCC SMART RACE PROTOCOL
            </span>
            <span className="font-mono text-xs text-[#A3A3A3] font-bold">
              TELEMETRY: <strong className={connected ? "text-[#22c55e]" : "text-[#FF8A32]"}>{connected ? "SYNCHRONIZED (1000 Hz)" : "STANDBY"}</strong>
            </span>
          </div>

          <h2 className="font-digital text-2xl font-black text-[#292929] tracking-wider m-0">
            {isRunning ? (
              <span className="text-[#FF8A32] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF8A32] animate-pulse border border-[#292929]" />
                ACTIVE HEAT IN PROGRESS: {activeTeam?.name ?? "LIVE BOT"}
              </span>
            ) : (
              "ARENA STAGED & READY FOR DISPATCH"
            )}
          </h2>
          <div className="font-mono text-xs text-[#A3A3A3] mt-1 font-bold">
            4-GATE ESP32 ADC1 TIMING · SUB-MILLISECOND SERVER CLOCK VALIDATION
          </div>
        </div>

        <div>
          <Button variant="racing" size="default" onClick={onGoToLive} className="gap-2">
            <Radio size={16} />
            <span>SWITCH TO LIVE ARENA</span>
          </Button>
        </div>
      </Panel>

      {/* ── Key Competition KPI Matrix ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Current P1 Record */}
        <Panel variant="orange" padding="default" className="gcc-brutal-box flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] text-[#292929] font-black tracking-widest uppercase">
              FASTEST LAP (P1)
            </span>
            <Trophy size={16} className="text-[#292929]" />
          </div>
          <div className="my-2">
            <div className="font-digital text-2xl font-black text-[#292929]">
              {p1?.best_time_ms ? fmt(p1.best_time_ms) : "--.--s"}
            </div>
            <div className="font-mono text-xs text-[#292929]/80 truncate mt-0.5 font-bold">
              {p1?.name ?? "No valid laps recorded"}
            </div>
          </div>
          <div className="font-mono text-[10px] text-[#292929] font-bold">
            {p1 ? `${p1.code} · ${p1.college}` : "Pending first run"}
          </div>
        </Panel>

        {/* KPI 2: Completed Laps */}
        <Panel variant="peach" padding="default" className="gcc-brutal-box flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] text-[#292929] font-black tracking-widest uppercase">
              OFFICIAL FINISHES
            </span>
            <CheckCircle2 size={16} className="text-[#292929]" />
          </div>
          <div className="my-2">
            <div className="font-digital text-2xl font-black text-[#292929]">
              {finishedCount} / {teams.length}
            </div>
            <div className="font-mono text-xs text-[#A3A3A3] mt-0.5 font-bold">
              {teams.length > 0 ? `${Math.round((finishedCount / teams.length) * 100)}% field completed` : "—"}
            </div>
          </div>
          <div className="font-mono text-[10px] text-[#292929] font-bold">
            All 4 Gates Cleared
          </div>
        </Panel>

        {/* KPI 3: Telemetry Hardware */}
        <Panel variant="default" padding="default" className="gcc-brutal-box flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] text-[#FF8A32] font-black tracking-widest uppercase">
              HARDWARE STATUS
            </span>
            <Cpu size={16} className="text-[#FF8A32]" />
          </div>
          <div className="my-2">
            <div className="font-digital text-2xl font-black text-[#292929]">
              {connected ? "4/4 ARMED" : "STANDBY"}
            </div>
            <div className="font-mono text-xs text-[#A3A3A3] mt-0.5 font-bold">
              ESP32 DevKit V1 (ADC1)
            </div>
          </div>
          <div className="font-mono text-[10px] text-[#22c55e] font-black">
            Channels: GPIO 32, 33, 34, 35
          </div>
        </Panel>

        {/* KPI 4: Active Gate Interrupts */}
        <Panel variant="cream" padding="default" className="gcc-brutal-box flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] text-[#A3A3A3] font-bold tracking-widest uppercase">
              RUN CHECKPOINTS
            </span>
            <Clock size={16} className="text-[#A3A3A3]" />
          </div>
          <div className="my-2">
            <div className="font-digital text-2xl font-black text-[#292929]">
              {events.length} / 4
            </div>
            <div className="font-mono text-xs text-[#A3A3A3] mt-0.5 font-bold">
              {isRunning ? "Tracking live heat in transit" : "Awaiting next start"}
            </div>
          </div>
          <div className="font-mono text-[10px] text-[#A3A3A3] font-bold">
            Server Timestamps Validated
          </div>
        </Panel>
      </div>
    </div>
  );
}
