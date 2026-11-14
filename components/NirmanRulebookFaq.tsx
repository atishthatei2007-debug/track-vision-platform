"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  Cpu,
  Download,
  Gift,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import MagneticButton from "@/components/kinetics/MagneticButton";

type WorkspaceTab = "description" | "specs" | "general" | "procedure" | "prizes" | "contacts";

const RACE_SPECS = [
  { label: "EVENT", value: "NIRMAN 6.0 (Sixth Edition) · Line Follower" },
  { label: "PRIZE POOL", value: "Upto ₹15,000 + Exclusive Gift Hampers" },
  { label: "TEAM SIZE", value: "2 to 3 Members per Team" },
  { label: "VENUE", value: "Silicon University, Odisha - 751024" },
  { label: "DIMENSIONS", value: "Max 20cm × 20cm × 15cm (±5% tolerance)" },
  { label: "LINE WIDTH", value: "< 3cm (Black/White contrast)" },
  { label: "POWER LIMIT", value: "Max 12V DC (Bot & Sensors)" },
  { label: "TIMING TECH", value: "4-Gate ESP32 Laser Timing + Realtime" },
];

const FAQS = [
  {
    q: "How many members are allowed in a team?",
    a: "Each team must consist of 2 to 3 participants. All participants must register together under their team code.",
  },
  {
    q: "What are the exact robot dimensions and weight limits?",
    a: "During the event, the robot must fit into a measurement box of 20cm × 20cm × 15cm (L × W × H). A maximum of 5% dimensional error tolerance can be accommodated.",
  },
  {
    q: "What is the maximum allowed voltage?",
    a: "The power supply for the bot and onboard sensors should not exceed 12V DC. Higher voltage configurations are strictly prohibited.",
  },
  {
    q: "Are ready-made bot kits or suction mechanisms allowed?",
    a: "Teams must build their robot from scratch. Ready-made MCUs (e.g. ESP32, Arduino) and sensor modules are permitted, but readymade kits/assemblies (Lego kits, Kaka bots, Ichi bots, carrier boards) and suction mechanisms are strictly prohibited.",
  },
  {
    q: "What are the hand-touch penalties?",
    a: "Maximum hand touches and penalties are announced on the spot. Each manual hand touch incurs a +5 second penalty. If a robot remains immobile for an extended duration, the organizers make the on-the-spot ruling.",
  },
  {
    q: "How will the tournament rounds proceed?",
    a: "The event features 2 rounds: Round 1 consists of a basic track to shortlist teams based on lap time. Round 2 features a complex circuit. The team completing the Round 2 track in the least total time (including penalties) wins.",
  },
  {
    q: "How are ties broken?",
    a: "Winners are decided based on minimum completion time, penalties incurred, and checkpoints cleared. In case of a tie, the bot with minimum errors/touches wins; further ties are resolved by bot design efficiency.",
  },
];

export default function NirmanRulebookFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [rulebookOpen, setRulebookOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("description");

  return (
    <section id="nirman-intel" style={{ marginTop: 28 }}>
      {/* Event Metadata & Rulebook CTA Strip — NeoBrutalism */}
      <div
        className="hud-panel"
        style={{
          padding: 24,
          marginBottom: 20,
          background: "#0b111a",
          border: "2.5px solid #000000",
          borderRadius: 4,
          boxShadow: "5px 5px 0px #000000",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div>
            <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "#ffaa00", fontWeight: 700 }}>
              SIPC // SILICON UNIVERSITY // NIRMAN 6.0
            </div>
            <h2
              style={{
                fontSize: 24,
                margin: "4px 0 0",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 10,
                letterSpacing: "0.04em",
              }}
            >
              <Sparkles size={22} color="#00f0ff" /> Official Line Follower Rule Book
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              className="mono"
              style={{
                padding: "6px 12px",
                background: "#ffaa00",
                color: "#000000",
                border: "2px solid #000000",
                borderRadius: 4,
                boxShadow: "2px 2px 0px #000000",
                fontWeight: 800,
                fontSize: 11,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Trophy size={14} /> UPTO ₹15,000 PRIZE POOL
            </span>
            <button
              type="button"
              onClick={() => setRulebookOpen(true)}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <BookOpen size={15} /> OPEN OFFICIAL RULE BOOK
            </button>
          </div>
        </div>

        {/* Spec Grid — NeoBrutalist Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {RACE_SPECS.map((spec) => (
            <div
              key={spec.label}
              style={{
                padding: "12px 14px",
                borderRadius: 4,
                background: "#0d1522",
                border: "2px solid #000000",
                boxShadow: "3px 3px 0px #000000",
              }}
            >
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "#00f0ff", fontWeight: 700 }}>
                {spec.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f6ff", marginTop: 4 }}>
                {spec.value}
              </div>
            </div>
          ))}
        </div>

        {/* Direct Organizer Contact Chips */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 18,
            paddingTop: 14,
            borderTop: "2px solid #000000",
            flexWrap: "wrap",
            fontSize: 12,
          }}
        >
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#00ff88", display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={13} color="#00ff88" /> EVENT COORDINATORS:
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="https://wa.me/qr/UX5LIKYNY2YVI1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 4,
                background: "#25d366",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                color: "#000000",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <MessageCircle size={12} /> WhatsApp (Atish)
            </a>
            <a
              href="tel:+919078362710"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 4,
                background: "#00f0ff",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                color: "#000000",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Phone size={12} /> Call Atish: 9078362710
            </a>
            <a
              href="tel:+918249454989"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 4,
                background: "#0d1522",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                color: "#c8d6e5",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Phone size={12} /> SIPC: 8249454989
            </a>
            <a
              href="tel:+917682040823"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 4,
                background: "#0d1522",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                color: "#c8d6e5",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Phone size={12} /> SIPC: 7682040823
            </a>
            <a
              href="mailto:nirman@silicon.ac.in"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 4,
                background: "#ffaa00",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                color: "#000000",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Mail size={12} /> nirman@silicon.ac.in
            </a>
          </div>
        </div>
      </div>

      {/* Race-Day FAQs Accordion — NeoBrutalism */}
      <div
        className="hud-panel"
        style={{
          padding: 22,
          background: "#0b111a",
          border: "2.5px solid #000000",
          borderRadius: 4,
          boxShadow: "5px 5px 0px #000000",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 700 }}>
              COMPETITOR BRIEFING
            </div>
            <h2
              style={{
                fontSize: 22,
                margin: "4px 0 0",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 10,
                letterSpacing: "0.04em",
              }}
            >
              <HelpCircle size={20} color="#ffaa00" /> Official Rules & FAQs
            </h2>
          </div>
          <span className="pill pill-orange">7 BRIEFINGS</span>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                style={{
                  borderRadius: 4,
                  background: isOpen ? "#111b2c" : "#0d1522",
                  border: "2px solid #000000",
                  boxShadow: isOpen ? "4px 4px 0px #00f0ff" : "3px 3px 0px #000000",
                  overflow: "hidden",
                  transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "transparent",
                    border: "none",
                    color: "#f0f6ff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ fontSize: 11, color: "#00f0ff", fontWeight: 700 }}>
                      0{idx + 1}
                    </span>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={16}
                    color={isOpen ? "#00f0ff" : "#8da3be"}
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        className="muted"
                        style={{
                          padding: "0 16px 14px 40px",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Official NIRMAN 6.0 Rule Book Modal */}
      <AnimatePresence>
        {rulebookOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRulebookOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 120,
              background: "rgba(3, 7, 14, 0.9)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hud-panel"
              style={{
                width: "100%",
                maxWidth: 1100,
                maxHeight: "90vh",
                overflow: "hidden",
                padding: 0,
                background: "#080e18",
                border: "3px solid #000000",
                boxShadow: "8px 8px 0px #000000",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 24px",
                  background: "#0d1522",
                  borderBottom: "2px solid #000000",
                }}
              >
                <div>
                  <div className="mono" style={{ fontSize: 10, color: "#ffaa00", letterSpacing: "0.22em", fontWeight: 700 }}>
                    SILICON INNOVATION & PROMOTION CELL (SIPC) · 2026-27
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
                    <ShieldCheck size={20} color="#00ff88" /> NIRMAN 6.0 Line Follower Rule Book
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRulebookOpen(false)}
                  aria-label="Close rule book"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 4,
                    background: "#ff2a55",
                    border: "2px solid #000000",
                    boxShadow: "2px 2px 0px #000000",
                    color: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Workspace Split Body */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.85fr)",
                  flex: 1,
                  overflowY: "auto",
                }}
              >
                {/* Left: Tabbed Sections */}
                <div style={{ padding: "22px 26px", borderRight: "2px solid #000000", overflowY: "auto" }}>
                  {/* Tab Strip */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                    {[
                      { id: "description", label: "01 Description" },
                      { id: "specs", label: "02 Robot Specs" },
                      { id: "general", label: "03 General Rules" },
                      { id: "procedure", label: "04 Procedure & Track" },
                      { id: "prizes", label: "05 Prizes" },
                      { id: "contacts", label: "06 Contacts" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 4,
                          background: activeTab === tab.id ? "#ff5500" : "#0d1522",
                          border: "2px solid #000000",
                          boxShadow: "2px 2px 0px #000000",
                          color: activeTab === tab.id ? "#000000" : "#8da3be",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 01 DESCRIPTION */}
                  {activeTab === "description" && (
                    <div style={{ display: "grid", gap: 14 }}>
                      <div className="mono" style={{ color: "#00f0ff", fontSize: 11, letterSpacing: "0.15em" }}>
                        NO. OF MEMBERS IN A TEAM: 2 - 3
                      </div>
                      <h4 style={{ fontSize: 18, color: "#f0f6ff", margin: 0 }}>Event Description</h4>
                      <p className="muted" style={{ fontSize: 13, lineHeight: 1.65 }}>
                        A Line Follower Robot is a mobile machine designed to detect and follow a predefined path on the floor. The path is usually marked with a visible line, such as a black line on a white surface, creating a clear contrast for the robot to detect. In some cases, the path may also be invisible, such as a magnetic field.
                      </p>
                      <p className="muted" style={{ fontSize: 13, lineHeight: 1.65 }}>
                        The robot uses <strong>IR sensors or optical sensors</strong> placed underneath it to detect the path. The sensor data is then sent to the processor, which determines the required movement and sends commands to the motor driver. Based on these commands, the robot adjusts its movement and follows the given path.
                      </p>
                      <div style={{ padding: 14, borderRadius: 10, background: "rgba(11, 22, 38, 0.7)", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                        <div className="mono" style={{ color: "#00ff88", fontSize: 11, fontWeight: 700 }}>AUTONOMOUS TRACKING</div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                          Zero human wireless or optical intervention is allowed once the robot is launched.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 02 ROBOT SPECIFICATIONS */}
                  {activeTab === "specs" && (
                    <div style={{ display: "grid", gap: 14 }}>
                      <h4 style={{ fontSize: 18, color: "#f0f6ff", margin: 0 }}>Robot Specifications</h4>
                      <ul style={{ paddingLeft: 18, display: "grid", gap: 10, fontSize: 13, color: "#c8d6e5", lineHeight: 1.6 }}>
                        <li><strong>Strictly Autonomous:</strong> The Robot must be strictly autonomous.</li>
                        <li><strong>Line Dimensions:</strong> The width of the black or white line will be <strong>less than 3cm</strong>.</li>
                        <li><strong>Box Fit Constraint:</strong> During the event the Robot must fit into a box of <strong>20cm × 20cm × 15cm</strong>. A maximum of <strong>5% error</strong> can be tolerated.</li>
                        <li><strong>Lighting Robustness:</strong> The participants have to ensure that room lighting, photography, etc. does not affect the functioning of the sensors.</li>
                        <li><strong>Course Non-Completion Rule:</strong> If none of the robots finish the course, then the one that covered the longest distance in less time will be considered the winner.</li>
                        <li><strong>Power Supply Limit:</strong> Power supply for the bot or sensor should <strong>not be more than 12V</strong>.</li>
                      </ul>
                    </div>
                  )}

                  {/* 03 GENERAL RULES */}
                  {activeTab === "general" && (
                    <div style={{ display: "grid", gap: 14 }}>
                      <h4 style={{ fontSize: 18, color: "#f0f6ff", margin: 0 }}>General Rules</h4>
                      <ul style={{ paddingLeft: 18, display: "grid", gap: 10, fontSize: 13, color: "#c8d6e5", lineHeight: 1.6 }}>
                        <li>A maximum of <strong>three participants</strong> are allowed in a team (2 - 3 members).</li>
                        <li>The robot has to follow the black line on white background or white line on black background and complete the track in the least possible time.</li>
                        <li><strong>Hand Touch Penalties:</strong> Maximum hand touch and penalties will be informed on spot. (Each hand touch make <strong>5 sec penalty</strong>).</li>
                        <li><strong>Immobile Machine:</strong> If the machine remains immobile for respectable time then on the spot decision will be taken by the organizers.</li>
                        <li><strong>Surprise Track:</strong> All the tracks will be shown at the time of competition.</li>
                        <li><strong>Winning Criteria:</strong> Winners will be decided based on the minimum completion time, penalties incurred, and checkpoints cleared.</li>
                        <li><strong>Tie-Breakers:</strong> In case of any tie, winners will be decided based on minimum no. errors. The bot with minimum errors is the winner, and if there are any further ties, the type of bot is considered, which is more efficient.</li>
                        <li><strong>Built from Scratch:</strong> Team must build their bot from scratch; The use of ready made MCU and sensor is allowed. But <strong>Lego kits or any readymade assemblies (Kaka bots, Ichi bots, Carrier boards) are prohibited</strong>.</li>
                        <li><strong>No Suction:</strong> The use of suction in a bots is <strong>not allowed</strong>.</li>
                        <li>Organizing Committee reserves the right to add and update any rule.</li>
                      </ul>
                    </div>
                  )}

                  {/* 04 PROCEDURE & TRACK */}
                  {activeTab === "procedure" && (
                    <div style={{ display: "grid", gap: 14 }}>
                      <h4 style={{ fontSize: 18, color: "#f0f6ff", margin: 0 }}>Event Plan & Procedure</h4>
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ padding: 14, borderRadius: 10, background: "rgba(8, 16, 28, 0.8)", border: "1px solid rgba(0, 240, 255, 0.3)" }}>
                          <div className="mono" style={{ color: "#00f0ff", fontSize: 12, fontWeight: 700 }}>ROUND 1 — BASIC TRACK</div>
                          <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                            Round one consists of a basic track. Here the members are shortlisted based on time and charted to the second round.
                          </p>
                        </div>
                        <div style={{ padding: 14, borderRadius: 10, background: "rgba(8, 16, 28, 0.8)", border: "1px solid rgba(255, 170, 0, 0.3)" }}>
                          <div className="mono" style={{ color: "#ffaa00", fontSize: 12, fontWeight: 700 }}>ROUND 2 — COMPLEX CIRCUIT</div>
                          <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                            This consists of a complex circuit and also time taking. The team which completes tracing the track in the minimum time are considered as the winner.
                          </p>
                        </div>
                      </div>

                      {/* Demo Track Blueprint Graphic */}
                      <div style={{ marginTop: 10 }}>
                        <div className="mono muted" style={{ fontSize: 11, marginBottom: 6 }}>
                          DEMO TRACK PATHWAY (SHARP TURNS, INTERSECTIONS, CROSSOVERS & LOOPS):
                        </div>
                        <div
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            background: "#ffffff",
                            color: "#000000",
                            border: "2px solid #00f0ff",
                          }}
                        >
                          <svg viewBox="0 0 600 300" style={{ width: "100%", height: "auto" }}>
                            {/* Demo Track SVG matching page 5 */}
                            <path
                              d="M 520,270 L 60,270 L 60,90 L 170,90 L 210,130 L 250,90 L 290,90 L 290,210 L 370,210 L 370,90 L 410,90 L 410,140 L 470,140 L 470,90 L 520,90 L 520,60"
                              fill="none"
                              stroke="#000"
                              strokeWidth="12"
                              strokeLinecap="square"
                            />
                            {/* Loop & crossovers */}
                            <path d="M 60,180 L 170,180 L 170,270" fill="none" stroke="#000" strokeWidth="12" />
                            {/* Hatch marks */}
                            <line x1="180" y1="110" x2="220" y2="150" stroke="#000" strokeWidth="8" />
                            <line x1="195" y1="95" x2="235" y2="135" stroke="#000" strokeWidth="8" />
                            <line x1="210" y1="80" x2="250" y2="120" stroke="#000" strokeWidth="8" />
                            {/* Start text */}
                            <rect x="500" y="240" width="60" height="40" fill="#000" />
                            <text x="530" y="265" fill="#fff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                              START
                            </text>
                            {/* Stop text */}
                            <rect x="490" y="30" width="60" height="40" fill="#000" />
                            <text x="520" y="55" fill="#fff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                              STOP
                            </text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 05 PRIZES */}
                  {activeTab === "prizes" && (
                    <div style={{ display: "grid", gap: 16 }}>
                      <h4 style={{ fontSize: 18, color: "#f0f6ff", margin: 0 }}>Official Prize Pool</h4>
                      <div
                        style={{
                          padding: 24,
                          borderRadius: 14,
                          background: "radial-gradient(ellipse at center, rgba(255, 170, 0, 0.2) 0%, rgba(10, 16, 26, 0.9) 70%)",
                          border: "1px solid rgba(255, 170, 0, 0.5)",
                          textAlign: "center",
                        }}
                      >
                        <Trophy size={48} color="#ffaa00" style={{ margin: "0 auto 10px" }} />
                        <div className="digital" style={{ fontSize: 36, color: "#fff", fontWeight: 900 }}>
                          UPTO ₹15,000
                        </div>
                        <div style={{ fontSize: 15, color: "#ffc857", fontWeight: 600, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <Gift size={16} /> with Exclusive Gift Hampers
                        </div>
                      </div>
                      <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                        Cash prizes and trophies will be awarded to top-ranking teams during the NIRMAN 6.0 closing ceremony, and all verified participants will receive official certificates from the Silicon Innovation & Promotion Cell (SIPC).
                      </div>
                    </div>
                  )}

                  {/* 06 CONTACTS */}
                  {activeTab === "contacts" && (
                    <div style={{ display: "grid", gap: 14 }}>
                      <h4 style={{ fontSize: 18, color: "#f0f6ff", margin: 0 }}>Official Contacts & Channels</h4>
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ padding: 14, borderRadius: 10, background: "rgba(8, 16, 28, 0.8)", border: "1px solid rgba(37, 211, 102, 0.4)" }}>
                          <div className="mono" style={{ color: "#25d366", fontSize: 11, fontWeight: 700 }}>WHATSAPP HELPDESK (ATISH)</div>
                          <a href="https://wa.me/qr/UX5LIKYNY2YVI1" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <MessageCircle size={15} color="#25d366" /> Open WhatsApp Chat · QR Link
                          </a>
                        </div>
                        <div style={{ padding: 14, borderRadius: 10, background: "rgba(8, 16, 28, 0.8)", border: "1px solid rgba(0, 240, 255, 0.3)" }}>
                          <div className="mono" style={{ color: "#00f0ff", fontSize: 11, fontWeight: 700 }}>COORDINATOR ATISH (MOBILE)</div>
                          <a href="tel:+919078362710" style={{ color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <Phone size={15} color="#00f0ff" /> +91 90783 62710
                          </a>
                        </div>
                        <div style={{ padding: 14, borderRadius: 10, background: "rgba(8, 16, 28, 0.8)", border: "1px solid rgba(45, 75, 110, 0.4)" }}>
                          <div className="mono muted" style={{ fontSize: 11 }}>OFFICIAL SIPC PHONE NUMBERS</div>
                          <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                            <a href="tel:+918249454989" style={{ color: "#c8d6e5", textDecoration: "none", fontSize: 13 }}>● 8249454989</a>
                            <a href="tel:+917682040823" style={{ color: "#c8d6e5", textDecoration: "none", fontSize: 13 }}>● 7682040823</a>
                          </div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 10, background: "rgba(8, 16, 28, 0.8)", border: "1px solid rgba(45, 75, 110, 0.4)" }}>
                          <div className="mono muted" style={{ fontSize: 11 }}>EMAIL & WEBSITE</div>
                          <div style={{ marginTop: 4 }}>
                            <a href="mailto:nirman@silicon.ac.in" style={{ color: "#ffc857", textDecoration: "none", fontSize: 13 }}>nirman@silicon.ac.in</a>
                            <span style={{ color: "#5d738c", margin: "0 8px" }}>·</span>
                            <a href="https://www.nirmansilicon.tech" target="_blank" rel="noopener noreferrer" style={{ color: "#7cefff", textDecoration: "none", fontSize: 13 }}>nirmansilicon.tech</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Quick Action Card & Organizer Info */}
                <div style={{ padding: "22px 24px", background: "rgba(8, 15, 26, 0.7)", display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Prize Banner */}
                  <div
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      background: "radial-gradient(circle at center, rgba(255, 170, 0, 0.15) 0%, rgba(5, 10, 18, 0.9) 70%)",
                      border: "1px solid rgba(255, 170, 0, 0.4)",
                      textAlign: "center",
                    }}
                  >
                    <div className="mono" style={{ fontSize: 10, color: "#ffc857", letterSpacing: "0.14em" }}>
                      TOTAL PRIZE POOL
                    </div>
                    <div className="digital" style={{ fontSize: 24, color: "#fff", fontWeight: 900, marginTop: 4 }}>
                      UPTO ₹15,000
                    </div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                      Exclusive Gift Hampers + Trophies
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "rgba(6, 12, 22, 0.8)",
                      border: "1px solid rgba(45, 75, 110, 0.4)",
                      fontSize: 12,
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="mono muted">Team Size:</span>
                      <strong style={{ color: "#00ff88" }}>2 - 3 Members</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="mono muted">Box Fit:</span>
                      <strong style={{ color: "#00f0ff" }}>20×20×15 cm (±5%)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="mono muted">Max Voltage:</span>
                      <strong style={{ color: "#ffaa00" }}>Max 12V DC</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="mono muted">Touch Penalty:</span>
                      <strong style={{ color: "#ff496b" }}>+5s per Touch</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="mono muted">Ready-made Kits:</span>
                      <strong style={{ color: "#ff496b" }}>Prohibited</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "grid", gap: 10 }}>
                    <a
                      href="#download-pdf"
                      onClick={(e) => {
                        e.preventDefault();
                        window.print();
                      }}
                      className="hud-chamfer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #00f0ff 0%, #00a8ff 100%)",
                        color: "#04080e",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        textDecoration: "none",
                        letterSpacing: "0.08em",
                      }}
                    >
                      <Download size={14} /> EXPORT RULE BOOK PDF
                    </a>

                    <a
                      href="/admin"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "11px 16px",
                        background: "rgba(255, 106, 0, 0.15)",
                        border: "1px solid rgba(255, 106, 0, 0.5)",
                        color: "#ffaa55",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        textDecoration: "none",
                      }}
                    >
                      <Shield size={14} /> ORGANIZER RACE CONTROL
                    </a>
                  </div>

                  {/* Organizer Footer Card */}
                  <div
                    style={{
                      marginTop: "auto",
                      padding: 14,
                      borderRadius: 10,
                      background: "rgba(10, 18, 30, 0.8)",
                      border: "1px solid rgba(45, 75, 110, 0.4)",
                    }}
                  >
                    <div className="mono muted" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
                      ORGANISED BY
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 4 }}>
                      Silicon Innovation & Promotion Cell (SIPC)
                    </div>
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                      Silicon University, Odisha - 751024
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
