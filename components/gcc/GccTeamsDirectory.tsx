"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Cpu,
  Flame,
  Search,
  Timer,
  Users,
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

interface GccTeamsDirectoryProps {
  teams: Team[];
  activeTeamId?: string;
}

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function GccTeamsDirectory({
  teams,
  activeTeamId,
}: GccTeamsDirectoryProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.college.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filter === "all") return true;
      if (filter === "running") return t.id === activeTeamId || t.status === "running";
      return t.status === filter;
    });
  }, [teams, search, filter, activeTeamId]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Filter & Search Control Bar ── */}
      <div
        className="gcc-card"
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "rgba(255, 106, 0, 0.15)",
              border: "1px solid rgba(255, 106, 0, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Users size={16} color="#ff6a00" />
          </div>
          <div>
            <strong style={{ fontSize: 16, letterSpacing: "0.06em" }}>TEAM PADDOCK</strong>
            <div className="mono muted" style={{ fontSize: 10 }}>
              {teams.length} REGISTERED TEAMS · {filtered.length} DISPLAYED
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search
              size={14}
              color="#6c84a0"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search team, code, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field"
              style={{ paddingLeft: 34, height: 36, fontSize: 12 }}
            />
          </div>

          {/* Status Filters */}
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "finished", "registered", "running"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`gcc-tab-btn ${filter === st ? "active" : ""}`}
                style={{ fontSize: 11, padding: "6px 12px", textTransform: "uppercase" }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Teams Cards Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((t) => {
          const isRunning = t.id === activeTeamId || t.status === "running";
          const isFinished = t.status === "finished";

          return (
            <div
              key={t.id}
              className="gcc-card"
              style={{
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
                borderColor: isRunning ? "rgba(0, 240, 255, 0.6)" : undefined,
                boxShadow: isRunning ? "0 0 25px rgba(0, 240, 255, 0.2)" : undefined,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span
                    className="digital"
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#ff6a00",
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "rgba(255, 106, 0, 0.12)",
                      border: "1px solid rgba(255, 106, 0, 0.3)",
                    }}
                  >
                    {t.code}
                  </span>

                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: isRunning
                        ? "rgba(0, 255, 136, 0.15)"
                        : isFinished
                        ? "rgba(0, 240, 255, 0.12)"
                        : "rgba(45, 75, 110, 0.25)",
                      color: isRunning ? "#00ff88" : isFinished ? "#00f0ff" : "#8da3be",
                      border: `1px solid ${
                        isRunning
                          ? "rgba(0, 255, 136, 0.4)"
                          : isFinished
                          ? "rgba(0, 240, 255, 0.3)"
                          : "rgba(45, 75, 110, 0.3)"
                      }`,
                    }}
                  >
                    {isRunning ? "● RACING" : t.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                  {t.name}
                </h3>
                <div className="mono muted" style={{ fontSize: 11 }}>
                  {t.college}
                </div>
              </div>

              {/* Robot Specifications Preview */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(6, 12, 20, 0.7)",
                  border: "1px solid rgba(45, 75, 110, 0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                }}
              >
                <div>
                  <div className="mono muted" style={{ fontSize: 9 }}>
                    BEST LAP TIME
                  </div>
                  <div className="digital" style={{ fontSize: 16, color: "#00f0ff", fontWeight: 700 }}>
                    {fmt(t.best_time_ms)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="mono muted" style={{ fontSize: 9 }}>
                    CHASSIS / SENSORS
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "#fff" }}>
                    Optical 8x Array
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
