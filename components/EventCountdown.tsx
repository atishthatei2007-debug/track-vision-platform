"use client";

import { useEffect, useState } from "react";
import { Calendar, Zap } from "lucide-react";

// Set your event date here — NIRMAN 6.0 event date
const EVENT_DATE = new Date("2025-02-15T09:00:00+05:30");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
};

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, passed: false };
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        minWidth: 72,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(8, 15, 26, 0.9)",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          minWidth: 72,
          textAlign: "center",
        }}
      >
        {/* Corner HUD marks */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 8,
            height: 8,
            borderTop: "1.5px solid rgba(0, 240, 255, 0.5)",
            borderLeft: "1.5px solid rgba(0, 240, 255, 0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 8,
            height: 8,
            borderBottom: "1.5px solid rgba(0, 240, 255, 0.5)",
            borderRight: "1.5px solid rgba(0, 240, 255, 0.5)",
          }}
        />
        <span
          className="digital"
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#00f0ff",
            textShadow: "0 0 20px rgba(0, 240, 255, 0.6)",
            lineHeight: 1,
            display: "block",
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.22em",
          color: "#6c84a0",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function EventCountdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const eventDateStr = EVENT_DATE.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        padding: "28px 24px",
        borderRadius: 20,
        background: time.passed
          ? "linear-gradient(135deg, rgba(0, 255, 136, 0.06), rgba(8, 15, 26, 0.9))"
          : "linear-gradient(135deg, rgba(0, 240, 255, 0.04), rgba(8, 15, 26, 0.9))",
        border: `1px solid ${time.passed ? "rgba(0, 255, 136, 0.35)" : "rgba(0, 240, 255, 0.25)"}`,
        backdropFilter: "blur(16px)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Ambient top glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 100,
          background: time.passed
            ? "radial-gradient(ellipse, rgba(0, 255, 136, 0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(0, 240, 255, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "4px 12px",
          borderRadius: 999,
          background: time.passed ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 240, 255, 0.08)",
          border: `1px solid ${time.passed ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 240, 255, 0.25)"}`,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.22em",
          color: time.passed ? "#00ff88" : "#00f0ff",
          marginBottom: 14,
        }}
      >
        <Zap size={10} />
        {time.passed ? "EVENT IS LIVE!" : "COUNTDOWN TO NIRMAN 6.0"}
      </div>

      {time.passed ? (
        <div
          className="digital"
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#00ff88",
            textShadow: "0 0 30px rgba(0, 255, 136, 0.5)",
            marginBottom: 8,
          }}
        >
          COMPETITION IN PROGRESS
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <CountUnit value={time.days} label="Days" />
          <span
            className="digital"
            style={{ fontSize: 28, color: "rgba(0, 240, 255, 0.4)", marginBottom: 20 }}
          >
            :
          </span>
          <CountUnit value={time.hours} label="Hours" />
          <span
            className="digital"
            style={{ fontSize: 28, color: "rgba(0, 240, 255, 0.4)", marginBottom: 20 }}
          >
            :
          </span>
          <CountUnit value={time.minutes} label="Minutes" />
          <span
            className="digital"
            style={{ fontSize: 28, color: "rgba(0, 240, 255, 0.4)", marginBottom: 20 }}
          >
            :
          </span>
          <CountUnit value={time.seconds} label="Seconds" />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "#6c84a0",
        }}
      >
        <Calendar size={12} />
        {eventDateStr}
      </div>
    </div>
  );
}
