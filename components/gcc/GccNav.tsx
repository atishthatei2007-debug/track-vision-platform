"use client";

import Link from "next/link";
import {
  Activity,
  Award,
  BarChart3,
  Cpu,
  Radio,
  RotateCcw,
  Shield,
  Users,
  Zap,
} from "lucide-react";

export type GccTab =
  | "home"
  | "live"
  | "overview"
  | "teams"
  | "leaderboard"
  | "replay"
  | "hardware"
  | "reports";

interface GccNavProps {
  activeTab: GccTab;
  onSelectTab: (tab: GccTab) => void;
  connected: boolean;
  activeRunCount: number;
}

export default function GccNav({
  activeTab,
  onSelectTab,
  connected,
  activeRunCount,
}: GccNavProps) {
  return (
    <nav
      className="no-print"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(6, 11, 18, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(45, 75, 110, 0.35)",
        padding: "10px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Brand Identity — Click returns to Opening Hero */}
        <div
          onClick={() => onSelectTab("home")}
          role="button"
          tabIndex={0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            userSelect: "none",
          }}
          title="Return to Track Vision Opening Showcase"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "radial-gradient(circle, #1a2c42 0%, #060e18 100%)",
              border: "1px solid rgba(255, 106, 0, 0.5)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 16px rgba(255, 106, 0, 0.25)",
              overflow: "hidden",
            }}
          >
            <img
              src="/track-vision-logo.png"
              alt="GCC Track Vision"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="digital"
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  color: "#ffffff",
                }}
              >
                GCC <span style={{ color: "#ff6a00" }}>SMART RACE CONTROL</span>
              </span>
              <span className="gcc-tag" style={{ fontSize: 9, padding: "2px 6px" }}>
                F1 TELEMETRY
              </span>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "#8da3be",
                letterSpacing: "0.12em",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              MODULE: <span style={{ color: "#00f0ff" }}>TRACK VISION</span> // NIRMAN 6.0
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Smooth Interaction */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            overflowX: "auto",
            padding: "4px 0",
          }}
        >
          {/* 1. Opening Showcase / Hero */}
          <button
            onClick={() => onSelectTab("home")}
            className={`gcc-tab-btn ${activeTab === "home" ? "active" : ""}`}
            title="Track Vision 3D Interactive Opening"
          >
            <Zap size={14} color={activeTab === "home" ? "#ff6a00" : "#8da3be"} />
            <span>Showcase</span>
          </button>

          {/* 2. Live Arena */}
          <button
            onClick={() => onSelectTab("live")}
            className={`gcc-tab-btn ${activeTab === "live" ? "active" : ""}`}
            title="Live Competition Arena & Millisecond Timing"
          >
            <Radio size={14} color={activeTab === "live" ? "#ff6a00" : "#8da3be"} />
            <span>Live Arena</span>
            {activeRunCount > 0 && <span className="live-beacon live-dot-green" />}
          </button>

          {/* 3. Overview */}
          <button
            onClick={() => onSelectTab("overview")}
            className={`gcc-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            title="GCC Platform Status & Telemetry Overview"
          >
            <Activity size={14} color={activeTab === "overview" ? "#ff6a00" : "#8da3be"} />
            <span>Overview</span>
          </button>

          {/* 4. Teams */}
          <button
            onClick={() => onSelectTab("teams")}
            className={`gcc-tab-btn ${activeTab === "teams" ? "active" : ""}`}
            title="Registered Robotics Teams Directory"
          >
            <Users size={14} color={activeTab === "teams" ? "#ff6a00" : "#8da3be"} />
            <span>Teams</span>
          </button>

          {/* 5. Leaderboard */}
          <button
            onClick={() => onSelectTab("leaderboard")}
            className={`gcc-tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
            title="Official Standings & Fastest Times"
          >
            <Award size={14} color={activeTab === "leaderboard" ? "#ff6a00" : "#8da3be"} />
            <span>Leaderboard</span>
          </button>

          {/* 6. Replay Center */}
          <button
            onClick={() => onSelectTab("replay")}
            className={`gcc-tab-btn ${activeTab === "replay" ? "active" : ""}`}
            title="Race Playback & Multi-Angle Video"
          >
            <RotateCcw size={14} color={activeTab === "replay" ? "#ff6a00" : "#8da3be"} />
            <span>Replay Center</span>
          </button>

          {/* 7. Hardware Monitor */}
          <button
            onClick={() => onSelectTab("hardware")}
            className={`gcc-tab-btn ${activeTab === "hardware" ? "active" : ""}`}
            title="ESP32 4-Gate Laser Array Diagnostics"
          >
            <Cpu size={14} color={activeTab === "hardware" ? "#ff6a00" : "#8da3be"} />
            <span>Hardware</span>
          </button>

          {/* 8. Reports */}
          <button
            onClick={() => onSelectTab("reports")}
            className={`gcc-tab-btn ${activeTab === "reports" ? "active" : ""}`}
            title="Official Results & PDF Generation"
          >
            <BarChart3 size={14} color={activeTab === "reports" ? "#ff6a00" : "#8da3be"} />
            <span>Reports</span>
          </button>
        </div>

        {/* Right Status & Race Control Link */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: connected ? "#00ff88" : "#8da3be",
            }}
          >
            <span className={`live-beacon ${connected ? "live-dot-green" : ""}`} />
            <span style={{ fontSize: 10, letterSpacing: "0.08em" }}>
              {connected ? "LIVE TELEMETRY" : "STANDBY"}
            </span>
          </div>

          <Link
            href="/admin"
            className="btn btn-primary"
            style={{
              fontSize: 11,
              padding: "6px 14px",
              gap: 6,
              letterSpacing: "0.08em",
            }}
          >
            <Shield size={13} />
            <span>Race Control</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
