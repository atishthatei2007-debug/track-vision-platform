"use client";

import { Clock, Flag, Zap } from "lucide-react";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  best_time_ms: number | null;
  status: string;
};

interface RaceSchedulePanelProps {
  teams: Team[];
  activeTeamId?: string;
}

const STATUS_CONFIG = {
  finished: { color: "#00ff88", bg: "rgba(0, 255, 136, 0.12)", border: "rgba(0, 255, 136, 0.3)", label: "DONE" },
  running: { color: "#ffaa00", bg: "rgba(255, 170, 0, 0.15)", border: "rgba(255, 170, 0, 0.4)", label: "ON TRACK" },
  registered: { color: "#8da3be", bg: "rgba(45, 75, 110, 0.15)", border: "rgba(45, 75, 110, 0.35)", label: "QUEUED" },
  aborted: { color: "#ff2a55", bg: "rgba(255, 42, 85, 0.1)", border: "rgba(255, 42, 85, 0.3)", label: "ABORTED" },
};

function fmt(ms: number | null) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function RaceSchedulePanel({ teams, activeTeamId }: RaceSchedulePanelProps) {
  // Sort: running first, then registered (queued), then finished, then aborted
  const statusOrder: Record<string, number> = { running: 0, registered: 1, finished: 2, aborted: 3 };
  const sorted = [...teams].sort(
    (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
  );

  const queued = sorted.filter(t => t.status === "registered").length;
  const done = sorted.filter(t => t.status === "finished").length;
  const running = sorted.find(t => t.status === "running" || t.id === activeTeamId);

  return (
    <div
      className="panel hud-panel"
      style={{ padding: 22 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            className="muted mono"
            style={{ fontSize: 10, letterSpacing: "0.18em" }}
          >
            COMPETITION QUEUE
          </div>
          <h2
            style={{
              fontSize: 20,
              margin: "4px 0 0",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Flag size={18} color="#ff6a00" />
            Race Schedule
          </h2>
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              background: "rgba(255, 170, 0, 0.1)",
              border: "1px solid rgba(255, 170, 0, 0.3)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#ffaa00",
            }}
          >
            {queued} QUEUED
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.25)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#00ff88",
            }}
          >
            {done} DONE
          </div>
        </div>
      </div>

      {/* Currently on track banner */}
      {running && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "linear-gradient(90deg, rgba(255, 170, 0, 0.12), rgba(255, 106, 0, 0.06))",
            border: "1px solid rgba(255, 170, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ffaa00",
              boxShadow: "0 0 12px #ffaa00",
              animation: "none",
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ffaa00", fontWeight: 600 }}>
            NOW RACING
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {running.name}
          </span>
          <span className="muted mono" style={{ fontSize: 11, marginLeft: "auto" }}>
            {running.code}
          </span>
        </div>
      )}

      {/* Queue list */}
      <div style={{ display: "grid", gap: 6, maxHeight: 340, overflowY: "auto", paddingRight: 2 }}>
        {sorted.map((team, idx) => {
          const cfg = STATUS_CONFIG[team.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.registered;
          const isActive = team.id === activeTeamId || team.status === "running";

          return (
            <div
              key={team.id}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr auto auto",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 10,
                background: isActive
                  ? "rgba(255, 170, 0, 0.06)"
                  : "rgba(8, 15, 25, 0.5)",
                border: `1px solid ${isActive ? "rgba(255, 170, 0, 0.3)" : "rgba(35, 55, 80, 0.4)"}`,
                transition: "all 0.2s ease",
              }}
            >
              {/* Position number */}
              <div
                className="digital"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "#ffaa00" : "#4a6080",
                  textAlign: "center",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Team info */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f6ff" }}>
                  {team.name}
                </div>
                <div
                  className="muted mono"
                  style={{ fontSize: 10, marginTop: 1 }}
                >
                  {team.code} · {team.college}
                </div>
              </div>

              {/* Best time */}
              <div
                className="digital"
                style={{
                  fontSize: 13,
                  color: team.best_time_ms ? "#00f0ff" : "#4a6080",
                  fontWeight: 700,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {fmt(team.best_time_ms)}
              </div>

              {/* Status badge */}
              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: cfg.color,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {cfg.label}
              </div>
            </div>
          );
        })}

        {teams.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 16px",
              color: "#4a6080",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            <Clock size={28} color="#2d4b6e" style={{ margin: "0 auto 10px", display: "block" }} />
            No teams registered yet.
            <br />
            <span style={{ opacity: 0.6 }}>Use Admin Control Room to add teams.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(45, 75, 110, 0.25)",
          marginTop: 14,
          paddingTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "#4a6080",
        }}
      >
        <Zap size={11} color="#ff6a00" />
        NIRMAN 6.0 · Line Follower · 4-Gate Laser Course
      </div>
    </div>
  );
}
