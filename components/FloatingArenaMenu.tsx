"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Award,
  Cpu,
  Home,
  Map,
  Menu,
  Radio,
  Shield,
  Users,
  X,
} from "lucide-react";
import type { GccTab } from "@/components/gcc/GccNav";
import MagneticButton from "@/components/kinetics/MagneticButton";

interface FloatingArenaMenuProps {
  activeTab: GccTab;
  onSelectTab: (tab: GccTab) => void;
}

const MENU_ITEMS: { id: GccTab; label: string; sub: string; icon: typeof Home }[] = [
  { id: "home", label: "Opening Hero", sub: "3D Track Showcase", icon: Home },
  { id: "live", label: "Live Arena", sub: "Broadcast, Gates & Rulebook", icon: Radio },
  { id: "overview", label: "GCC Overview", sub: "Telemetry Command", icon: Activity },
  { id: "leaderboard", label: "Leaderboard", sub: "Official Standings", icon: Award },
  { id: "map", label: "Track Map", sub: "4-Gate Sector Layout", icon: Map },
  { id: "teams", label: "Teams", sub: "Registered Bots", icon: Users },
  { id: "hardware", label: "Hardware", sub: "ESP32 & LDR Diagnostics", icon: Cpu },
];

export default function FloatingArenaMenu({ activeTab, onSelectTab }: FloatingArenaMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (tab: GccTab) => {
    onSelectTab(tab);
    setOpen(false);
  };

  return (
    <>
      {/* Persistent Bottom-Right Floating MENU Button with Magnetic Pull */}
      <MagneticButton
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="no-print hud-chamfer"
        style={{
          position: "fixed",
          right: 22,
          bottom: 36,
          zIndex: 110,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          background: "rgba(8, 16, 30, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(0, 240, 255, 0.5)",
          color: "#f0f6ff",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 18px rgba(0, 240, 255, 0.2)",
        }}
      >
        {open ? <X size={16} color="#00f0ff" /> : <Menu size={16} color="#00f0ff" />}
        <span>{open ? "CLOSE" : "MENU"}</span>
      </MagneticButton>

      {/* Full-Screen Glassmorphic Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 105,
              background: "rgba(4, 8, 15, 0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 880 }}
            >
              <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "#00f0ff", letterSpacing: "0.2em" }}>
                    TRACK VISION // NIRMAN 6.0
                  </div>
                  <h2 className="digital" style={{ fontSize: 28, margin: "4px 0 0", color: "#fff" }}>
                    ARENA NAVIGATION
                  </h2>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="hud-chamfer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background: "rgba(255, 106, 0, 0.15)",
                    border: "1px solid rgba(255, 106, 0, 0.5)",
                    color: "#ffaa55",
                    textDecoration: "none",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <Shield size={14} /> ORGANIZER ADMIN
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      style={{
                        textAlign: "left",
                        padding: "18px 18px",
                        borderRadius: 14,
                        background: isActive ? "rgba(0, 240, 255, 0.12)" : "rgba(11, 20, 34, 0.78)",
                        border: `1px solid ${isActive ? "rgba(0, 240, 255, 0.6)" : "rgba(45, 75, 110, 0.4)"}`,
                        color: "#f0f6ff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <Icon size={18} color={isActive ? "#00f0ff" : "#8da3be"} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{item.label}</div>
                        <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>
                          {item.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
