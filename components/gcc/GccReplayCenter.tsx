"use client";

import { useState } from "react";
import {
  Activity,
  ChevronRight,
  Clock,
  Gauge,
  Maximize2,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
  Zap,
} from "lucide-react";

interface GccReplayCenterProps {
  videoId?: string;
}

export default function GccReplayCenter({ videoId }: GccReplayCenterProps) {
  const [speed, setSpeed] = useState<number>(1.0);
  const [activeSector, setActiveSector] = useState<number>(1);

  const sectors = [
    { n: 1, name: "SECTOR 1: ACCELERATION", range: "GATE 01 → 02", time: "12.45s", delta: "-0.24s" },
    { n: 2, name: "SECTOR 2: HAIRPIN APEX", range: "GATE 02 → 03", time: "18.32s", delta: "+0.11s" },
    { n: 3, name: "SECTOR 3: S-CURVE & FINISH", range: "GATE 03 → 04", time: "11.58s", delta: "-0.40s" },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Replay Center Header ── */}
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
              background: "rgba(0, 240, 255, 0.12)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <RotateCcw size={18} color="#00f0ff" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              TELEMETRY REPLAY &amp; SECTOR ANALYSIS
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              SLOW-MOTION CHECKPOINT INTERRUPT VERIFICATION · 1000 Hz ESP32 LOGS
            </div>
          </div>
        </div>

        {/* Playback Speed Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono muted" style={{ fontSize: 10 }}>
            SPEED:
          </span>
          {[0.25, 0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`gcc-tab-btn ${speed === s ? "active" : ""}`}
              style={{ fontSize: 11, padding: "5px 10px" }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Replay Screen & Timeline ── */}
      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 1fr)",
          gap: 20,
        }}
      >
        {/* Replay Screen */}
        <div className="gcc-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(6, 12, 20, 0.6)",
              borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
              fontSize: 12,
            }}
          >
            <span className="mono" style={{ color: "#ff6a00", fontWeight: 700 }}>
              REPLAY BUFFER // RUN #TV-01 (FASTEST LAP)
            </span>
            <span className="gcc-tag" style={{ fontSize: 9 }}>
              SPEED {speed}x
            </span>
          </div>

          <div
            style={{
              aspectRatio: "16/9",
              background: "#03060a",
              position: "relative",
              display: "grid",
              placeItems: "center",
            }}
          >
            {videoId ? (
              <iframe
                title="Replay Video Feed"
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 0, width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 32 }}>
                <Activity size={36} color="#00f0ff" style={{ margin: "0 auto 12px" }} />
                <div className="digital" style={{ fontSize: 18, color: "#fff" }}>
                  AWAITING RACE FOOTAGE ARCHIVE
                </div>
                <div className="mono muted" style={{ fontSize: 11, maxWidth: 360, margin: "6px auto 0" }}>
                  Connect YouTube video archive ID or camera capture stream to review optical beam crossings.
                </div>
              </div>
            )}
          </div>

          {/* Interactive Checkpoint Timeline Bar */}
          <div style={{ padding: "16px 20px", background: "rgba(6, 12, 20, 0.85)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }} className="mono muted">
              <span>GATE 01 (START)</span>
              <span>GATE 02 (SPLIT)</span>
              <span>GATE 03 (HAIRPIN)</span>
              <span>GATE 04 (FINISH)</span>
            </div>

            {/* Timeline Progress Track */}
            <div
              style={{
                height: 6,
                background: "rgba(25, 45, 70, 0.6)",
                borderRadius: 4,
                position: "relative",
                margin: "10px 0 14px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  background: "linear-gradient(90deg, #00f0ff, #00ff88 50%, #ff6a00 100%)",
                  borderRadius: 4,
                }}
              />
              {/* Checkpoint Markers on track */}
              {[0, 33, 66, 100].map((pct, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${pct}%`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#080c14",
                    border: "2px solid #00f0ff",
                    boxShadow: "0 0 8px #00f0ff",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
              <span className="mono" style={{ color: "#00ff88" }}>
                ALL 4 BEAMS PASSED IN SEQUENCE
              </span>
              <span className="digital" style={{ color: "#fff", fontWeight: 700 }}>
                LAP TIME: 42.35s
              </span>
            </div>
          </div>
        </div>

        {/* Sector Split Breakdown */}
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
            <strong style={{ fontSize: 15, letterSpacing: "0.06em" }}>SECTOR DELTAS</strong>
            <span className="gcc-tag">OPTICAL TELEMETRY</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {sectors.map((sec) => (
              <div
                key={sec.n}
                onClick={() => setActiveSector(sec.n)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: activeSector === sec.n ? "rgba(255, 106, 0, 0.12)" : "rgba(6, 12, 20, 0.7)",
                  border: `1px solid ${activeSector === sec.n ? "rgba(255, 106, 0, 0.45)" : "rgba(45, 75, 110, 0.3)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ fontSize: 13, color: activeSector === sec.n ? "#ffaa00" : "#fff" }}>
                    {sec.name}
                  </strong>
                  <span
                    className="digital"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: sec.delta.startsWith("-") ? "#00ff88" : "#ff5500",
                    }}
                  >
                    {sec.delta}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }} className="mono muted">
                  <span>{sec.range}</span>
                  <span className="digital" style={{ color: "#00f0ff" }}>
                    {sec.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Marshall Decision Note */}
          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(10, 20, 32, 0.5)",
              border: "1px dashed rgba(45, 75, 110, 0.4)",
              fontSize: 11,
              lineHeight: 1.5,
              color: "#8da3be",
            }}
          >
            <span style={{ color: "#00ff88", fontWeight: 700 }}>RACE STEWARD VERIFICATION:</span> Run TV-01 verified clean. No line cuts, optical timestamps within 0.1ms tolerance.
          </div>
        </div>
      </div>
    </div>
  );
}
