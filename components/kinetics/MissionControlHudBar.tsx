"use client";

import { useEffect, useState } from "react";
import { Activity, Compass, Cpu, Radio, Shield } from "lucide-react";

interface MissionControlHudBarProps {
  checksCount?: number;
  totalGates?: number;
  activeRunTeam?: string | null;
  isRunning?: boolean;
}

export default function MissionControlHudBar({
  checksCount = 0,
  totalGates = 4,
  activeRunTeam = null,
  isRunning = false,
}: MissionControlHudBarProps) {
  const [fps, setFps] = useState(60);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    // Dynamic FPS Calculation
    let lastTime = performance.now();
    let frames = 0;
    let animId: number;

    const calcFps = (time: number) => {
      frames++;
      if (time - lastTime >= 1000) {
        setFps(Math.min(Math.round((frames * 1000) / (time - lastTime)), 60));
        frames = 0;
        lastTime = time;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);

    // Scroll Progress Tracker
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollPct(Math.round((window.scrollY / total) * 100));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <aside
      className="no-print"
      aria-label="Mission Control Telemetry HUD"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: "rgba(5, 10, 18, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0, 240, 255, 0.28)",
        padding: "6px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "#8da3be",
      }}
    >
      {/* Left: Geolocation & Frequency Telemetry */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#7cefff" }}>
          <Compass size={13} color="#00f0ff" />
          <span>20.3533° N, 85.8266° E // SILICON UNIV</span>
        </div>
        <span style={{ color: "rgba(45, 75, 110, 0.6)" }}>|</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Cpu size={13} color="#00ff88" />
          <span>ESP32 ADC1 // 1000Hz</span>
        </div>
      </div>

      {/* Center: Live Sector Spline Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 260 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", color: isRunning ? "#ffaa00" : "#6c84a0" }}>
          {isRunning ? `RACING: ${activeRunTeam ?? "BOT"}` : "STANDBY SECTOR"}
        </span>
        <div
          style={{
            flex: 1,
            height: 4,
            background: "rgba(30, 50, 75, 0.5)",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${(checksCount / totalGates) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00f0ff, #ccff00)",
              boxShadow: "0 0 10px #00f0ff",
              transition: "width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
        <span style={{ color: "#00f0ff", fontSize: 10 }}>
          {checksCount}/{totalGates}
        </span>
      </div>

      {/* Right: Engine FPS & Scroll Orbit Gauge */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={13} color={fps >= 55 ? "#00ff88" : "#ffaa00"} />
          <span>{fps} FPS</span>
        </div>
        <span style={{ color: "rgba(45, 75, 110, 0.6)" }}>|</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#f0f6ff" }}>
          <Radio size={13} color="#ccff00" />
          <span>PAGE: {scrollPct}%</span>
        </div>
      </div>
    </aside>
  );
}
