"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShieldAlert, Zap } from "lucide-react";

interface MechanicalBlastDoorsProps {
  children: ReactNode;
}

export default function MechanicalBlastDoors({ children }: MechanicalBlastDoorsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openRatio, setOpenRatio] = useState(0); // 0 = fully closed, 1 = fully open

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Start opening when container top reaches 80% of viewport, finish opening when top reaches 20%
      const start = windowH * 0.85;
      const end = windowH * 0.2;
      const progress = (start - rect.top) / (start - end);
      const clamped = Math.max(0, Math.min(1, progress));

      setOpenRatio(clamped);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isFullyOpen = openRatio >= 0.98;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: 32,
      }}
    >
      {/* Revealed Content Behind the Doors */}
      <div
        style={{
          opacity: 0.3 + openRatio * 0.7,
          transform: `scale(${0.96 + openRatio * 0.04})`,
          transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
        }}
      >
        {children}
      </div>

      {/* Mechanical Blast Doors Overlay (Slides open horizontally) */}
      {!isFullyOpen && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 30,
            display: "flex",
          }}
        >
          {/* Left Door Half */}
          <div
            style={{
              width: "50%",
              height: "100%",
              background: "linear-gradient(90deg, #070d18 0%, #0d1828 95%, #00f0ff 100%)",
              borderRight: "2px solid #00f0ff",
              boxShadow: "10px 0 30px rgba(0, 240, 255, 0.35)",
              transform: `translateX(-${openRatio * 105}%)`,
              transition: "transform 0.08s linear",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingRight: 30,
              position: "relative",
            }}
          >
            {/* Caution stripes & Hazard Plate */}
            <div
              style={{
                background: "repeating-linear-gradient(45deg, #111e33, #111e33 10px, #ffaa00 10px, #ffaa00 20px)",
                height: 12,
                width: 140,
                marginBottom: 16,
                borderRadius: 2,
                opacity: 0.85,
              }}
            />
            <div className="digital" style={{ fontSize: 20, color: "#fff", letterSpacing: "0.1em" }}>
              ARENA SECTOR A
            </div>
            <div className="mono" style={{ fontSize: 11, color: "#00f0ff", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={13} color="#00f0ff" />
              <span>BLAST SHIELD HYDRAULIC</span>
            </div>
          </div>

          {/* Right Door Half */}
          <div
            style={{
              width: "50%",
              height: "100%",
              background: "linear-gradient(270deg, #070d18 0%, #0d1828 95%, #00f0ff 100%)",
              borderLeft: "2px solid #00f0ff",
              boxShadow: "-10px 0 30px rgba(0, 240, 255, 0.35)",
              transform: `translateX(${openRatio * 105}%)`,
              transition: "transform 0.08s linear",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingLeft: 30,
              position: "relative",
            }}
          >
            {/* Caution stripes & Hazard Plate */}
            <div
              style={{
                background: "repeating-linear-gradient(45deg, #111e33, #111e33 10px, #ffaa00 10px, #ffaa00 20px)",
                height: 12,
                width: 140,
                marginBottom: 16,
                borderRadius: 2,
                opacity: 0.85,
              }}
            />
            <div className="digital" style={{ fontSize: 20, color: "#fff", letterSpacing: "0.1em" }}>
              SECTOR B LOCKED
            </div>
            <div className="mono" style={{ fontSize: 11, color: "#00ff88", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={13} color="#00ff88" />
              <span>ESP32 OPTICAL STATUS: DISARMING</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
