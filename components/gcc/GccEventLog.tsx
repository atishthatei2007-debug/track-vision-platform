"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Filter,
  Radio,
  RotateCcw,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

type LogEntry = {
  id: string;
  ts: Date;
  kind: "checkpoint" | "run_start" | "run_finish" | "run_abort" | "connection" | "system";
  title: string;
  detail?: string;
  color: string;
};

type Checkpoint = {
  id: string;
  run_id: string;
  checkpoint_no: number;
  detected_at: string;
};

type Run = {
  id: string;
  team_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  elapsed_ms: number | null;
};

type Team = {
  id: string;
  name: string;
  code: string;
};

interface GccEventLogProps {
  teams: Team[];
  active: Run | null;
  events: Checkpoint[];
  connected: boolean;
}

const KIND_FILTERS = ["all", "checkpoint", "run", "connection", "system"] as const;
type KindFilter = (typeof KIND_FILTERS)[number];

function matchesFilter(entry: LogEntry, filter: KindFilter): boolean {
  if (filter === "all") return true;
  if (filter === "run") return ["run_start", "run_finish", "run_abort"].includes(entry.kind);
  return entry.kind === filter;
}

const kindIcon = (kind: LogEntry["kind"]) => {
  switch (kind) {
    case "checkpoint": return <CheckCircle2 size={13} />;
    case "run_start": return <Zap size={13} />;
    case "run_finish": return <Activity size={13} />;
    case "run_abort": return <XCircle size={13} />;
    case "connection": return <Wifi size={13} />;
    default: return <Clock size={13} />;
  }
};

const kindLabel = (kind: LogEntry["kind"]) => {
  switch (kind) {
    case "checkpoint": return "GATE";
    case "run_start": return "START";
    case "run_finish": return "FINISH";
    case "run_abort": return "ABORT";
    case "connection": return "CONN";
    default: return "SYS";
  }
};

export default function GccEventLog({ teams, active, events, connected }: GccEventLogProps) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<KindFilter>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevConnected = useRef<boolean | null>(null);
  const prevActiveId = useRef<string | null | undefined>(null);
  const prevActiveStatus = useRef<string | null | undefined>(null);
  const prevEventIds = useRef<Set<string>>(new Set());

  // Seed startup system log
  useEffect(() => {
    setLog([
      {
        id: "boot",
        ts: new Date(),
        kind: "system",
        title: "Track Vision GCC Event Logger initialized",
        detail: "Supabase Realtime channels subscribed",
        color: "#8da3be",
      },
    ]);
  }, []);

  // Track connection state changes
  useEffect(() => {
    if (prevConnected.current === null) {
      prevConnected.current = connected;
      return;
    }
    if (connected !== prevConnected.current) {
      setLog((prev) => [
        ...prev,
        {
          id: `conn-${Date.now()}`,
          ts: new Date(),
          kind: "connection",
          title: connected ? "Supabase Realtime connected" : "Supabase Realtime disconnected",
          detail: connected ? "WebSocket handshake established" : "Attempting reconnect...",
          color: connected ? "#00ff88" : "#ff496b",
        },
      ]);
      prevConnected.current = connected;
    }
  }, [connected]);

  // Track run state changes
  useEffect(() => {
    const prevId = prevActiveId.current;
    const prevStatus = prevActiveStatus.current;
    const curId = active?.id;
    const curStatus = active?.status;

    if (curId !== prevId || curStatus !== prevStatus) {
      if (curId && curId !== prevId && curStatus === "running") {
        const team = teams.find((t) => t.id === active?.team_id);
        setLog((prev) => [
          ...prev,
          {
            id: `run-start-${curId}`,
            ts: active?.started_at ? new Date(active.started_at) : new Date(),
            kind: "run_start",
            title: `Run started — ${team?.name ?? "Unknown team"} [${team?.code ?? "?"}]`,
            detail: `Run ID: ${curId?.slice(0, 8)}…`,
            color: "#00f0ff",
          },
        ]);
      }
      if (prevId && curStatus === "finished" && prevStatus === "running") {
        const team = teams.find((t) => t.id === active?.team_id);
        const elapsed = active?.elapsed_ms != null ? (active.elapsed_ms / 1000).toFixed(2) + "s" : "—";
        setLog((prev) => [
          ...prev,
          {
            id: `run-finish-${curId}-${Date.now()}`,
            ts: active?.finished_at ? new Date(active.finished_at) : new Date(),
            kind: "run_finish",
            title: `Run finished — ${team?.name ?? "Unknown team"} · ${elapsed}`,
            detail: "All 4 gates cleared. Official time recorded.",
            color: "#00ff88",
          },
        ]);
      }
      if (prevId && curStatus === "aborted" && prevStatus === "running") {
        setLog((prev) => [
          ...prev,
          {
            id: `run-abort-${curId}-${Date.now()}`,
            ts: new Date(),
            kind: "run_abort",
            title: "Run aborted by organizer",
            detail: "Run will not enter the leaderboard.",
            color: "#ff496b",
          },
        ]);
      }
    }
    prevActiveId.current = curId;
    prevActiveStatus.current = curStatus;
  }, [active, teams]);

  // Track new checkpoint events
  useEffect(() => {
    const prevIds = prevEventIds.current;
    const newEvents = events.filter((e) => !prevIds.has(e.id));

    if (newEvents.length > 0) {
      const entries: LogEntry[] = newEvents.map((e) => {
        const gateNames: Record<number, string> = {
          1: "START LINE BEAM",
          2: "SECTOR 1 SPLIT",
          3: "SECTOR 2 HAIRPIN",
          4: "FINISH LINE BEAM",
        };
        return {
          id: `cp-${e.id}`,
          ts: new Date(e.detected_at),
          kind: "checkpoint",
          title: `Gate 0${e.checkpoint_no} tripped — ${gateNames[e.checkpoint_no] ?? ""}`,
          detail: `Interrupt at ${new Date(e.detected_at).toLocaleTimeString()} · Run ${e.run_id.slice(0, 8)}…`,
          color: "#00ff88",
        };
      });
      setLog((prev) => [...prev, ...entries]);
      newEvents.forEach((e) => prevIds.add(e.id));
    }
  }, [events]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [log, autoScroll]);

  const displayed = log.filter((e) => matchesFilter(e, filter));

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Header ── */}
      <div
        className="gcc-card"
        style={{
          padding: "16px 20px",
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
              background: "rgba(0, 240, 255, 0.12)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Radio size={18} color="#00f0ff" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              LIVE TELEMETRY EVENT LOG
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              REAL-TIME RACE SYSTEM EVENTS · {log.length} TOTAL ENTRIES
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 6 }}>
            {KIND_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`gcc-tab-btn ${filter === f ? "active" : ""}`}
                style={{ fontSize: 10, padding: "5px 10px", textTransform: "uppercase" }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll((s) => !s)}
            className={`gcc-tab-btn ${autoScroll ? "active" : ""}`}
            style={{ fontSize: 10, padding: "5px 10px", gap: 6 }}
          >
            <RotateCcw size={11} />
            AUTO-SCROLL
          </button>
        </div>
      </div>

      {/* ── Log Stream ── */}
      <div
        className="gcc-card"
        style={{
          padding: "0",
          overflow: "hidden",
          minHeight: 420,
          maxHeight: 600,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Column header */}
        <div
          className="mono"
          style={{
            display: "grid",
            gridTemplateColumns: "80px 70px 1fr 160px",
            gap: 12,
            padding: "10px 18px",
            fontSize: 9,
            color: "#6c84a0",
            letterSpacing: "0.14em",
            borderBottom: "1px solid rgba(45, 75, 110, 0.35)",
            background: "rgba(6, 11, 20, 0.6)",
          }}
        >
          <span>TYPE</span>
          <span>TIMESTAMP</span>
          <span>EVENT</span>
          <span>DETAIL</span>
        </div>

        {/* Rows */}
        <div data-lenis-prevent style={{ overflowY: "auto", flex: 1 }}>
          {displayed.length === 0 ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#6c84a0",
              }}
            >
              <Clock size={24} color="#2d4b6e" style={{ marginBottom: 10 }} />
              <div>No events yet. Waiting for race activity...</div>
            </div>
          ) : (
            [...displayed].reverse().map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 70px 1fr 160px",
                  gap: 12,
                  padding: "9px 18px",
                  alignItems: "center",
                  background:
                    idx % 2 === 0 ? "rgba(8, 14, 24, 0.5)" : "rgba(5, 10, 18, 0.3)",
                  borderBottom: "1px solid rgba(35, 55, 80, 0.2)",
                  transition: "background 0.15s ease",
                  animation: idx === 0 ? "fadeInRow 0.3s ease" : undefined,
                }}
              >
                {/* Type badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 7px",
                    borderRadius: 5,
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: entry.color,
                    background: `${entry.color}18`,
                    border: `1px solid ${entry.color}40`,
                  }}
                >
                  {kindIcon(entry.kind)}
                  {kindLabel(entry.kind)}
                </span>

                {/* Timestamp */}
                <span
                  className="mono muted"
                  style={{ fontSize: 10, whiteSpace: "nowrap" }}
                >
                  {entry.ts.toLocaleTimeString()}
                </span>

                {/* Title */}
                <span style={{ fontSize: 12, color: "#e5f2ff", fontWeight: 500 }}>
                  {entry.title}
                </span>

                {/* Detail */}
                <span
                  className="mono muted"
                  style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {entry.detail ?? "—"}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
