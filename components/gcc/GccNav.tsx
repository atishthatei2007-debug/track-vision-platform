"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Award,
  BarChart3,
  ChevronRight,
  Cpu,
  Map,
  Menu,
  Radio,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type GccTab =
  | "home"
  | "live"
  | "overview"
  | "teams"
  | "leaderboard"
  | "replay"
  | "hardware"
  | "reports"
  | "eventlog"
  | "map"
  | "ai";

interface GccNavProps {
  activeTab: GccTab;
  onSelectTab: (tab: GccTab) => void;
  connected: boolean;
  activeRunCount: number;
}

const TABS: { id: GccTab; label: string; icon: typeof Zap; shortcut: string }[] = [
  { id: "home", label: "01 Showcase", icon: Zap, shortcut: "01" },
  { id: "live", label: "02 Live Arena", icon: Radio, shortcut: "02" },
  { id: "overview", label: "03 Overview", icon: Activity, shortcut: "03" },
  { id: "teams", label: "04 Teams", icon: Users, shortcut: "04" },
  { id: "leaderboard", label: "05 Leaderboard", icon: Award, shortcut: "05" },
  { id: "replay", label: "06 Replay", icon: RotateCcw, shortcut: "06" },
  { id: "hardware", label: "07 Hardware", icon: Cpu, shortcut: "07" },
  { id: "reports", label: "08 Reports", icon: BarChart3, shortcut: "08" },
  { id: "eventlog", label: "09 Event Log", icon: ScrollText, shortcut: "09" },
  { id: "map", label: "10 Track Map", icon: Map, shortcut: "10" },
  { id: "ai", label: "11 AI Analyst", icon: Sparkles, shortcut: "11" },
];

export default function GccNav({
  activeTab,
  onSelectTab,
  connected,
  activeRunCount,
}: GccNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="no-print sticky top-0 z-50 bg-[#FFF9F3] border-b-[2.5px] border-[#292929] px-3 sm:px-5 py-2.5 transition-all">
      <div className="max-w-[1520px] mx-auto bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded shadow-[4px_4px_0px_#292929] p-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Cockpit Title — Click returns to Opening Hero */}
          <div
            onClick={() => onSelectTab("home")}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
            title="Return to Track Vision Showcase"
          >
            <div className="w-10 h-10 rounded border-2 border-[#292929] bg-[#FF8A32] shadow-[2px_2px_0px_#292929] flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-0.5 group-active:translate-y-0.5">
              <img
                src="/track-vision-logo.png"
                alt="GCC Track Vision"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-digital text-xs sm:text-sm font-black tracking-widest text-[#292929]">
                  GCC <span className="text-[#FF8A32]">SMART RACE CONTROL</span>
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#FFB36B] text-[#292929] font-extrabold border border-[#292929] rounded shadow-[1px_1px_0px_#292929] hidden sm:inline-block">
                  PRO CIRCUIT
                </span>
              </div>
              <div className="font-mono text-[9.5px] text-[#A3A3A3] tracking-wider leading-none mt-0.5 font-bold">
                SYSTEM: <span className="text-[#292929] font-black">TRACK VISION</span> // NIRMAN 6.0
              </div>
            </div>
          </div>

          {/* Desktop 11 Navigation Tabs — Segmented Arcade Ribbon */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-0.5 px-1 bg-[#FFF9F3] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929] scrollbar-none max-w-[850px]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTab(t.id)}
                  className={`font-mono text-[11px] uppercase font-black px-2.5 py-1.5 rounded transition-all duration-150 flex items-center gap-1.5 select-none whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#FF8A32] text-[#292929] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] -translate-x-0.5 -translate-y-0.5"
                      : "text-[#292929] hover:bg-[#F5D9C0] hover:text-[#292929] border-2 border-transparent"
                  }`}
                >
                  <Icon
                    size={12}
                    className={isActive ? "text-[#292929]" : "text-[#A3A3A3]"}
                  />
                  <span>{t.label}</span>
                  {t.id === "live" && activeRunCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse border border-[#292929]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Status Indicator & Cockpit Link */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Realtime Synced Pill */}
            <div className="font-mono text-[11px] font-black flex items-center gap-1.5 border-2 border-[#292929] bg-[#F5D9C0] px-2.5 py-1 rounded shadow-[2px_2px_0px_#292929]">
              <span
                className={`w-2.5 h-2.5 rounded-full border border-[#292929] ${
                  connected ? "bg-[#22c55e] animate-pulse" : "bg-[#A3A3A3]"
                }`}
              />
              <span className="tracking-wider text-[#292929]">
                {connected ? "SYNCED" : "OFFLINE"}
              </span>
            </div>

            {/* Direct Cockpit Link */}
            <Link href="/admin" className="hidden sm:inline-block">
              <Button
                variant="charcoal"
                size="sm"
                className="gap-1.5 text-xs py-1.5 px-3 h-8 shadow-[2.5px_2.5px_0px_#FF8A32]"
              >
                <Shield size={13} />
                <span>COCKPIT</span>
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 bg-[#FFF9F3] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t-2 border-[#292929] grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-xs">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(t.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`font-black px-2.5 py-2 rounded border-2 border-[#292929] flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-[#FF8A32] text-[#292929] shadow-[2px_2px_0px_#292929]"
                      : "bg-[#FFF9F3] text-[#292929] hover:bg-[#F5D9C0]"
                  }`}
                >
                  <Icon size={13} />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
            <Link href="/admin" className="col-span-2 sm:col-span-3 pt-1">
              <Button variant="charcoal" size="sm" className="w-full text-xs py-2">
                <Shield size={13} />
                <span>RACE DIRECTOR COCKPIT</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
