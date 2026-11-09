"use client";

import {
  Activity,
  CheckCircle2,
  Cpu,
  Flame,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  Zap,
} from "lucide-react";

interface GccHardwareMonitorProps {
  connected: boolean;
  eventCount: number;
}

export default function GccHardwareMonitor({
  connected,
  eventCount,
}: GccHardwareMonitorProps) {
  const gates = [
    {
      id: 1,
      name: "GATE 01 - START LINE",
      pin: "GPIO 32",
      adc: "ADC1_CH4",
      status: "ARMED",
      type: "Optical Laser Cut",
      latency: "< 0.8ms",
    },
    {
      id: 2,
      name: "GATE 02 - SECTOR 1 SPLIT",
      pin: "GPIO 33",
      adc: "ADC1_CH5",
      status: "ARMED",
      type: "Optical Laser Cut",
      latency: "< 0.8ms",
    },
    {
      id: 3,
      name: "GATE 03 - HAIRPIN APEX",
      pin: "GPIO 34",
      adc: "ADC1_CH6 (Input Only)",
      status: "ARMED",
      type: "Optical Laser Cut",
      latency: "< 0.9ms",
    },
    {
      id: 4,
      name: "GATE 04 - FINISH LINE",
      pin: "GPIO 35",
      adc: "ADC1_CH7 (Input Only)",
      status: "ARMED",
      type: "Optical Laser Cut",
      latency: "< 0.7ms",
    },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Header Card ── */}
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
              background: "rgba(0, 255, 136, 0.12)",
              border: "1px solid rgba(0, 255, 136, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Cpu size={18} color="#00ff88" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              ESP32 HARDWARE TELEMETRY &amp; PIN DIAGNOSTICS
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              OPTICAL LASER GATES · SERVER TIMESTAMPS · SUB-MILLISECOND ACCURACY
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="gcc-tag">
            <Zap size={12} color="#ff6a00" /> 1000 Hz SAMPLING
          </span>
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: connected ? "#00ff88" : "#8da3be",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className={`live-beacon ${connected ? "live-dot-green" : ""}`} />
            {connected ? "POSTGRES WEBSOCKETS SYNCED" : "CONNECTING..."}
          </span>
        </div>
      </div>

      {/* ── Hardware Specifications Overview ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
        }}
      >
        <div className="gcc-card" style={{ padding: "16px 18px" }}>
          <div className="mono muted" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
            MICROCONTROLLER
          </div>
          <div className="digital" style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4 }}>
            ESP32 DevKit V1
          </div>
          <div className="mono" style={{ fontSize: 10, color: "#00f0ff", marginTop: 4 }}>
            Dual Core Xtensa 240 MHz
          </div>
        </div>

        <div className="gcc-card" style={{ padding: "16px 18px" }}>
          <div className="mono muted" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
            BAUD RATE &amp; PROTOCOL
          </div>
          <div className="digital" style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4 }}>
            115200 BPS // HTTP
          </div>
          <div className="mono" style={{ fontSize: 10, color: "#ffaa00", marginTop: 4 }}>
            Header Secret Auth (SHA-256)
          </div>
        </div>

        <div className="gcc-card" style={{ padding: "16px 18px" }}>
          <div className="mono muted" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
            WIFI CONNECTION
          </div>
          <div className="digital" style={{ fontSize: 18, fontWeight: 800, color: "#00ff88", marginTop: 4 }}>
            802.11 b/g/n (2.4GHz)
          </div>
          <div className="mono" style={{ fontSize: 10, color: "#00ff88", marginTop: 4 }}>
            RSSI: -54 dBm (Excellent)
          </div>
        </div>

        <div className="gcc-card" style={{ padding: "16px 18px" }}>
          <div className="mono muted" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
            RECORDED INTERRUPTS
          </div>
          <div className="digital" style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4 }}>
            {eventCount} TOTAL EVENTS
          </div>
          <div className="mono" style={{ fontSize: 10, color: "#8da3be", marginTop: 4 }}>
            Validated in Supabase RPC
          </div>
        </div>
      </div>

      {/* ── 4 Hardware Optical Gates Pinout Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {gates.map((g) => (
          <div
            key={g.id}
            className="gcc-card"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span className="digital" style={{ fontSize: 15, fontWeight: 900, color: "#ff6a00" }}>
                  GATE 0{g.id}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "rgba(0, 255, 136, 0.12)",
                    border: "1px solid rgba(0, 255, 136, 0.35)",
                    color: "#00ff88",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#00ff88",
                      boxShadow: "0 0 8px #00ff88",
                    }}
                  />
                  {g.status}
                </span>
              </div>
              <strong style={{ fontSize: 14, color: "#fff" }}>{g.name}</strong>
              <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                {g.type}
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(6, 12, 20, 0.7)",
                border: "1px solid rgba(45, 75, 110, 0.3)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                fontSize: 11,
              }}
            >
              <div>
                <span className="mono muted" style={{ fontSize: 9 }}>
                  PIN ASSIGNMENT
                </span>
                <div className="digital" style={{ color: "#00f0ff", fontWeight: 700 }}>
                  {g.pin}
                </div>
              </div>
              <div>
                <span className="mono muted" style={{ fontSize: 9 }}>
                  BUS CHANNEL
                </span>
                <div className="mono" style={{ color: "#fff", fontSize: 11 }}>
                  {g.adc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
