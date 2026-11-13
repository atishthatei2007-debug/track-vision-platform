"use client";

import { useMemo } from "react";
import { CheckCircle2, Zap } from "lucide-react";

type Checkpoint = {
  id: string;
  run_id: string;
  checkpoint_no: number;
  detected_at: string;
};

type Run = {
  id: string;
  status: string;
  elapsed_ms: number | null;
};

interface GccTrackMapProps {
  active: Run | null;
  events: Checkpoint[];
  connected: boolean;
}

// SVG gate positions along a looping oval track path
const GATES = [
  {
    id: 1,
    label: "START",
    sub: "GATE 01",
    cx: 110,
    cy: 310,
    textX: 60,
    textY: 338,
  },
  {
    id: 2,
    label: "SECTOR 1",
    sub: "GATE 02",
    cx: 200,
    cy: 100,
    textX: 148,
    textY: 85,
  },
  {
    id: 3,
    label: "HAIRPIN",
    sub: "GATE 03",
    cx: 490,
    cy: 100,
    textX: 450,
    textY: 85,
  },
  {
    id: 4,
    label: "FINISH",
    sub: "GATE 04",
    cx: 580,
    cy: 310,
    textX: 540,
    textY: 338,
  },
];

// Approximate track spine as a closed SVG path (oval with top straight)
const TRACK_PATH =
  "M110,310 Q80,250 100,180 Q120,120 200,100 L490,100 Q570,100 585,180 Q600,250 580,310 Q565,370 490,380 L200,380 Q130,370 110,310 Z";

function fmt(ms: number | null) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function GccTrackMap({ active, events, connected }: GccTrackMapProps) {
  const clearedSet = useMemo(() => new Set(events.map((e) => e.checkpoint_no)), [events]);
  const isRunning = active?.status === "running";

  // Split times between consecutive cleared gates
  const splitTimes = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.checkpoint_no - b.checkpoint_no);
    const splits: Record<number, string> = {};
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const delta = new Date(curr.detected_at).getTime() - new Date(prev.detected_at).getTime();
      splits[curr.checkpoint_no] = `+${(delta / 1000).toFixed(2)}s`;
    }
    return splits;
  }, [events]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Header ── */}
      <div
        className="gcc-card"
        style={{
          padding: "16px 22px",
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
              background: "rgba(255, 106, 0, 0.12)",
              border: "1px solid rgba(255, 106, 0, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Zap size={18} color="#ff6a00" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              RACE TRACK MAP &amp; GATE TOPOLOGY
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              4-GATE OPTICAL LASER LAYOUT · LIVE CHECKPOINT STATUS
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="pill pill-green" style={{ fontSize: 10 }}>
            {clearedSet.size}/4 GATES CLEARED
          </span>
          {active?.status === "finished" && active.elapsed_ms != null && (
            <span className="pill" style={{ fontSize: 10 }}>
              OFFICIAL: {fmt(active.elapsed_ms)}
            </span>
          )}
        </div>
      </div>

      {/* ── Track SVG Map ── */}
      <div
        className="gcc-card hud-panel"
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <svg
          viewBox="0 50 690 380"
          width="100%"
          style={{ maxWidth: 700, display: "block" }}
          aria-label="Race track layout with 4 laser gates"
        >
          <defs>
            {/* Glowing filter for active gates */}
            <filter id="gateGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Track gradient */}
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,240,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,106,0,0.06)" />
            </linearGradient>
          </defs>

          {/* Outer track fill */}
          <path
            d={TRACK_PATH}
            fill="url(#trackGrad)"
            stroke="rgba(45,75,110,0.6)"
            strokeWidth="2"
          />

          {/* Inner cutout (donut) */}
          <path
            d="M170,310 Q155,255 170,195 Q185,140 240,125 L450,125 Q515,125 525,195 Q535,255 520,310 Q510,355 450,360 L240,360 Q180,355 170,310 Z"
            fill="rgba(4,8,14,0.85)"
            stroke="rgba(35,55,80,0.4)"
            strokeWidth="1.5"
          />

          {/* Direction arrow on track */}
          <text
            x="345"
            y="248"
            textAnchor="middle"
            fill="rgba(100,130,165,0.5)"
            fontSize="22"
            fontFamily="monospace"
          >
            ↻
          </text>
          <text
            x="345"
            y="268"
            textAnchor="middle"
            fill="rgba(100,130,165,0.35)"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="2"
          >
            DIRECTION
          </text>

          {/* Gate nodes */}
          {GATES.map((g) => {
            const cleared = clearedSet.has(g.id);
            const isActive = isRunning && cleared;
            const color = cleared ? "#00ff88" : isRunning ? "#ffaa00" : "#2d4b6e";
            const glow = cleared ? "url(#gateGlow)" : undefined;

            return (
              <g key={g.id}>
                {/* Pulse ring for active cleared gate */}
                {isActive && (
                  <circle
                    cx={g.cx}
                    cy={g.cy}
                    r={22}
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="1.5"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="18;30;18"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Gate circle */}
                <circle
                  cx={g.cx}
                  cy={g.cy}
                  r={18}
                  fill={cleared ? "rgba(0,255,136,0.18)" : "rgba(10,20,35,0.9)"}
                  stroke={color}
                  strokeWidth={cleared ? 2.5 : 1.5}
                  filter={glow}
                />

                {/* Gate number */}
                <text
                  x={g.cx}
                  y={g.cy + 5}
                  textAnchor="middle"
                  fill={color}
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {cleared ? "✓" : g.id}
                </text>

                {/* Gate label above/below */}
                <text
                  x={g.textX}
                  y={g.textY}
                  textAnchor="middle"
                  fill={cleared ? "#00ff88" : "#6c84a0"}
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.8"
                >
                  {g.sub}
                </text>
                <text
                  x={g.textX}
                  y={g.textY + 11}
                  textAnchor="middle"
                  fill={cleared ? "#a0ffcc" : "#4a6480"}
                  fontSize="7.5"
                  fontFamily="monospace"
                  letterSpacing="0.5"
                >
                  {g.label}
                </text>

                {/* Split time badge */}
                {splitTimes[g.id] && (
                  <g>
                    <rect
                      x={g.cx - 24}
                      y={g.cy - 42}
                      width={48}
                      height={16}
                      rx={4}
                      fill="rgba(0,240,255,0.15)"
                      stroke="rgba(0,240,255,0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={g.cx}
                      y={g.cy - 31}
                      textAnchor="middle"
                      fill="#00f0ff"
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {splitTimes[g.id]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Connection lines between gates (progress indicator) */}
          {[
            [GATES[0], GATES[1]],
            [GATES[1], GATES[2]],
            [GATES[2], GATES[3]],
          ].map(([from, to], i) => {
            const bothCleared =
              clearedSet.has(from.id) && clearedSet.has(to.id);
            return (
              <line
                key={i}
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke={bothCleared ? "rgba(0,255,136,0.5)" : "rgba(45,75,110,0.25)"}
                strokeWidth={bothCleared ? 2 : 1}
                strokeDasharray={bothCleared ? undefined : "5 4"}
              />
            );
          })}
        </svg>

        {/* Gate legend strip */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {GATES.map((g) => {
            const cleared = clearedSet.has(g.id);
            return (
              <div
                key={g.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: cleared
                    ? "rgba(0,255,136,0.1)"
                    : "rgba(10,18,30,0.6)",
                  border: `1px solid ${cleared ? "rgba(0,255,136,0.4)" : "rgba(45,75,110,0.3)"}`,
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: cleared ? "#00ff88" : "#2d4b6e",
                    boxShadow: cleared ? "0 0 8px #00ff88" : "none",
                  }}
                />
                <span className="mono" style={{ color: cleared ? "#00ff88" : "#8da3be", fontWeight: 700 }}>
                  {g.sub}
                </span>
                <span className="mono muted" style={{ fontSize: 10 }}>
                  {cleared ? (splitTimes[g.id] ?? "CLEARED") : "PENDING"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
