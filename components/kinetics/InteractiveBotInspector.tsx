"use client";

import { useState } from "react";
import { Cpu, Eye, Gauge, Shield, Zap, Sparkles } from "lucide-react";

interface Subsystem {
  id: string;
  name: string;
  category: string;
  specs: string;
  coords: { x: number; y: number };
  description: string;
  accent: string;
}

const SUBSYSTEMS: Subsystem[] = [
  {
    id: "sensors",
    name: "8-Channel QTR-8A Reflectance Array",
    category: "OPTICAL SENSING",
    specs: "8 Phototransistors · 4mm Pitch · 1000Hz Sampling",
    coords: { x: 50, y: 14 },
    description: "High-contrast IR emitter-detector pairs scanning black matte line reflectance. Calibrated for 30mm track width under varying arena ambient lighting.",
    accent: "#00f0ff",
  },
  {
    id: "mcu",
    name: "ESP32-WROOM-32D Dual-Core",
    category: "CORE PROCESSING",
    specs: "240MHz · ADC1 Dedicated Wi-Fi · 520KB SRAM",
    coords: { x: 50, y: 46 },
    description: "Runs the continuous PID closed-loop motor control algorithm while polling laser checkpoint gates and syncing state with the Track Vision server.",
    accent: "#ffaa00",
  },
  {
    id: "motors",
    name: "Dual N20 Micro Metal Gearmotors",
    category: "TRACTION DRIVE",
    specs: "1000 RPM · 6V Rated · High-Traction Neoprene Wheels",
    coords: { x: 22, y: 68 },
    description: "Equipped with magnetic encoders for closed-loop differential thrust. Delivers rapid acceleration out of hairpins and high top-speed along straights.",
    accent: "#00ff88",
  },
  {
    id: "driver",
    name: "TB6612FNG Dual H-Bridge Driver",
    category: "POWER MODULATION",
    specs: "1.2A Continuous · 3.2A Peak · Low RDS(ON)",
    coords: { x: 78, y: 68 },
    description: "High-frequency PWM driver eliminating acoustic motor whine while providing linear torque curves for sharp 90-degree corner recovery.",
    accent: "#ccff00",
  },
  {
    id: "battery",
    name: "3S 450mAh 75C LiPo Power Pack",
    category: "ENERGY SYSTEM",
    specs: "11.1V Nominal · 12.6V Peak · Low-ESR Filtered",
    coords: { x: 50, y: 82 },
    description: "Ultra-compact high-discharge battery paired with an ultra-low dropout 5V/3.3V dual regulator stage to prevent MCU brownouts under peak stall current.",
    accent: "#ff0055",
  },
];

export default function InteractiveBotInspector() {
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystem>(SUBSYSTEMS[0]);

  return (
    <section style={{ marginTop: 28 }}>
      <div
        className="panel hud-panel"
        style={{
          padding: 24,
          background: "radial-gradient(ellipse at center, rgba(10, 20, 36, 0.85) 0%, rgba(4, 8, 14, 0.95) 100%)",
          border: "1px solid rgba(0, 240, 255, 0.35)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.2em" }}>
              TELEMETRY & HARDWARE ANATOMY
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
              <Eye size={20} color="#00f0ff" /> Interactive Bot Subsystem Inspector
            </h2>
          </div>
          <span className="pill" style={{ color: selectedSubsystem.accent, borderColor: selectedSubsystem.accent }}>
            {selectedSubsystem.category}
          </span>
        </div>

        {/* Two-Column Grid: Blueprint Visualizer on Left + Subsystem Specs on Right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(300px, 0.85fr)",
            gap: 22,
            alignItems: "center",
          }}
        >
          {/* Left: Interactive Bot SVG Blueprint with Hotspots */}
          <div
            style={{
              position: "relative",
              height: 380,
              borderRadius: 14,
              background: "radial-gradient(circle at center, rgba(0, 240, 255, 0.08) 0%, rgba(6, 12, 22, 0.8) 70%)",
              border: "1px solid rgba(45, 75, 110, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Tech Grid Pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                pointerEvents: "none",
              }}
            />

            {/* Sci-Fi Bot Blueprint Vector Art */}
            <svg viewBox="0 0 400 400" style={{ width: "85%", height: "85%", filter: "drop-shadow(0 0 16px rgba(0, 240, 255, 0.25))" }}>
              {/* Outer Dimension Outline */}
              <rect x="70" y="40" width="260" height="320" rx="20" fill="none" stroke="rgba(0, 240, 255, 0.25)" strokeDasharray="6,6" />
              
              {/* Carbon Fiber Chassis Base */}
              <polygon points="120,60 280,60 300,100 300,310 270,340 130,340 100,310 100,100" fill="rgba(11, 22, 38, 0.9)" stroke="#00f0ff" strokeWidth="2" />
              
              {/* Front Optical Sensor Array Header */}
              <rect x="130" y="50" width="140" height="24" rx="4" fill="#07111e" stroke="#00ff88" strokeWidth="1.5" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle key={i} cx={145 + i * 15} cy={62} r={3} fill="#00ff88" />
              ))}

              {/* Wheels */}
              <rect x="60" y="220" width="30" height="80" rx="6" fill="#0d1b2a" stroke="#8da3be" strokeWidth="2" />
              <rect x="310" y="220" width="30" height="80" rx="6" fill="#0d1b2a" stroke="#8da3be" strokeWidth="2" />

              {/* Central ESP32 Microcontroller */}
              <rect x="155" y="150" width="90" height="75" rx="6" fill="#132337" stroke="#ffaa00" strokeWidth="1.5" />
              <text x="200" y="192" fill="#ffaa00" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                ESP32 MCU
              </text>

              {/* Motor Driver */}
              <rect x="250" y="235" width="40" height="40" rx="4" fill="#101e30" stroke="#ccff00" strokeWidth="1.5" />
              <text x="270" y="260" fill="#ccff00" fontSize="9" fontFamily="monospace" textAnchor="middle">
                TB6612
              </text>

              {/* Left Motor Housing */}
              <rect x="110" y="235" width="40" height="40" rx="4" fill="#101e30" stroke="#00ff88" strokeWidth="1.5" />
              <text x="130" y="260" fill="#00ff88" fontSize="9" fontFamily="monospace" textAnchor="middle">
                N20-L
              </text>

              {/* Battery Pack */}
              <rect x="145" y="265" width="110" height="60" rx="6" fill="#1a111b" stroke="#ff0055" strokeWidth="1.5" />
              <text x="200" y="300" fill="#ff0055" fontSize="10" fontFamily="monospace" textAnchor="middle">
                3S LiPo 11.1V
              </text>
            </svg>

            {/* Interactive Hotspot Buttons */}
            {SUBSYSTEMS.map((sub) => {
              const isSelected = selectedSubsystem.id === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubsystem(sub)}
                  style={{
                    position: "absolute",
                    left: `${sub.coords.x}%`,
                    top: `${sub.coords.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: isSelected ? 28 : 22,
                    height: isSelected ? 28 : 22,
                    borderRadius: "50%",
                    background: sub.accent,
                    border: "2px solid #fff",
                    boxShadow: `0 0 ${isSelected ? "20px" : "10px"} ${sub.accent}`,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: 10,
                  }}
                  title={sub.name}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#04080e",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Selected Subsystem Detail Card */}
          <div
            style={{
              padding: 22,
              borderRadius: 14,
              background: "rgba(8, 16, 28, 0.8)",
              border: `1px solid ${selectedSubsystem.accent}55`,
              boxShadow: `0 8px 32px -10px ${selectedSubsystem.accent}33`,
              transition: "border 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            <div className="mono" style={{ fontSize: 11, color: selectedSubsystem.accent, letterSpacing: "0.15em", marginBottom: 6 }}>
              {selectedSubsystem.category} // ANATOMY
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#fff" }}>
              {selectedSubsystem.name}
            </h3>
            <div
              className="mono"
              style={{
                fontSize: 12,
                color: selectedSubsystem.accent,
                background: "rgba(5, 11, 20, 0.7)",
                padding: "8px 12px",
                borderRadius: 8,
                marginTop: 12,
                border: "1px solid rgba(45, 75, 110, 0.3)",
              }}
            >
              {selectedSubsystem.specs}
            </div>

            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 14 }}>
              {selectedSubsystem.description}
            </p>

            {/* Quick Switch Subsystem Buttons */}
            <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUBSYSTEMS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubsystem(s)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: selectedSubsystem.id === s.id ? `${s.accent}22` : "rgba(10, 18, 30, 0.6)",
                    border: `1px solid ${selectedSubsystem.id === s.id ? s.accent : "rgba(45, 75, 110, 0.3)"}`,
                    color: selectedSubsystem.id === s.id ? "#fff" : "#8da3be",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  {s.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
