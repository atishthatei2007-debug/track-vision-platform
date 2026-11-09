import { NextRequest, NextResponse } from "next/server";
import { AccessToken, TrackSource } from "livekit-server-sdk";
import { requireAdmin, requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ROOM_NAME = "track-vision-live";
const TOKEN_TTL_SECONDS = 3600; // 1-hour short-lived token

type LiveKitRole = "broadcaster" | "spectator";

interface TokenRequestBody {
  role?: string;
  room?: string;
  identity?: string;
  name?: string;
}

async function generateLiveKitToken(
  req: NextRequest,
  params: TokenRequestBody
) {
  // 1. Read and validate server-side LiveKit environment configuration
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json(
      { error: "LiveKit server credentials are not configured" },
      { status: 500 }
    );
  }

  // 2. Validate participant role input (defaults to spectator)
  const roleInput = (params.role ?? "spectator").toLowerCase().trim();
  if (roleInput !== "broadcaster" && roleInput !== "spectator") {
    return NextResponse.json(
      { error: "Invalid role. Role must be 'broadcaster' or 'spectator'" },
      { status: 400 }
    );
  }
  const role = roleInput as LiveKitRole;

  // 3. Enforce consistent room name: track-vision-live
  if (params.room && params.room.trim() !== ROOM_NAME) {
    return NextResponse.json(
      { error: `Invalid room name. Room must be '${ROOM_NAME}'` },
      { status: 400 }
    );
  }

  // 4. Authenticate & Authorize via existing Supabase auth system
  let user: { id: string; email?: string; user_metadata?: Record<string, any> } | null = null;
  let isAdmin = false;

  if (role === "broadcaster") {
    // Broadcaster: Admin-only role authorized to publish audio/video tracks
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    user = auth.user;
    isAdmin = true;
  } else {
    // Spectator: Verify Supabase session if token provided, or permit public spectator
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (token) {
      const auth = await requireUser(req);
      if (auth.ok) {
        user = auth.user;
        isAdmin = auth.isAdmin;
      }
    }
  }

  // 5. Validate optional identity and display name
  const requestedIdentity = typeof params.identity === "string" ? params.identity.trim() : "";
  if (requestedIdentity && (requestedIdentity.length > 128 || /[\r\n\0]/.test(requestedIdentity))) {
    return NextResponse.json(
      { error: "Invalid identity format" },
      { status: 400 }
    );
  }

  const requestedName = typeof params.name === "string" ? params.name.trim() : "";
  if (requestedName && requestedName.length > 100) {
    return NextResponse.json(
      { error: "Participant name is too long" },
      { status: 400 }
    );
  }

  // Ensure each participant connection has a unique identity in the room to prevent duplicate disconnects
  const rolePrefix = role === "broadcaster" ? "broadcaster" : "spectator";
  const userSuffix = user ? user.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 8) : "anon";
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const identity =
    requestedIdentity ||
    `${rolePrefix}_${userSuffix}_${randomSuffix}`;

  const participantName =
    requestedName ||
    (user?.user_metadata?.full_name as string) ||
    (user?.email ? user.email.split("@")[0] : undefined) ||
    (isAdmin ? "Race Director" : "Spectator");

  // 6. Generate short-lived LiveKit access token with strict permissions
  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName,
      ttl: TOKEN_TTL_SECONDS,
      metadata: JSON.stringify({
        role,
        isAdmin,
        userId: user ? user.id : "public_spectator",
      }),
    });

    if (role === "broadcaster") {
      // Broadcaster can publish camera and microphone tracks, and subscribe
      at.addGrant({
        room: ROOM_NAME,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canPublishSources: [
          TrackSource.CAMERA,
          TrackSource.MICROPHONE,
          TrackSource.SCREEN_SHARE,
          TrackSource.SCREEN_SHARE_AUDIO,
        ],
      });
    } else {
      // Spectator can subscribe to tracks but CANNOT publish
      at.addGrant({
        room: ROOM_NAME,
        roomJoin: true,
        canPublish: false,
        canSubscribe: true,
        canPublishData: false,
      });
    }

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: livekitUrl,
      room: ROOM_NAME,
      identity,
      name: participantName,
      role,
      expiresIn: TOKEN_TTL_SECONDS,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return generateLiveKitToken(req, body ?? {});
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params: TokenRequestBody = {
    role: searchParams.get("role") ?? undefined,
    room: searchParams.get("room") ?? undefined,
    identity: searchParams.get("identity") ?? undefined,
    name: searchParams.get("name") ?? undefined,
  };
  return generateLiveKitToken(req, params);
}
