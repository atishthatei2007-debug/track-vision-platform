"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Play,
  Plus,
  ShieldCheck,
  Square,
  Users,
  Flag,
  AlertTriangle,
  Zap,
} from "lucide-react";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  status: string;
  best_time_ms: number | null;
};

type ActiveRun = {
  id: string;
  team_id: string;
  started_at: string;
  teams?: Team;
};

const db = getSupabaseBrowser();

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [active, setActive] = useState<ActiveRun | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!db) return;
    const [{ data: ts }, { data: rs }] = await Promise.all([
      db.from("teams").select("*").order("code"),
      db.from("runs").select("*,teams(*)").eq("status", "running").order("started_at", { ascending: false }).limit(1),
    ]);
    setTeams((ts ?? []) as Team[]);
    setActive((rs?.[0] ?? null) as ActiveRun | null);
  }, []);

  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  async function api(path: string, body: any) {
    if (!session?.access_token) throw new Error("Please sign in again.");
    const r = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Request failed");
    return j;
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    setMessage("");
    const { error } = await db.auth.signInWithPassword({ email, password });
    setBusy(false);
    setMessage(error?.message ?? "Signed in successfully.");
  }

  async function addTeam(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/teams", { code, name, college });
      setCode("");
      setName("");
      setCollege("");
      await refresh();
      setMessage("Team registered successfully.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function startRun() {
    if (!selected) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/runs/start", { team_id: selected });
      await refresh();
      setMessage("Race started. ESP32 will track checkpoint triggers.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function abortRun() {
    if (!active) return;
    if (!confirm("Abort the active run? Its recorded time will not count.")) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/runs/abort", { run_id: active.id });
      await refresh();
      setMessage("Run aborted.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!db) {
    return (
      <main style={{ maxWidth: 650, margin: "80px auto", padding: 24, position: "relative", zIndex: 1 }}>
        <div className="panel hud-panel" style={{ padding: 32, textAlign: "center" }}>
          <AlertTriangle size={36} color="#ffaa00" style={{ margin: "0 auto 14px" }} />
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Configuration Required</h2>
          <p className="muted" style={{ fontSize: 14 }}>
            Configure your Supabase public URL and anon key in <code style={{ color: "#00f0ff" }}>.env.local</code> first.
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={{ maxWidth: 480, margin: "80px auto", padding: 24, position: "relative", zIndex: 1 }}>
        <Link
          href="/"
          className="muted"
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 20,
            fontSize: 13,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00f0ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <ArrowLeft size={16} /> Return to Spectator Arena
        </Link>

        <div className="panel hud-panel" style={{ padding: 32 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: "rgba(0, 255, 136, 0.1)",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              display: "grid",
              placeItems: "center",
              marginBottom: 16,
              boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
            }}
          >
            <ShieldCheck size={28} color="#00ff88" />
          </div>

          <h1 className="digital" style={{ fontSize: 24, margin: "0 0 6px", fontWeight: 800 }}>
            ORGANIZER LOGIN
          </h1>
          <p className="muted" style={{ fontSize: 13, margin: "0 0 24px" }}>
            Restricted access for approved Track Vision race marshals and event officials.
          </p>

          <form onSubmit={login} style={{ display: "grid", gap: 14 }}>
            <div>
              <label className="mono muted" style={{ fontSize: 11, display: "block", marginBottom: 6 }}>
                OFFICIAL EMAIL
              </label>
              <input
                className="field"
                type="email"
                placeholder="organizer@nirman.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mono muted" style={{ fontSize: 11, display: "block", marginBottom: 6 }}>
                SECURITY CREDENTIAL
              </label>
              <input
                className="field"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary" disabled={busy} style={{ marginTop: 8, padding: "13px" }}>
              <LogIn size={16} />
              {busy ? "Authenticating..." : "Authorize Access"}
            </button>
          </form>

          {message && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(0, 240, 255, 0.08)",
                border: "1px solid rgba(0, 240, 255, 0.2)",
                color: "#7defff",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              {message}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px", position: "relative", zIndex: 1 }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 26,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
        }}
      >
        <div>
          <Link
            href="/"
            className="muted mono"
            style={{
              fontSize: 12,
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
              marginBottom: 8,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00f0ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <ArrowLeft size={14} /> Back to Spectator Arena
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/track-vision-logo.png"
              alt="Track Vision"
              width={46}
              height={46}
              style={{ objectFit: "contain", filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))" }}
            />
            <div>
              <h1 className="digital" style={{ fontSize: 26, margin: 0, fontWeight: 900 }}>
                CONTROL <span style={{ color: "#ff6a00" }}>ROOM</span>
              </h1>
              <p className="muted mono" style={{ fontSize: 11, margin: "2px 0 0" }}>
                ORGANIZER DISPATCH & RACE MARSHAL CONSOLE
              </p>
            </div>
          </div>
        </div>

        <button className="btn" onClick={() => db.auth.signOut()} style={{ fontSize: 12 }}>
          <LogOut size={15} color="#ff496b" /> Sign out
        </button>
      </header>

      {/* Alert message notification */}
      {message && (
        <div
          className="panel"
          style={{
            padding: "12px 18px",
            marginBottom: 20,
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            borderLeft: "4px solid var(--cyan)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Zap size={15} color="#00f0ff" />
          <span>{message}</span>
        </div>
      )}

      {/* Control Actions Row */}
      <section className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Race Start / Abort */}
        <div className="panel hud-panel" style={{ padding: 24 }}>
          <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.15em" }}>
            DISPATCH CONTROLS
          </div>
          <h2 style={{ margin: "4px 0 16px", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Flag size={20} color="#00f0ff" /> Race Dispatch
          </h2>

          {active ? (
            <div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "radial-gradient(circle at 100% 0%, rgba(255, 170, 0, 0.15) 0%, rgba(20, 14, 8, 0.8) 100%)",
                  border: "1px solid rgba(255, 170, 0, 0.5)",
                  marginBottom: 16,
                  boxShadow: "0 0 25px rgba(255, 170, 0, 0.15)",
                }}
              >
                <div style={{ color: "#ffaa00", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="live-beacon" style={{ background: "#ffaa00" }} /> ACTIVE RACE RUNNING
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "#fff" }}>
                  {active.teams?.name ?? "Active Robot"}
                </div>
                <div className="muted mono" style={{ fontSize: 12 }}>
                  {active.teams?.code ?? active.team_id}
                </div>
              </div>

              <button className="btn btn-danger" disabled={busy} onClick={abortRun} style={{ width: "100%" }}>
                <Square size={16} /> Abort Active Run
              </button>
            </div>
          ) : (
            <div>
              <label className="muted mono" style={{ fontSize: 11, display: "block", marginBottom: 8 }}>
                SELECT REGISTERED COMPETITOR
              </label>
              <select
                className="field"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                style={{ marginBottom: 16, cursor: "pointer" }}
              >
                <option value="">Choose a team to dispatch...</option>
                {teams
                  .filter((t) => t.status !== "disqualified")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} — {t.name} ({t.college})
                    </option>
                  ))}
              </select>

              <button
                className="btn btn-primary"
                disabled={busy || !selected}
                onClick={startRun}
                style={{ width: "100%", padding: "14px" }}
              >
                <Play size={17} /> START RACE
              </button>
              <p className="muted mono" style={{ fontSize: 11, marginTop: 12 }}>
                Initiates official race run. The ESP32 telemetry hardware will immediately listen for CP1 → CP4 gates.
              </p>
            </div>
          )}
        </div>

        {/* Team Registration Form */}
        <div className="panel hud-panel" style={{ padding: 24 }}>
          <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.15em" }}>
            TEAM REGISTRATION
          </div>
          <h2 style={{ margin: "4px 0 16px", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={20} color="#00ff88" /> Add Competitor
          </h2>

          <form onSubmit={addTeam} style={{ display: "grid", gap: 12 }}>
            <input
              className="field"
              placeholder="Team Code (e.g. TV-05)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <input
              className="field"
              placeholder="Team Name (e.g. CyberDrift)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="field"
              placeholder="College / Institution"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
            <button className="btn" disabled={busy} style={{ padding: "12px", marginTop: 4 }}>
              <Plus size={16} color="#00ff88" /> Register Team
            </button>
          </form>
        </div>
      </section>

      {/* Registered Teams Table */}
      <section className="panel hud-panel" style={{ padding: 24, marginTop: 20 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 16px", fontWeight: 700 }}>Registered Competitors ({teams.length})</h2>

        <div
          className="mono"
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 110px 100px",
            gap: 12,
            padding: "8px 12px",
            fontSize: 10,
            color: "#6b829c",
            borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
          }}
        >
          <span>CODE</span>
          <span>TEAM & COLLEGE</span>
          <span>BEST TIME</span>
          <span>STATUS</span>
        </div>

        <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
          {teams.map((t) => (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 110px 100px",
                gap: 12,
                padding: "12px",
                borderRadius: 10,
                alignItems: "center",
                borderBottom: "1px solid rgba(45, 75, 110, 0.2)",
                fontSize: 13,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(18, 30, 48, 0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span className="mono" style={{ color: "#00f0ff" }}>
                {t.code}
              </span>
              <div>
                <b>{t.name}</b>
                <small className="muted mono" style={{ display: "block", fontSize: 11 }}>
                  {t.college}
                </small>
              </div>
              <span className="digital" style={{ fontSize: 14 }}>
                {t.best_time_ms == null ? "—" : (t.best_time_ms / 1000).toFixed(2) + "s"}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: t.status === "finished" ? "#00ff88" : "#8da3be",
                }}
              >
                {t.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
