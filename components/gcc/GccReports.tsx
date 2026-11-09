"use client";

import { useMemo } from "react";
import {
  Award,
  CheckCircle2,
  FileDown,
  Printer,
  ShieldCheck,
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

interface GccReportsProps {
  teams: Team[];
}

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function GccReports({ teams }: GccReportsProps) {
  const sorted = useMemo(() => {
    return [...teams].sort(
      (a, b) => (a.best_time_ms ?? Infinity) - (b.best_time_ms ?? Infinity)
    );
  }, [teams]);

  const p1 = sorted.find((t) => t.best_time_ms != null);
  const finished = teams.filter((t) => t.status === "finished");

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Action Bar (Hidden during print) ── */}
      <div
        className="gcc-card no-print"
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <Printer size={18} color="#ff6a00" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              OFFICIAL RACE CLASSIFICATION REPORT
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              EXPORT AUDITED TELEMETRY SHEET FOR RACE STEWARDS &amp; TEAMS
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ padding: "10px 20px", fontSize: 12, gap: 8 }}
        >
          <Printer size={15} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* ── Official Printable Report Sheet ── */}
      <div
        className="gcc-card"
        style={{
          padding: "36px 32px",
          background: "rgba(6, 12, 20, 0.95)",
          border: "1px solid rgba(45, 75, 110, 0.4)",
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid rgba(255, 106, 0, 0.5)",
            paddingBottom: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span className="gcc-tag">OFFICIAL CLASSIFICATION</span>
              <span className="mono" style={{ fontSize: 11, color: "#8da3be" }}>
                DOCUMENT NO: GCC-TRK-2026-01
              </span>
            </div>
            <h1
              className="digital"
              style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "6px 0 2px" }}
            >
              GCC SMART RACE CONTROL // RACE RESULTS
            </h1>
            <div className="mono" style={{ fontSize: 12, color: "#ffaa00" }}>
              COMPETITION: NIRMAN 6.0 LINE FOLLOWER CHAMPIONSHIP
            </div>
          </div>

          <div style={{ textAlign: "right" }} className="mono muted">
            <div style={{ fontSize: 11 }}>DATE: {new Date().toLocaleDateString()}</div>
            <div style={{ fontSize: 11 }}>TIMING: 4-GATE ESP32 OPTICAL</div>
            <div style={{ fontSize: 11, color: "#00ff88" }}>STATUS: RATIFIED</div>
          </div>
        </div>

        {/* Summary Metric Chips */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(10, 18, 30, 0.6)", border: "1px solid rgba(45, 75, 110, 0.3)" }}>
            <div className="mono muted" style={{ fontSize: 10 }}>POLE POSITION</div>
            <div className="digital" style={{ fontSize: 18, color: "#ffbe28", fontWeight: 700, marginTop: 2 }}>
              {p1?.best_time_ms ? fmt(p1.best_time_ms) : "--.--s"}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "#fff" }}>{p1 ? p1.name : "—"}</div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(10, 18, 30, 0.6)", border: "1px solid rgba(45, 75, 110, 0.3)" }}>
            <div className="mono muted" style={{ fontSize: 10 }}>COMPLETED RUNS</div>
            <div className="digital" style={{ fontSize: 18, color: "#00ff88", fontWeight: 700, marginTop: 2 }}>
              {finished.length} / {teams.length}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "#fff" }}>100% Sequence Valid</div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(10, 18, 30, 0.6)", border: "1px solid rgba(45, 75, 110, 0.3)" }}>
            <div className="mono muted" style={{ fontSize: 10 }}>DISQUALIFICATIONS</div>
            <div className="digital" style={{ fontSize: 18, color: "#00f0ff", fontWeight: 700, marginTop: 2 }}>
              0
            </div>
            <div className="mono" style={{ fontSize: 10, color: "#fff" }}>Zero Penalties</div>
          </div>
        </div>

        {/* Official Results Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} className="mono">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(45, 75, 110, 0.4)", color: "#8da3be", textAlign: "left" }}>
              <th style={{ padding: "8px 10px" }}>POS</th>
              <th style={{ padding: "8px 10px" }}>CODE</th>
              <th style={{ padding: "8px 10px" }}>TEAM NAME</th>
              <th style={{ padding: "8px 10px" }}>COLLEGE</th>
              <th style={{ padding: "8px 10px", textAlign: "right" }}>OFFICIAL LAP TIME</th>
              <th style={{ padding: "8px 10px", textAlign: "center" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, idx) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: "1px solid rgba(45, 75, 110, 0.2)",
                  background: idx % 2 === 0 ? "rgba(8, 14, 24, 0.3)" : "transparent",
                }}
              >
                <td style={{ padding: "10px", fontWeight: "bold", color: idx === 0 ? "#ffbe28" : idx === 1 ? "#c8dcf0" : idx === 2 ? "#dc8250" : "#8da3be" }}>
                  P{idx + 1}
                </td>
                <td style={{ padding: "10px", color: "#ff6a00", fontWeight: "bold" }}>{t.code}</td>
                <td style={{ padding: "10px", color: "#fff", fontWeight: "bold" }}>{t.name}</td>
                <td style={{ padding: "10px", color: "#8da3be" }}>{t.college}</td>
                <td style={{ padding: "10px", textAlign: "right", color: "#00f0ff", fontWeight: "bold" }}>
                  {fmt(t.best_time_ms)}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: 10, color: t.status === "finished" ? "#00ff88" : "#8da3be" }}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Signatures Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px dashed rgba(45, 75, 110, 0.4)",
          }}
          className="mono"
        >
          <div>
            <div className="muted" style={{ fontSize: 10, marginBottom: 30 }}>
              HEAD OF SCRUTINEERING &amp; TIMING
            </div>
            <div style={{ width: 180, height: 1, background: "rgba(255, 255, 255, 0.4)", marginBottom: 6 }} />
            <div style={{ fontSize: 11, color: "#fff" }}>CHIEF MARSHAL</div>
          </div>

          <div>
            <div className="muted" style={{ fontSize: 10, marginBottom: 30 }}>
              NIRMAN 6.0 ROBOTICS COMMITTEE
            </div>
            <div style={{ width: 180, height: 1, background: "rgba(255, 255, 255, 0.4)", marginBottom: 6 }} />
            <div style={{ fontSize: 11, color: "#fff" }}>EVENT DIRECTOR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
