"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Gauge, Radio, Wind, Zap } from "lucide-react";

interface FastLfrPreloaderTrackProps {
  progress: number; // 0 to 100
}

/**
 * High-Speed Line Follower Robot (LFR) Component
 * Detailed top-down representation of a competition suction LFR (Spirit/Mark 2 class):
 * - Monolithic PCB chassis with gold trace accents
 * - Front ARC-8 analog IR sensor array with scanning optical beams
 * - Central high-speed suction downforce impeller with spinning vortex
 * - Dual N20 motors and high-traction silicone racing wheels
 * - Micro-PID steering wobble for authentic 3 m/s line-lock dynamics
 */
export function FastLfrBot({
  isRacing = true,
  scale = 1,
}: {
  isRacing?: boolean;
  scale?: number;
}) {
  return (
    <motion.div
      style={{
        width: 72 * scale,
        height: 38 * scale,
        position: "relative",
        display: "grid",
        placeItems: "center",
        transformOrigin: "center center",
      }}
      animate={
        isRacing
          ? {
              y: [-1, 1.2, -0.8, 1, -1],
              rotate: [-1.8, 1.5, -1.2, 1.8, -1.8],
            }
          : {}
      }
      transition={{
        duration: 0.18,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {/* ── Aerodynamic Suction Exhaust & Speed Trail ── */}
      <div
        style={{
          position: "absolute",
          left: -48 * scale,
          top: "50%",
          transform: "translateY(-50%)",
          width: 54 * scale,
          height: 18 * scale,
          background:
            "linear-gradient(to right, transparent, rgba(255, 106, 0, 0.15) 40%, rgba(255, 170, 0, 0.75) 90%, #ffffff 100%)",
          filter: "blur(3px)",
          borderRadius: 999,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -26 * scale,
          top: "50%",
          transform: "translateY(-50%)",
          width: 28 * scale,
          height: 8 * scale,
          background:
            "linear-gradient(to right, transparent, rgba(0, 240, 255, 0.6) 70%, #ffffff 100%)",
          filter: "blur(1.5px)",
          borderRadius: 999,
          pointerEvents: "none",
        }}
      />

      {/* ── High-Traction N20 Silicone Wheels (Top & Bottom) ── */}
      {/* Top Left Wheel */}
      <div
        style={{
          position: "absolute",
          left: 14 * scale,
          top: -2 * scale,
          width: 22 * scale,
          height: 7 * scale,
          borderRadius: 3 * scale,
          background: "linear-gradient(180deg, #10141a 0%, #303846 50%, #10141a 100%)",
          border: "1px solid rgba(255, 106, 0, 0.8)",
          boxShadow: "0 0 8px rgba(255, 106, 0, 0.6)",
        }}
      />
      {/* Bottom Left Wheel */}
      <div
        style={{
          position: "absolute",
          left: 14 * scale,
          bottom: -2 * scale,
          width: 22 * scale,
          height: 7 * scale,
          borderRadius: 3 * scale,
          background: "linear-gradient(180deg, #10141a 0%, #303846 50%, #10141a 100%)",
          border: "1px solid rgba(255, 106, 0, 0.8)",
          boxShadow: "0 0 8px rgba(255, 106, 0, 0.6)",
        }}
      />

      {/* ── Monolithic PCB Airframe / Chassis Body ── */}
      <div
        style={{
          width: 58 * scale,
          height: 28 * scale,
          borderRadius: 6 * scale,
          background: "linear-gradient(135deg, #070d14 0%, #111a26 50%, #080f18 100%)",
          border: "1px solid rgba(0, 240, 255, 0.6)",
          boxShadow:
            "0 0 16px rgba(0, 240, 255, 0.3), inset 0 0 8px rgba(255, 106, 0, 0.25)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${4 * scale}px`,
        }}
      >
        {/* PCB Copper Traces Accents */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(90deg, rgba(255,170,0,0.15) 1px, transparent 1px), linear-gradient(180deg, rgba(255,170,0,0.15) 1px, transparent 1px)",
            backgroundSize: `${6 * scale}px ${6 * scale}px`,
            opacity: 0.5,
          }}
        />

        {/* Rear Battery & MCU Block */}
        <div
          style={{
            width: 14 * scale,
            height: 18 * scale,
            borderRadius: 2 * scale,
            background: "linear-gradient(180deg, #152233 0%, #09111c 100%)",
            border: "1px solid rgba(255, 106, 0, 0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 4 * scale,
              height: 4 * scale,
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 6px #00ff88",
            }}
          />
        </div>

        {/* Central High-Speed Suction Impeller Unit */}
        <div
          style={{
            width: 20 * scale,
            height: 20 * scale,
            borderRadius: "50%",
            background: "radial-gradient(circle, #081626 0%, #040910 100%)",
            border: "1.5px solid #ffaa00",
            boxShadow:
              "0 0 12px rgba(255, 170, 0, 0.8), inset 0 0 8px rgba(0, 240, 255, 0.8)",
            display: "grid",
            placeItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Spinning Impeller Blades */}
          <motion.div
            style={{
              width: 14 * scale,
              height: 14 * scale,
              position: "relative",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.12,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: 2 * scale,
                height: 14 * scale,
                background: "linear-gradient(180deg, #ffffff 0%, #00f0ff 100%)",
                transform: "translateX(-50%)",
                borderRadius: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: 14 * scale,
                height: 2 * scale,
                background: "linear-gradient(90deg, #ffffff 0%, #ffaa00 100%)",
                transform: "translateY(-50%)",
                borderRadius: 1,
              }}
            />
          </motion.div>
          {/* Suction Core Vortex */}
          <div
            style={{
              position: "absolute",
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 8px #00f0ff, 0 0 14px #ff6a00",
            }}
          />
        </div>

        {/* Front Power Distribution Header */}
        <div
          style={{
            width: 8 * scale,
            height: 18 * scale,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 3 * scale,
              height: 3 * scale,
              borderRadius: "50%",
              background: "#ff3366",
              boxShadow: "0 0 4px #ff3366",
            }}
          />
          <div
            style={{
              width: 3 * scale,
              height: 3 * scale,
              borderRadius: "50%",
              background: "#00f0ff",
              boxShadow: "0 0 4px #00f0ff",
            }}
          />
        </div>
      </div>

      {/* ── Front ARC-8 Analog IR Sensor Array Bar ── */}
      <div
        style={{
          position: "absolute",
          right: 2 * scale,
          top: "50%",
          transform: "translateY(-50%)",
          width: 8 * scale,
          height: 34 * scale,
          borderRadius: 2 * scale,
          background: "#0b1622",
          border: "1px solid rgba(0, 240, 255, 0.9)",
          boxShadow: "0 0 10px rgba(0, 240, 255, 0.6)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${2 * scale}px 0`,
          zIndex: 3,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 2.5 * scale,
              height: 2.5 * scale,
              borderRadius: "50%",
              background: i === 3 || i === 4 ? "#00f0ff" : "#ffaa00",
              boxShadow:
                i === 3 || i === 4
                  ? "0 0 6px #00f0ff, 0 0 10px #ffffff"
                  : "0 0 4px #ffaa00",
            }}
          />
        ))}
      </div>

      {/* ── Forward IR Scanning Beam Projection onto Track Line ── */}
      <div
        style={{
          position: "absolute",
          right: -42 * scale,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44 * scale,
          height: 30 * scale,
          background:
            "radial-gradient(ellipse at left, rgba(0, 240, 255, 0.6) 0%, rgba(0, 240, 255, 0.15) 50%, transparent 80%)",
          clipPath: "polygon(0% 30%, 100% 0%, 100% 100%, 0% 70%)",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 8px #00f0ff)",
        }}
      />
    </motion.div>
  );
}

/**
 * Supersonic Ghost Flyby Bot that streaks across screen (TechGeeks Style)
 */
export function FlybyStreakBot({
  top,
  delay,
  speed = 1.1,
  direction = "right",
}: {
  top: string;
  delay: number;
  speed?: number;
  direction?: "right" | "left";
}) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top,
        left: direction === "right" ? "-150px" : "calc(100% + 150px)",
        pointerEvents: "none",
        zIndex: 5,
        opacity: 0.75,
      }}
      animate={{
        x: direction === "right" ? ["0vw", "130vw"] : ["0vw", "-130vw"],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        repeatDelay: delay,
        ease: [0.22, 1, 0.36, 1], // sudden sprint acceleration
      }}
    >
      <div style={{ transform: direction === "left" ? "scaleX(-1)" : "none" }}>
        <FastLfrBot isRacing scale={0.7} />
      </div>
    </motion.div>
  );
}

/**
 * Full 4-Gate Preloader Circuit Track
 */
export default function FastLfrPreloaderTrack({
  progress,
}: FastLfrPreloaderTrackProps) {
  // Checkpoint hit states
  const gate1Passed = progress >= 8;
  const gate2Passed = progress >= 38;
  const gate3Passed = progress >= 72;
  const gate4Passed = progress >= 96;

  // Real-time speed calculation (from 1.80 m/s up to 3.25 m/s)
  const speedDisplay = useMemo(() => {
    const base = 1.8 + (progress / 100) * 1.45;
    const jitter = (Math.sin(progress * 1.5) * 0.08).toFixed(2);
    return (base + parseFloat(jitter)).toFixed(2);
  }, [progress]);

  // Gate label status
  const sectorStatus = useMemo(() => {
    if (progress < 8) return "STAGING GRID · READY";
    if (progress < 38) return "SECTOR 01 SPRINT · GATE 01 CLEARED";
    if (progress < 72) return "SECTOR 02 HAIRPIN · GATE 02 CLEARED";
    if (progress < 96) return "FINAL CHICANE · GATE 03 CLEARED";
    return "GATE 04 FINISH LINE · RECORD LAP!";
  }, [progress]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      {/* ── Race Circuit Track Box ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 64,
          borderRadius: 14,
          background: "rgba(6, 11, 20, 0.8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(45, 75, 110, 0.45)",
          boxShadow:
            "0 6px 24px rgba(0, 0, 0, 0.85), inset 0 0 20px rgba(0, 240, 255, 0.08)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Track Texture Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(90deg, rgba(45, 75, 110, 0.15) 1px, transparent 1px), linear-gradient(180deg, rgba(45, 75, 110, 0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.6,
          }}
        />

        {/* ── Central White Line (The Competition Guide Line) ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: 6,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.4) 0%, #ffffff 50%, rgba(255,255,255,0.4) 100%)",
            boxShadow:
              "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.5)",
          }}
        />

        {/* ── Progress Fill Glow (The active traversed sector) ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, rgba(0, 240, 255, 0.05) 0%, rgba(255, 106, 0, 0.15) 80%, rgba(255, 170, 0, 0.28) 100%)",
            borderRight: "2px solid #ffaa00",
            boxShadow: "0 0 25px rgba(255, 106, 0, 0.6)",
            transition: "width 25ms linear",
            pointerEvents: "none",
          }}
        />

        {/* ── 4 Laser Checkpoints (ESP32 Timing Gates) ── */}
        {[
          { id: 1, pct: 8, label: "CP-01", passed: gate1Passed, name: "START" },
          { id: 2, pct: 38, label: "CP-02", passed: gate2Passed, name: "SPLIT 1" },
          { id: 3, pct: 72, label: "CP-03", passed: gate3Passed, name: "HAIRPIN" },
          { id: 4, pct: 96, label: "CP-04", passed: gate4Passed, name: "FINISH" },
        ].map((gate) => (
          <div
            key={gate.id}
            style={{
              position: "absolute",
              left: `${gate.pct}%`,
              top: 0,
              bottom: 0,
              width: 18,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 0",
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            {/* Top Laser Emitter Post */}
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: gate.passed ? "#00ff88" : "rgba(255, 106, 0, 0.6)",
                boxShadow: gate.passed
                  ? "0 0 10px #00ff88, 0 0 20px #00ff88"
                  : "0 0 6px rgba(255, 106, 0, 0.5)",
                transition: "all 0.2s ease",
              }}
            />

            {/* Vertical Laser Beam Tripwire */}
            <div
              style={{
                width: gate.passed ? 2.5 : 1,
                height: "100%",
                background: gate.passed
                  ? "linear-gradient(180deg, #00ff88 0%, #00f0ff 50%, #00ff88 100%)"
                  : "linear-gradient(180deg, rgba(255,106,0,0.3) 0%, rgba(255,170,0,0.6) 50%, rgba(255,106,0,0.3) 100%)",
                boxShadow: gate.passed
                  ? "0 0 12px #00ff88, 0 0 20px #00f0ff"
                  : "0 0 4px rgba(255,106,0,0.4)",
                transition: "all 0.2s ease",
              }}
            />

            {/* Bottom Laser Receiver Post */}
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: gate.passed ? "#00ff88" : "rgba(255, 106, 0, 0.6)",
                boxShadow: gate.passed
                  ? "0 0 10px #00ff88, 0 0 20px #00ff88"
                  : "0 0 6px rgba(255, 106, 0, 0.5)",
                transition: "all 0.2s ease",
              }}
            />

            {/* Checkpoint Name Tag */}
            <div
              style={{
                position: "absolute",
                top: -16,
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "0.08em",
                color: gate.passed ? "#00ff88" : "#8da3be",
                fontWeight: 700,
                whiteSpace: "nowrap",
                textShadow: "0 1px 4px rgba(0,0,0,0.9)",
              }}
            >
              {gate.label}
            </div>
          </div>
        ))}

        {/* ── Active High-Speed Racing LFR Bot ── */}
        <div
          style={{
            position: "absolute",
            left: `calc(${progress}% - 32px)`,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            transition: "left 25ms linear",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.9))",
          }}
        >
          <FastLfrBot isRacing scale={0.88} />
        </div>
      </div>

      {/* ── Real-Time Bot Telemetry HUD Strip ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(8, 14, 24, 0.65)",
          border: "1px solid rgba(45, 75, 110, 0.3)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
        }}
      >
        {/* Speed Telemetry */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Gauge size={13} color="#00f0ff" />
          <span style={{ color: "#8da3be" }}>VELOCITY:</span>
          <span
            className="digital"
            style={{
              color: "#00f0ff",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.05em",
            }}
          >
            {speedDisplay} m/s
          </span>
        </div>

        {/* Suction Downforce Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Wind size={13} color="#ffaa00" />
          <span style={{ color: "#8da3be" }}>DOWNFORCE:</span>
          <span
            style={{
              color: "#ffaa00",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            600g SUCTION ACTIVE
          </span>
        </div>

        {/* Active Sector / Gate Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Radio size={13} color={gate4Passed ? "#00ff88" : "#ff5500"} />
          <span style={{ color: "#8da3be" }}>GATE:</span>
          <span
            style={{
              color: gate4Passed ? "#00ff88" : "#f0f6ff",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {sectorStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
