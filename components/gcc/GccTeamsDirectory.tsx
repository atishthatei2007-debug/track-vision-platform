"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Cpu,
  Flame,
  Search,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  best_time_ms: number | null;
  status: string;
};

interface GccTeamsDirectoryProps {
  teams: Team[];
  activeTeamId?: string;
}

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function GccTeamsDirectory({
  teams,
  activeTeamId,
}: GccTeamsDirectoryProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.college.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filter === "all") return true;
      if (filter === "running") return t.id === activeTeamId || t.status === "running";
      return t.status === filter;
    });
  }, [teams, search, filter, activeTeamId]);

  return (
    <div className="grid gap-5">
      {/* ── Search & Filter Control Bar ── */}
      <Panel
        variant="default"
        padding="default"
        className="flex justify-between items-center flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#FF8A32] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] flex items-center justify-center">
            <Users size={18} color="#292929" />
          </div>
          <div>
            <h2 className="font-digital text-base font-extrabold m-0 tracking-wider text-[#292929]">
              ROBOTICS TEAMS DIRECTORY ({teams.length})
            </h2>
            <div className="font-mono text-[10px] text-[#A3A3A3] font-bold">
              REGISTERED LINE-FOLLOWER COMPETITORS · NIRMAN 6.0
            </div>
          </div>
        </div>

        {/* Search & Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
            <input
              type="text"
              placeholder="Search team or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#FFF9F3] border-2 border-[#292929] text-[#292929] font-mono text-xs pl-8 pr-3 py-1.5 rounded shadow-[2px_2px_0px_#292929] focus:outline-none focus:border-[#FF8A32] w-64"
            />
          </div>

          <div className="flex items-center gap-1">
            {["all", "registered", "running", "finished"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`font-mono text-xs uppercase font-bold px-2.5 py-1 rounded border-2 transition-all cursor-pointer ${
                  filter === f
                    ? "bg-[#FF8A32] text-[#292929] border-[#292929] shadow-[2px_2px_0_#292929]"
                    : "bg-[#FFF9F3] text-[#292929] border-[#292929] hover:bg-[#F5D9C0]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* ── Team Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const isRunning = t.id === activeTeamId || t.status === "running";
          const isFinished = t.status === "finished";

          return (
            <Panel
              key={t.id}
              variant={isRunning ? "racing" : isFinished ? "orange" : "default"}
              padding="default"
              className="gcc-brutal-box flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-mono text-xs font-black text-[#292929] px-2 py-0.5 bg-[#F5D9C0] border border-[#292929] shadow-[1px_1px_0_#292929] rounded">
                    {t.code}
                  </span>
                  <span
                    className={`gcc-arcade-tag ${
                      isRunning
                        ? "bg-[#FF8A32] text-[#292929]"
                        : isFinished
                        ? "bg-[#FFB36B] text-[#292929]"
                        : "bg-[#E8E8E8] text-[#292929]"
                    }`}
                  >
                    {isRunning ? "RACING" : t.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#292929]">{t.name}</h3>
                <div className="font-mono text-xs text-[#A3A3A3] mt-1 font-medium">
                  {t.college || "Independent Robotics Entry"}
                </div>
              </div>

              {/* Timing Metric Footer */}
              <div className="border-t-2 border-[#292929] pt-3 flex justify-between items-center bg-[#FFF9F3] -mx-5 -mb-5 p-3 px-5 mt-2 rounded-b">
                <span className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-wider font-bold">
                  OFFICIAL BEST LAP
                </span>
                <span className="font-digital text-base font-bold text-[#FF8A32]">
                  {fmt(t.best_time_ms)}
                </span>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
