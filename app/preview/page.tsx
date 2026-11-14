"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  Flag,
  Flame,
  Gauge,
  HelpCircle,
  Layers,
  MapPin,
  Menu,
  Play,
  Radio,
  RotateCcw,
  Shield,
  Sparkles,
  Timer,
  Trophy,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";

export default function RefinedPreviewPage() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState<number | null>(null);

  // Sample competition data isolated to preview
  const sampleTeams = [
    { rank: "01", code: "TV-02", name: "CyberStriker", college: "Silicon Institute of Tech", time: "12.45s", delta: "LEADER", status: "FINISHED", gate: "04" },
    { rank: "02", code: "TV-07", name: "Apex Predator", college: "BPUT Rourkela", time: "13.08s", delta: "+0.63s", status: "FINISHED", gate: "04" },
    { rank: "03", code: "TV-01", name: "Vector Alpha", college: "ITER / SOA University", time: "13.52s", delta: "+1.07s", status: "FINISHED", gate: "04" },
    { rank: "04", code: "TV-09", name: "Circuit Rider", college: "VSSUT Burla", time: "14.19s", delta: "+1.74s", status: "FINISHED", gate: "04" },
    { rank: "05", code: "TV-04", name: "VoltRunner", college: "Silicon Institute of Tech", time: "14.82s", delta: "+2.37s", status: "RUNNING", gate: "03" },
  ];

  const gates = [
    { no: "01", name: "START LINE BEAM", time: "0.00s", status: "CLEARED", sector: "Sector 1" },
    { no: "02", name: "SECTOR 1 SPLIT", time: "4.21s", status: "CLEARED", sector: "Sector 2" },
    { no: "03", name: "SECTOR 2 HAIRPIN", time: "9.84s", status: "CLEARED", sector: "Sector 3" },
    { no: "04", name: "FINISH LINE BEAM", time: "14.82s", status: "WAITING", sector: "Final Trap" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#292929] font-sans selection:bg-[#FF8A32] selection:text-[#292929] pb-24">
      {/* ── DESIGN AUDIT STICKY BANNER ── */}
      <div className="sticky top-0 z-50 bg-[#292929] text-white border-b-4 border-[#FF8A32] px-4 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <span className="bg-[#FF8A32] text-[#292929] font-mono font-black text-xs px-2.5 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">
              FINAL REFINEMENT
            </span>
            <span className="font-mono text-xs font-bold text-[#E8E8E8] tracking-wider uppercase">
              GCC GRAND PRIX ARCADE // VARIATION A + ARCADE REFINEMENTS
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#F5D9C0] hidden md:inline">
              PALETTE: <strong className="text-[#FF8A32]">#FF8A32</strong> · <strong className="text-[#FFB36B]">#FFB36B</strong> · <strong className="text-white">#FFF9F3</strong>
            </span>
            <span className="bg-[#1f1f1f] text-[#FF8A32] px-2 py-0.5 rounded border border-[#444] text-[11px] font-bold">
              NON-DESTRUCTIVE PREVIEW
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ── 1. RETRO MOTORSPORT NAVIGATION BAR ── */}
        <header className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded shadow-[4px_4px_0px_#292929] p-3 transition-all">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo & Event Pill */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF8A32] border-[2.5px] border-[#292929] shadow-[2.5px_2.5px_0px_#292929] rounded flex items-center justify-center font-mono font-black text-lg text-[#292929] shrink-0">
                🏁
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black tracking-widest text-[#292929]">
                    GCC <span className="text-[#FF8A32]">SMART RACE CONTROL</span>
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[9px] px-1.5 py-0.5 bg-[#FFB36B] text-[#292929] font-black border border-[#292929] rounded shadow-[1px_1px_0px_#292929]">
                    PRO CIRCUIT
                  </span>
                </div>
                <div className="font-mono text-[10px] text-[#A3A3A3] font-bold">
                  NIRMAN 6.0 // AUTONOMOUS LINE FOLLOWER LEAGUE
                </div>
              </div>
            </div>

            {/* Desktop Segmented Tabs (Tactile Arcade Hybrid) */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-[#FFF9F3] border-2 border-[#292929] p-1 rounded shadow-[2.5px_2.5px_0px_#292929]">
              {[
                { id: "home", label: "01 SHOWCASE" },
                { id: "live", label: "02 LIVE ARENA", dot: true },
                { id: "teams", label: "03 TEAMS" },
                { id: "leaderboard", label: "04 LEADERBOARD" },
                { id: "hardware", label: "05 HARDWARE" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-mono text-xs font-black px-3.5 py-1.5 rounded transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-[#FF8A32] text-[#292929] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] -translate-x-0.5 -translate-y-0.5"
                        : "text-[#292929] hover:bg-[#F5D9C0] hover:text-[#292929] border-2 border-transparent"
                    }`}
                  >
                    {tab.dot && (
                      <span className="w-2 h-2 rounded-full bg-[#292929] animate-pulse" />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Status Indicator & Action Button */}
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11px] font-black px-3 py-1.5 bg-[#F5D9C0] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A32] border border-[#292929] animate-pulse" />
                <span className="hidden sm:inline">CIRCUIT:</span> READY
              </div>

              <button className="hidden sm:flex font-mono text-xs font-black px-4 py-2 bg-[#292929] text-white border-2 border-[#292929] rounded shadow-[2.5px_2.5px_0px_#FF8A32] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#FF8A32] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all items-center gap-1.5">
                <span>COCKPIT</span>
                <ChevronRight size={14} />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-[#FFF9F3] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer (Accordion) */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t-2 border-[#292929] space-y-1.5 font-mono text-xs">
              {[
                { id: "home", label: "01 SHOWCASE" },
                { id: "live", label: "02 LIVE ARENA" },
                { id: "teams", label: "03 TEAMS" },
                { id: "leaderboard", label: "04 LEADERBOARD" },
                { id: "hardware", label: "05 HARDWARE" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left font-black px-3.5 py-2.5 rounded border-2 border-[#292929] transition-all ${
                    activeTab === tab.id
                      ? "bg-[#FF8A32] text-[#292929] shadow-[2px_2px_0px_#292929]"
                      : "bg-[#FFF9F3] text-[#292929] hover:bg-[#F5D9C0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ── 2. MAIN HERO SECTION (EDITORIAL FOUNDATION + BOLD ARCADE TOUCHES) ── */}
        <section className="bg-[#FFFFFF] border-[3px] border-[#292929] rounded shadow-[6px_6px_0px_#292929] overflow-hidden">
          {/* Authentic Grand Prix Monochrome Checkered Ribbon */}
          <div className="h-4 bg-[#292929] flex overflow-hidden border-b-2 border-[#292929]">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-full shrink-0 ${
                  i % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#292929]"
                }`}
              />
            ))}
          </div>

          <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Editorial Hero Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB36B] border-2 border-[#292929] rounded font-mono text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#292929]">
                  <Flame size={14} className="text-[#292929]" />
                  SEASON 2026 // STAGE 01
                </span>
                <span className="font-mono text-xs px-2.5 py-1 bg-[#F5D9C0] border-2 border-[#292929] rounded font-bold shadow-[2px_2px_0px_#292929]">
                  CIRCUIT NIRMAN 6.0
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#292929] tracking-tight leading-[1.1]">
                THE FUTURE OF{" "}
                <span className="bg-[#FF8A32] text-[#292929] px-2.5 py-0.5 border-[2.5px] border-[#292929] shadow-[4px_4px_0px_#292929] inline-block -rotate-1">
                  ROBOTICS RACING
                </span>
              </h2>

              <p className="font-mono text-sm sm:text-base text-[#444] leading-relaxed max-w-xl font-medium">
                Official high-precision race control for autonomous line-following robotics.
                Integrated with 4-point optical sensor gates, sub-millisecond hardware timing,
                and live motorsport telemetry.
              </p>

              {/* REFINED CHUNKY NEOBRUTALIST ACTION BUTTONS */}
              <div className="pt-2 flex flex-wrap gap-4">
                {/* Primary Button (Racing Orange) */}
                <button className="font-mono text-sm font-black px-7 py-4 bg-[#FF8A32] text-[#292929] border-[2.5px] border-[#292929] rounded shadow-[4px_4px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2.5 cursor-pointer">
                  <Play size={18} fill="#292929" />
                  <span>ENTER LIVE ARENA</span>
                </button>

                {/* Secondary Button (Pure White / Peach Hover) */}
                <button className="font-mono text-sm font-black px-7 py-4 bg-[#FFFFFF] text-[#292929] border-[2.5px] border-[#292929] rounded shadow-[4px_4px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#F5D9C0] hover:shadow-[7px_7px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2.5 cursor-pointer">
                  <Trophy size={18} />
                  <span>VIEW LEADERBOARD</span>
                </button>
              </div>

              {/* Bolder Orange Feature Block (Refinement from Var B) */}
              <div className="bg-[#FFB36B] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#FFFFFF] border-2 border-[#292929] rounded flex items-center justify-center font-bold text-lg shadow-[1.5px_1.5px_0px_#292929]">
                    ⚡
                  </div>
                  <div>
                    <div className="font-mono text-xs font-black text-[#292929] uppercase">
                      BENCHMARK LAP RECORD: 12.45s
                    </div>
                    <div className="font-mono text-[11px] text-[#292929]/80 font-bold">
                      Set by <span className="underline font-black">CyberStriker (TV-02)</span> · Sector 1: 3.89s
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-block font-mono text-[10px] font-black px-2 py-1 bg-[#292929] text-white rounded">
                  AUTHENTICATED
                </span>
              </div>
            </div>

            {/* Right: Official Stopwatch Box */}
            <div className="lg:col-span-5 bg-[#FFF9F3] border-[2.5px] border-[#292929] rounded p-6 shadow-[5px_5px_0px_#292929] space-y-4">
              <div className="flex justify-between items-center border-b-2 border-[#292929] pb-3">
                <span className="font-mono text-xs font-black text-[#FF8A32] flex items-center gap-1.5 uppercase">
                  <Timer size={16} /> OFFICIAL RACE STOPWATCH
                </span>
                <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-[#FF8A32] text-[#292929] border border-[#292929] rounded shadow-[1px_1px_0px_#292929]">
                  ● LIVE ON TRACK
                </span>
              </div>

              {/* Digital Timing Panel */}
              <div className="text-center py-5 bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded shadow-[3px_3px_0px_#292929]">
                <div className="font-mono text-[11px] text-[#A3A3A3] font-bold uppercase tracking-widest">
                  CIRCUIT ELAPSED DURATION
                </div>
                <div className="font-mono text-5xl sm:text-6xl font-black text-[#292929] tracking-tight my-1">
                  14.82<span className="text-2xl text-[#FF8A32]">s</span>
                </div>
                <div className="font-mono text-xs text-[#292929] font-bold">
                  ACTIVE ROBOT: <span className="text-[#FF8A32] font-black">TV-04 (VoltRunner)</span>
                </div>
                <div className="font-mono text-[10px] text-[#A3A3A3] mt-0.5">
                  Silicon Institute of Technology
                </div>
              </div>

              {/* Progress & Sector Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                <div className="p-3 bg-[#FFFFFF] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929]">
                  <div className="text-[10px] text-[#A3A3A3] font-bold">GATES CLEARED</div>
                  <div className="font-black text-lg text-[#292929]">3 / 4 GATES</div>
                </div>
                <div className="p-3 bg-[#FFFFFF] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929]">
                  <div className="text-[10px] text-[#A3A3A3] font-bold">COURSE PROGRESS</div>
                  <div className="font-black text-lg text-[#FF8A32]">75.0%</div>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-3 bg-[#E8E8E8] border-2 border-[#292929] rounded overflow-hidden">
                <div className="h-full bg-[#FF8A32] w-3/4 border-r-2 border-[#292929]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. LIVE OPTICAL CHECKPOINT TELEMETRY (GATES 01–04) ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b-2 border-[#292929] gap-2">
            <div className="flex items-center gap-2">
              <Cpu size={20} className="text-[#FF8A32]" />
              <h3 className="font-mono text-sm sm:text-base font-black uppercase text-[#292929] tracking-wider">
                OPTICAL SENSOR GATES // BEAM-BREAK REALTIME TELEMETRY
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-[#A3A3A3]">
              ESP32 HARDWARE INTERRUPT (ADC1 SENSORS)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gates.map((g, idx) => {
              const isCleared = g.status === "CLEARED";
              return (
                <div
                  key={g.no}
                  onClick={() => setSelectedGate(idx + 1)}
                  className={`border-[2.5px] border-[#292929] rounded p-4.5 shadow-[4px_4px_0px_#292929] transition-all cursor-pointer ${
                    isCleared
                      ? "bg-[#FFFFFF] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#292929]"
                      : "bg-[#FFF9F3] opacity-80 border-dashed"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-mono text-xs font-black bg-[#F5D9C0] px-2.5 py-1 border border-[#292929] rounded shadow-[1px_1px_0px_#292929]">
                      GATE {g.no}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] ${
                        isCleared
                          ? "bg-[#FF8A32] text-[#292929] shadow-[1px_1px_0px_#292929]"
                          : "bg-[#E8E8E8] text-[#A3A3A3]"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-[#A3A3A3] font-bold">
                    {g.name}
                  </div>
                  <div className="font-mono text-[10px] text-[#FF8A32] font-black mb-2">
                    {g.sector}
                  </div>

                  <div className="font-mono text-3xl font-black text-[#292929]">
                    {g.time}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. OFFICIAL LEADERBOARD TABLE (EDITORIAL MOTORSPORT PRESTIGE) ── */}
        <section className="bg-[#FFFFFF] border-[3px] border-[#292929] rounded shadow-[6px_6px_0px_#292929] overflow-hidden">
          {/* Table Header Strip */}
          <div className="bg-[#292929] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Trophy size={20} className="text-[#FF8A32]" />
              <div>
                <h3 className="font-mono text-sm sm:text-base font-black uppercase tracking-wider">
                  OFFICIAL COMPETITION LEADERBOARD // NIRMAN 6.0
                </h3>
                <div className="font-mono text-[10px] text-[#A3A3A3]">
                  RANKINGS VALIDATED BY ESP32 INFRARED BEAM INTERRUPTS
                </div>
              </div>
            </div>

            <span className="font-mono text-xs text-[#E8E8E8] font-bold bg-[#1a1a1a] px-3 py-1 rounded border border-[#444] self-start sm:self-auto">
              5 REGISTERED RUNS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs min-w-[650px]">
              <thead>
                <tr className="bg-[#FFF9F3] border-b-2 border-[#292929] text-[#292929] font-black text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">POS</th>
                  <th className="py-3.5 px-4">CODE</th>
                  <th className="py-3.5 px-4">ROBOT & INSTITUTION</th>
                  <th className="py-3.5 px-4">SPLIT DELTA</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-right">BEST LAP</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#E8E8E8]">
                {sampleTeams.map((t, idx) => {
                  const isP1 = idx === 0;
                  const isPodium = idx < 3;
                  return (
                    <tr
                      key={t.code}
                      className={`transition-colors ${
                        isP1
                          ? "bg-[#FFB36B]/25 font-bold"
                          : idx % 2 === 1
                          ? "bg-[#FFF9F3]"
                          : "bg-[#FFFFFF]"
                      } hover:bg-[#F5D9C0]/50`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded border border-[#292929] ${
                            isP1
                              ? "bg-[#FF8A32] text-[#292929] shadow-[2px_2px_0px_#292929]"
                              : isPodium
                              ? "bg-[#F5D9C0] text-[#292929] shadow-[1px_1px_0px_#292929]"
                              : "bg-[#E8E8E8] text-[#292929]"
                          }`}
                        >
                          #{t.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#FF8A32] text-sm">
                        {t.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-[#292929] text-sm">{t.name}</div>
                        <div className="text-[11px] text-[#A3A3A3]">{t.college}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A3A3A3] font-bold">
                        {t.delta}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] uppercase ${
                            t.status === "RUNNING"
                              ? "bg-[#FF8A32] text-[#292929] animate-pulse"
                              : "bg-[#FFFFFF] text-[#292929]"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-base text-[#292929]">
                        {t.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5. RESPONSIVE VERIFICATION & DESIGN CONTRACT SUMMARY ── */}
        <footer className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-6 shadow-[5px_5px_0px_#292929] space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-black text-[#FF8A32] uppercase tracking-wider">
            <CheckCircle2 size={16} />
            <span>APPROVED DESIGN CONTRACT: GCC GRAND PRIX ARCADE</span>
          </div>
          <p className="font-mono text-xs text-[#292929] leading-relaxed">
            This refined preview incorporates the requested <strong>Variation A editorial layout</strong> with{" "}
            <strong>Variation B&apos;s tactile arcade buttons, heavier 2.5–3px charcoal borders, and bolder orange feature accents</strong>.
            All backend APIs, database models, Supabase realtime channels, and ESP32 hardware timing are preserved and untouched.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2 py-1 bg-[#FFF9F3] border border-[#292929] rounded font-bold">
              DESKTOP (1920px) ✓
            </span>
            <span className="px-2 py-1 bg-[#FFF9F3] border border-[#292929] rounded font-bold">
              LAPTOP (1366px) ✓
            </span>
            <span className="px-2 py-1 bg-[#FFF9F3] border border-[#292929] rounded font-bold">
              TABLET (768px) ✓
            </span>
            <span className="px-2 py-1 bg-[#FFF9F3] border border-[#292929] rounded font-bold">
              MOBILE (390px) ✓
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
