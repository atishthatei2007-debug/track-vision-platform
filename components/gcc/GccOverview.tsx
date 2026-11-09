"use client";

import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Radio,
  ShieldAlert,
  Timer,
  Trophy,
  Wifi,
  Zap,
} from "lucide-react";

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
    <div style={{ display: "grid", gap: 24 }}>
      {/* ── Hero Status Banner ── */}
      <div
        className="gcc-card"
        style={{
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          background: "radial-gradient(ellipse at top left, rgba(255, 106, 0, 0.12) 0%, rgba(10, 16, 26, 0.85) 60%)",
          border: "1px solid rgba(255, 106, 0, 0.35)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span className="gcc-tag">
              <Zap size={13} color="#ff6a00" /> GCC SMART RACE PROTOCOL
            </span>
            <span className="mono" style={{ fontSize: 11, color: "#8da3be" }}>
              COMPETITION STATUS: <strong style={{ color: "#00ff88" }}>ACTIVE</strong>
            </span>
          </div>
          <h2
            className="digital"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 900,
              color: "#ffffff",
              margin: "0 0 6px",
              letterSpacing: "0.06em",
            }}
          >
            RACE OVERVIEW &amp; TELEMETRY MATRIX
          </h2>
          <p className="muted" style={{ fontSize: 13, maxWidth: 640, lineHeight: 1.5 }}>
            Central monitoring for <strong>NIRMAN 6.0 Track Vision</strong>. Live optical laser
            checkpoints, millisecond split calculations, server-timestamp verification, and official F1-standard classification.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={onGoToLive}
            className="btn btn-primary"
            style={{ padding: "12px 22px", fontSize: 13, gap: 8 }}
          >
            <Radio size={16} />
            <span>Launch Live Arena</span>
          </button>
        </div>
      </div>

      {/* ── Core KPI Metric Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {/* Metric 1: Track Record */}
        <div className="gcc-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div className="mono muted" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              TRACK RECORD (P1)
            </div>
            <Trophy size={18} color="#ffbe28" />
          </div>
          <div
            className="digital"
            style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", letterSpacing: "0.04em" }}
          >
            {p1?.best_time_ms ? fmt(p1.best_time_ms) : "--.--s"}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "#ffaa00", marginTop: 4 }}>
            {p1 ? `${p1.name} (${p1.code})` : "Awaiting qualifying laps"}
          </div>
        </div>

        {/* Metric 2: Active Race */}
        <div className="gcc-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div className="mono muted" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              CURRENT RACE STATE
            </div>
            <Activity size={18} color={isRunning ? "#00ff88" : "#8da3be"} />
          </div>
          <div
            className="digital"
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: isRunning ? "#00ff88" : "#8da3be",
              letterSpacing: "0.04em",
            }}
          >
            {isRunning ? "CAR ON TRACK" : "ARENA STANDBY"}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "#8da3be", marginTop: 4 }}>
            {activeTeam ? activeTeam.name : "Waiting for run dispatch"}
          </div>
        </div>

        {/* Metric 3: Total Competitors */}
        <div className="gcc-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div className="mono muted" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              REGISTERED TEAMS
            </div>
            <Award size={18} color="#00f0ff" />
          </div>
          <div
            className="digital"
            style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", letterSpacing: "0.04em" }}
          >
            {teams.length}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "#00f0ff", marginTop: 4 }}>
            {finishedCount} Runs Completed ({teams.length - finishedCount} Pending)
          </div>
        </div>

        {/* Metric 4: Hardware Link */}
        <div className="gcc-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div className="mono muted" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              HARDWARE TELEMETRY
            </div>
            <Cpu size={18} color="#ff6a00" />
          </div>
          <div
            className="digital"
            style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", letterSpacing: "0.04em" }}
          >
            4 GATES ARMED
          </div>
          <div className="mono" style={{ fontSize: 11, color: connected ? "#00ff88" : "#8da3be", marginTop: 4 }}>
            ESP32 ADC1 · {connected ? "WebSockets Active" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* ── Split Columns: Quick Leaderboard vs Recent Events ── */}
      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 1fr)",
          gap: 20,
        }}
      >
        {/* Quick Podium Standings */}
        <div className="gcc-card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Trophy size={18} color="#ffbe28" />
              <strong style={{ fontSize: 15, letterSpacing: "0.06em" }}>TOP CONTENDERS</strong>
            </div>
            <span className="gcc-tag">OFFICIAL SPLITS</span>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {sorted.slice(0, 5).map((t, idx) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: idx === 0 ? "rgba(255, 190, 40, 0.08)" : "rgba(8, 14, 24, 0.6)",
                  border: `1px solid ${idx === 0 ? "rgba(255, 190, 40, 0.4)" : "rgba(45, 75, 110, 0.3)"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    className="digital"
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: idx === 0 ? "#ffbe28" : idx === 1 ? "#c8dcf0" : idx === 2 ? "#dc8250" : "#8da3be",
                      width: 24,
                    }}
                  >
                    P{idx + 1}
                  </span>
                  <div>
                    <strong style={{ fontSize: 13, color: "#fff" }}>{t.name}</strong>
                    <div className="mono muted" style={{ fontSize: 10 }}>
                      {t.code} · {t.college}
                    </div>
                  </div>
                </div>

                <div className="digital" style={{ fontSize: 15, color: "#00f0ff", fontWeight: 700 }}>
                  {fmt(t.best_time_ms)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Interrupt Events */}
        <div className="gcc-card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Clock size={18} color="#00f0ff" />
              <strong style={{ fontSize: 15, letterSpacing: "0.06em" }}>LIVE INTERRUPT FEED</strong>
            </div>
            <span className="mono" style={{ fontSize: 10, color: "#00ff88" }}>
              CH1-CH4
            </span>
          </div>

          <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {events.length > 0 ? (
              events.slice(-6).reverse().map((e) => (
                <div
                  key={e.id}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "rgba(6, 12, 20, 0.7)",
                    border: "1px solid rgba(45, 75, 110, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#00ff88",
                        boxShadow: "0 0 6px #00ff88",
                      }}
                    />
                    <span className="mono" style={{ color: "#fff" }}>
                      Gate 0{e.checkpoint_no} Tripped
                    </span>
                  </div>
                  <span className="mono muted" style={{ fontSize: 10 }}>
                    {new Date(e.detected_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 16px",
                  color: "#6c84a0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              >
                Waiting for laser interrupt triggers...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
