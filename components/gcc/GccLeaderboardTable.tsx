"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Filter,
  Flag,
  Timer,
  Trophy,
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

interface GccLeaderboardTableProps {
  teams: Team[];
  activeTeamId?: string;
}

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

const getDelta = (time: number | null, leaderTime: number | null) => {
  if (time == null || leaderTime == null) return "—";
  const diff = (time - leaderTime) / 1000;
  if (diff <= 0) return "LEADER";
  return `+${diff.toFixed(2)}s`;
};

export default function GccLeaderboardTable({
  teams,
  activeTeamId,
}: GccLeaderboardTableProps) {
  const [filterPodiumOnly, setFilterPodiumOnly] = useState(false);

  const sorted = useMemo(() => {
    return [...teams].sort(
      (a, b) => (a.best_time_ms ?? Infinity) - (b.best_time_ms ?? Infinity)
    );
  }, [teams]);

  const p1Time = sorted.find((t) => t.best_time_ms != null)?.best_time_ms ?? null;

  const displayList = useMemo(() => {
    if (filterPodiumOnly) return sorted.slice(0, 3);
    return sorted;
  }, [sorted, filterPodiumOnly]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Header Card ── */}
      <div
        className="gcc-card"
        style={{
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255, 190, 40, 0.12)",
              border: "1px solid rgba(255, 190, 40, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Trophy size={18} color="#ffbe28" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              OFFICIAL MOTORSPORT CLASSIFICATION
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              NIRMAN 6.0 LINE FOLLOWER LEADERBOARD · SUB-MILLISECOND TIMING
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setFilterPodiumOnly(!filterPodiumOnly)}
            className={`gcc-tab-btn ${filterPodiumOnly ? "active" : ""}`}
            style={{ fontSize: 11, padding: "6px 12px" }}
          >
            <Award size={13} color="#ffbe28" />
            <span>{filterPodiumOnly ? "Showing Podium (Top 3)" : "Podium Only"}</span>
          </button>
        </div>
      </div>

      {/* ── Timing Board Table ── */}
      <div className="gcc-card" style={{ padding: "16px 20px", overflowX: "auto" }}>
        {/* Table Column Header */}
        <div
          className="mono"
          style={{
            display: "grid",
            gridTemplateColumns: "55px 90px minmax(140px, 1.5fr) minmax(130px, 1fr) 110px 100px 110px",
            gap: 12,
            padding: "10px 14px",
            fontSize: 10,
            color: "#6c84a0",
            letterSpacing: "0.12em",
            borderBottom: "1px solid rgba(45, 75, 110, 0.35)",
            minWidth: 720,
          }}
        >
          <span>POS</span>
          <span>CODE</span>
          <span>TEAM</span>
          <span>COLLEGE</span>
          <span>BEST LAP</span>
          <span>GAP TO P1</span>
          <span>STATUS</span>
        </div>

        {/* Rows */}
        <div style={{ display: "grid", gap: 6, marginTop: 8, minWidth: 720 }}>
          {displayList.map((t, idx) => {
            const isP1 = idx === 0 && t.best_time_ms != null;
            const isP2 = idx === 1 && t.best_time_ms != null;
            const isP3 = idx === 2 && t.best_time_ms != null;
            const isRunning = t.id === activeTeamId || t.status === "running";
            const delta = getDelta(t.best_time_ms, p1Time);

            const rankBadgeColor = isP1
              ? "#ffbe28"
              : isP2
              ? "#c8dcf0"
              : isP3
              ? "#dc8250"
              : "#6c84a0";

            return (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "55px 90px minmax(140px, 1.5fr) minmax(130px, 1fr) 110px 100px 110px",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: isP1
                    ? "linear-gradient(90deg, rgba(255, 190, 40, 0.12), rgba(12, 20, 32, 0.5))"
                    : isP2
                    ? "linear-gradient(90deg, rgba(200, 220, 240, 0.08), rgba(12, 20, 32, 0.5))"
                    : isP3
                    ? "linear-gradient(90deg, rgba(220, 130, 80, 0.08), rgba(12, 20, 32, 0.5))"
                    : "rgba(8, 14, 24, 0.6)",
                  border: `1px solid ${
                    isP1
                      ? "rgba(255, 190, 40, 0.45)"
                      : isRunning
                      ? "rgba(0, 240, 255, 0.5)"
                      : "rgba(45, 75, 110, 0.25)"
                  }`,
                  borderLeft: isP1
                    ? "4px solid #ffbe28"
                    : isP2
                    ? "4px solid #c8dcf0"
                    : isP3
                    ? "4px solid #dc8250"
                    : undefined,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Position */}
                <span
                  className="digital"
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: rankBadgeColor,
                  }}
                >
                  P{idx + 1}
                </span>

                {/* Team Code */}
                <span
                  className="digital"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#ff6a00",
                  }}
                >
                  {t.code}
                </span>

                {/* Team Name */}
                <strong style={{ fontSize: 14, color: "#ffffff" }}>
                  {t.name}
                </strong>

                {/* College */}
                <span className="mono muted" style={{ fontSize: 12 }}>
                  {t.college}
                </span>

                {/* Best Lap */}
                <span
                  className="digital"
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: isP1 ? "#ffbe28" : "#00f0ff",
                  }}
                >
                  {fmt(t.best_time_ms)}
                </span>

                {/* Gap to P1 */}
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: delta === "LEADER" ? "#ffbe28" : delta === "—" ? "#6c84a0" : "#ffaa00",
                    fontWeight: delta === "LEADER" ? 700 : 400,
                  }}
                >
                  {delta}
                </span>

                {/* Status */}
                <div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: isRunning
                        ? "rgba(0, 255, 136, 0.15)"
                        : t.status === "finished"
                        ? "rgba(0, 240, 255, 0.12)"
                        : "rgba(45, 75, 110, 0.25)",
                      color: isRunning ? "#00ff88" : t.status === "finished" ? "#00f0ff" : "#8da3be",
                      border: `1px solid ${
                        isRunning
                          ? "rgba(0, 255, 136, 0.4)"
                          : t.status === "finished"
                          ? "rgba(0, 240, 255, 0.3)"
                          : "rgba(45, 75, 110, 0.3)"
                      }`,
                    }}
                  >
                    {isRunning ? "RACING" : t.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
