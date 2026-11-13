import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
];

type InteractionStep = {
  type?: string;
  content?: Array<{ type?: string; text?: string }>;
};

function extractInteractionReply(data: {
  output_text?: string;
  steps?: InteractionStep[];
}): string | null {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const textParts = (data?.steps ?? [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content ?? [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text as string);

  const joined = textParts.join("\n").trim();
  return joined || null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured. Add it to .env.local to enable the AI Analyst." },
      { status: 503 }
    );
  }

  let body: {
    message: string;
    raceContext?: {
      teams: { code: string; name: string; college: string; best_time_ms: number | null; status: string }[];
      activeTeamName?: string;
      activeRunStatus?: string;
      checkpointCount?: number;
      fastestLapTeam?: string;
      fastestLapMs?: number | null;
      totalRuns?: number;
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, raceContext } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // Build a tightly-scoped system prompt from live race context
  const ctx = raceContext;
  const teamLines = ctx?.teams
    ?.map(
      (t, i) =>
        `  ${i + 1}. [${t.code}] ${t.name} (${t.college}) — Best: ${
          t.best_time_ms != null ? (t.best_time_ms / 1000).toFixed(2) + "s" : "No time yet"
        } — Status: ${t.status}`
    )
    .join("\n") ?? "  No teams registered yet.";

  const systemPrompt = `You are the AI Race Analyst for the NIRMAN 6.0 Track Vision Line Follower Robotics Competition. You have live access to race telemetry and answer questions from spectators, organizers, and teams.

CURRENT RACE STATE:
- Active team on track: ${ctx?.activeTeamName ?? "None"}
- Run status: ${ctx?.activeRunStatus ?? "No active run"}
- Checkpoints cleared in active run: ${ctx?.checkpointCount ?? 0}/4
- Pole position (fastest lap): ${ctx?.fastestLapTeam ?? "—"} at ${ctx?.fastestLapMs != null ? (ctx.fastestLapMs / 1000).toFixed(2) + "s" : "—"}
- Total teams: ${ctx?.teams?.length ?? 0}

REGISTERED TEAMS (sorted by best time):
${teamLines}

COMPETITION FORMAT:
- 4 optical laser gates (ESP32 ADC1) measure split times
- Server-side timestamps ensure tamper-proof timing
- Best lap across all runs counts for the leaderboard
- Runs can be aborted by organizers; aborted runs do not enter the leaderboard

GUIDELINES:
- Be concise, accurate, and enthusiastic about the competition
- Use the provided race data; do not fabricate times or results
- If asked something outside your data, say so honestly
- Keep responses under 150 words unless a detailed report is requested
- Format numbers like 42.35s, never invent times`;

  try {
    let lastStatus = 502;
    let lastErrText = "";

    for (const model of GEMINI_MODELS) {
      try {
        const geminiRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/interactions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
              "Api-Revision": "2026-05-20",
            },
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
              model,
              system_instruction: systemPrompt,
              input: message,
              generation_config: {
                max_output_tokens: 1536,
                thinking_level: "low",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply =
            extractInteractionReply(data) ??
            "I'm having trouble generating a response right now. Please try again.";
          return NextResponse.json({ reply, model });
        }

        lastStatus = geminiRes.status;
        lastErrText = await geminiRes.text();
        console.warn(`Gemini model ${model} failed (${lastStatus}):`, lastErrText);

        // Retry next fallback model on transient availability/rate-limit errors
        if (![404, 429, 500, 503].includes(lastStatus)) {
          break;
        }
      } catch (fetchErr) {
        lastStatus = 504;
        lastErrText = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.warn(`Gemini model ${model} timed out or errored:`, lastErrText);
      }
    }

    console.error("All Gemini models failed:", lastStatus, lastErrText);
    return NextResponse.json(
      { error: "Gemini API request failed. Please try again in a moment." },
      { status: 502 }
    );
  } catch (err) {
    console.error("AI analyst error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
