"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Timer,
  Wifi,
  Zap,
} from "lucide-react";

interface GccStatusBarProps {
  connected: boolean;
  eventCount: number;
  isRunning: boolean;
  activeTeamName?: string;
  teamsCount: number;
  finishedCount: number;
}

export default function GccStatusBar({
  connected,
  eventCount,
  isRunning,
  activeTeamName,
  teamsCount,
  finishedCount,
}: GccStatusBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 20px",
        background: "rgba(4, 8, 14, 0.92)",
        borderBottom: "1px solid rgba(45, 75, 110, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        overflowX: "auto",
        flexWrap: "nowrap",
        position: "sticky",
        top: 0,
        zIndex: 20,
        marginBottom: 8,
      }}
    >
      {/* Brand chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          paddingRight: 12,
          borderRight: "1px solid rgba(45,75,110,0.4)",
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        <Zap size={12} color="#ff6a00" />
        <span
          className="digital"
          style={{ fontSize: 10, color: "#ff6a00", letterSpacing: "0.14em", whiteSpace: "nowrap" }}
        >
          GCC SYSTEM
        </span>
      </div>

      {/* Supabase WS status */}
      <StatusPill
        icon={<Wifi size={11} color={connected ? "#00ff88" : "#ff496b"} />}
        label={connected ? "REALTIME OK" : "WS OFFLINE"}
        color={connected ? "#00ff88" : "#ff496b"}
      />

      <Divider />

      {/* Arena state */}
      <StatusPill
        icon={<Activity size={11} color={isRunning ? "#00f0ff" : "#8da3be"} />}
        label={isRunning ? (activeTeamName ? `ON TRACK: ${activeTeamName}` : "RACE ACTIVE") : "TRACK IDLE"}
        color={isRunning ? "#00f0ff" : "#8da3be"}
        pulse={isRunning}
      />

      <Divider />

      {/* Checkpoint events */}
      <StatusPill
        icon={<CheckCircle2 size={11} color="#ffaa00" />}
        label={`${eventCount} INTERRUPTS`}
        color="#ffaa00"
      />

      <Divider />

      {/* Teams progress */}
      <StatusPill
        icon={<Timer size={11} color="#00f0ff" />}
        label={`${finishedCount}/${teamsCount} RUNS DONE`}
        color="#00f0ff"
      />

      <Divider />

      {/* ESP32 */}
      <StatusPill
        icon={<Cpu size={11} color="#8da3be" />}
        label="ESP32 · 4 GATES ARMED"
        color="#8da3be"
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Live clock */}
      <span
        className="digital"
        style={{
          fontSize: 11,
          color: "#8da3be",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {now.toLocaleTimeString()}
      </span>
    </div>
  );
}

function StatusPill({
  icon,
  label,
  color,
  pulse = false,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        background: `${color}10`,
        border: `1px solid ${color}30`,
        flexShrink: 0,
        position: "relative",
      }}
    >
      {pulse && (
        <span
          style={{
            position: "absolute",
            left: 6,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: "statusPulse 1.6s ease-in-out infinite",
          }}
        />
      )}
      {!pulse && icon}
      <span
        className="mono"
        style={{
          fontSize: 9,
          color: color,
          letterSpacing: "0.08em",
          fontWeight: 600,
          whiteSpace: "nowrap",
          paddingLeft: pulse ? 12 : 0,
        }}
      >
        {label}
      </span>
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateY(-50%) scale(1.4); }
        }
      `}</style>
    </div>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: 1,
        height: 14,
        background: "rgba(45,75,110,0.5)",
        flexShrink: 0,
        margin: "0 2px",
      }}
    />
  );
}
