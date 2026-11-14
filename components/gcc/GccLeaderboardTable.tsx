"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Filter,
  Flag,
  Timer,
  Trophy,
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

interface GccLeaderboardTableProps {
  teams: Team[];
  activeTeamId?: string;
}

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

const getDelta = (time: number | null, leaderTime: number | null) => {
  if (time == null || leaderTime == null) return "—";
  const diff = (time - leaderTime) / 1000;
  if (diff <= 0) return "LEADER";
  return `+${diff.toFixed(2)}s`;
};

export default function GccLeaderboardTable({
  teams,
  activeTeamId,
}: GccLeaderboardTableProps) {
  const [filterPodiumOnly, setFilterPodiumOnly] = useState(false);

  const sorted = useMemo(() => {
    return [...teams].sort(
      (a, b) => (a.best_time_ms ?? Infinity) - (b.best_time_ms ?? Infinity)
    );
  }, [teams]);

  const p1Time = sorted.find((t) => t.best_time_ms != null)?.best_time_ms ?? null;

  const displayList = useMemo(() => {
    if (filterPodiumOnly) return sorted.slice(0, 3);
    return sorted;
  }, [sorted, filterPodiumOnly]);

  return (
    <div className="grid gap-5">
      {/* ── Motorsport Header Control Bar ── */}
      <Panel
        variant="default"
        padding="default"
        className="flex justify-between items-center flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#FF8A32] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] flex items-center justify-center">
            <Trophy size={18} color="#292929" />
          </div>
          <div>
            <h2 className="font-digital text-base font-extrabold m-0 tracking-wider text-[#292929]">
              OFFICIAL MOTORSPORT TIMING // LEADERBOARD
            </h2>
            <div className="font-mono text-[10px] text-[#A3A3A3] font-bold">
              SUB-MILLISECOND ESP32 CLOCK TIMESTAMPS · FASTEST LAP CRITERIA
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filterPodiumOnly ? "racing" : "peach"}
            size="sm"
            onClick={() => setFilterPodiumOnly((v) => !v)}
            className="text-xs"
          >
            <Filter size={13} />
            <span>{filterPodiumOnly ? "SHOWING PODIUM (TOP 3)" : "FILTER PODIUM"}</span>
          </Button>
        </div>
      </Panel>

      {/* ── Timing Board Matrix ── */}
      <div className="gcc-timing-board rounded-md overflow-hidden">
        {/* Table Column Headers */}
        <div className="gcc-timing-header grid grid-cols-[60px_1fr_120px_120px_100px] gap-3 px-4 py-3">
          <span>POS</span>
          <span>COMPETITOR / INSTITUTION</span>
          <span>BEST LAP</span>
          <span>GAP TO P1</span>
          <span>STATUS</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E8E8E8]">
          {displayList.map((t, idx) => {
            const isP1 = idx === 0 && t.best_time_ms != null;
            const isP2 = idx === 1 && t.best_time_ms != null;
            const isP3 = idx === 2 && t.best_time_ms != null;
            const isRunning = t.id === activeTeamId || t.status === "running";

            const rowClass = isP1
              ? "p1-row"
              : isP2
              ? "p2-row"
              : isP3
              ? "p3-row"
              : "";

            return (
              <div
                key={t.id}
                className={`gcc-timing-row ${rowClass} grid grid-cols-[60px_1fr_120px_120px_100px] gap-3 px-4 py-3.5`}
              >
                {/* Position Badge */}
                <div className="flex items-center">
                  <span
                    className={`font-digital font-black text-sm px-2 py-0.5 border border-[#292929] shadow-[1px_1px_0_#292929] rounded ${
                      isP1
                        ? "bg-[#FF8A32] text-[#292929]"
                        : isP2
                        ? "bg-[#FFB36B] text-[#292929]"
                        : isP3
                        ? "bg-[#F5D9C0] text-[#292929]"
                        : "bg-[#E8E8E8] text-[#292929]"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </div>

                {/* Team Info */}
                <div>
                  <div className="font-bold text-sm text-[#292929] flex items-center gap-2">
                    <span>{t.name}</span>
                    <span className="font-mono text-[10px] text-[#FF8A32] font-bold">
                      [{t.code}]
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#A3A3A3] mt-0.5 font-medium">
                    {t.college || "Independent Robotics"}
                  </div>
                </div>

                {/* Best Lap */}
                <div>
                  <span className="font-digital font-bold text-sm text-[#FF8A32]">
                    {fmt(t.best_time_ms)}
                  </span>
                </div>

                {/* Gap to P1 */}
                <div>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      getDelta(t.best_time_ms, p1Time) === "LEADER"
                        ? "text-[#22c55e] font-black"
                        : "text-[#A3A3A3]"
                    }`}
                  >
                    {getDelta(t.best_time_ms, p1Time)}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`gcc-arcade-tag ${
                      isRunning
                        ? "bg-[#FF8A32] text-[#292929]"
                        : t.status === "finished"
                        ? "bg-[#22c55e] text-white"
                        : "bg-[#E8E8E8] text-[#292929]"
                    }`}
                  >
                    {isRunning ? "RACING" : t.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
