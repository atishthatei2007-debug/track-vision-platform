"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  best_time_ms: number | null;
  status: string;
};

type Run = {
  id: string;
  team_id: string;
  status: string;
  elapsed_ms: number | null;
};

type Checkpoint = {
  id: string;
  checkpoint_no: number;
  detected_at: string;
};

interface GccAiAnalystProps {
  teams: Team[];
  active: Run | null;
  events: Checkpoint[];
}

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: Date;
  error?: boolean;
};

const SUGGESTIONS = [
  "Who's currently in pole position?",
  "How many teams have completed their runs?",
  "What's the fastest time so far?",
  "Give me a race summary report",
  "Which team is on track right now?",
  "Compare the top 3 teams",
];

export default function GccAiAnalyst({ teams, active, events }: GccAiAnalystProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "🏁 Welcome to the AI Race Analyst for NIRMAN 6.0 Track Vision. I have live access to all race telemetry, team data, and leaderboard standings. Ask me anything about the competition!",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sorted = [...teams].sort(
    (a, b) => (a.best_time_ms ?? Infinity) - (b.best_time_ms ?? Infinity)
  );
  const fastest = sorted.find((t) => t.best_time_ms != null);
  const activeTeam = active ? teams.find((t) => t.id === active.team_id) : null;

  const buildContext = () => ({
    teams: sorted.map((t) => ({
      code: t.code,
      name: t.name,
      college: t.college,
      best_time_ms: t.best_time_ms,
      status: t.status,
    })),
    activeTeamName: activeTeam?.name,
    activeRunStatus: active?.status,
    checkpointCount: events.length,
    fastestLapTeam: fastest?.name,
    fastestLapMs: fastest?.best_time_ms,
    totalRuns: teams.filter((t) => t.status === "finished").length,
  });

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: q,
      ts: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, raceContext: buildContext() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          text: data.reply ?? data.error ?? "No response received.",
          ts: new Date(),
          error: !res.ok,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "ai",
          text: "Connection error — could not reach the AI analyst. Check your GEMINI_API_KEY.",
          ts: new Date(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Header ── */}
      <div
        className="gcc-card"
        style={{
          padding: "16px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background:
            "radial-gradient(ellipse at top right, rgba(120, 60, 255, 0.1) 0%, rgba(10, 16, 26, 0.9) 60%)",
          borderColor: "rgba(130, 60, 255, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(130, 60, 255, 0.15)",
              border: "1px solid rgba(130, 60, 255, 0.5)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Sparkles size={18} color="#a855f7" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              AI RACE ANALYST
            </h2>
            <div className="mono muted" style={{ fontSize: 10 }}>
              GEMINI-POWERED · LIVE RACE CONTEXT · NIRMAN 6.0
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span
            className="mono"
            style={{
              fontSize: 10,
              padding: "4px 10px",
              borderRadius: 20,
              background: "rgba(130, 60, 255, 0.12)",
              border: "1px solid rgba(130, 60, 255, 0.35)",
              color: "#a855f7",
            }}
          >
            <Bot size={11} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
            Gemini Flash
          </span>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome-reset",
                  role: "ai",
                  text: "🏁 AI Race Analyst reset. Ask me anything about the NIRMAN 6.0 Track Vision competition!",
                  ts: new Date(),
                },
              ])
            }
            className="gcc-tab-btn"
            style={{ fontSize: 10, padding: "5px 10px", gap: 6 }}
          >
            <RefreshCw size={11} />
            CLEAR
          </button>
        </div>
      </div>

      {/* ── Suggestion chips ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            className="gcc-tab-btn"
            style={{ fontSize: 10, padding: "5px 12px" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Chat window ── */}
      <div
        className="gcc-card"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 420,
          maxHeight: 560,
          overflow: "hidden",
        }}
      >
        {/* Messages */}
        <div data-lenis-prevent style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px" }}>
          <div style={{ display: "grid", gap: 16 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      m.role === "ai"
                        ? "rgba(130,60,255,0.2)"
                        : "rgba(255,106,0,0.2)",
                    border: `1px solid ${m.role === "ai" ? "rgba(130,60,255,0.5)" : "rgba(255,106,0,0.4)"}`,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {m.role === "ai" ? (
                    <Sparkles size={14} color="#a855f7" />
                  ) : (
                    <Bot size={14} color="#ff6a00" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "12px 16px",
                    borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, rgba(255,106,0,0.18), rgba(200,80,0,0.1))"
                      : m.error
                      ? "rgba(255,42,85,0.1)"
                      : "rgba(10,18,30,0.8)",
                    border: `1px solid ${
                      m.role === "user"
                        ? "rgba(255,106,0,0.35)"
                        : m.error
                        ? "rgba(255,42,85,0.3)"
                        : "rgba(45,75,110,0.4)"
                    }`,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: m.error ? "#ff8fa3" : "#e5f2ff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                  <div
                    className="mono muted"
                    style={{ fontSize: 9, marginTop: 6, opacity: 0.6 }}
                  >
                    {m.ts.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(130,60,255,0.2)",
                    border: "1px solid rgba(130,60,255,0.5)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Sparkles size={14} color="#a855f7" />
                </div>
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: "4px 16px 16px 16px",
                    background: "rgba(10,18,30,0.8)",
                    border: "1px solid rgba(45,75,110,0.4)",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#a855f7",
                        animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(45,75,110,0.35)",
            background: "rgba(6,11,20,0.7)",
            display: "flex",
            gap: 10,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask about the race, teams, or times..."
            disabled={loading}
            className="field"
            style={{ flex: 1, height: 42, fontSize: 13 }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ height: 42, padding: "0 18px", gap: 8, fontSize: 12 }}
          >
            <Send size={15} />
            {loading ? "..." : "ASK"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
