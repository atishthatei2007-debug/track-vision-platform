import { NextRequest, NextResponse } from "next/server";
import {
  IngressClient,
  IngressInput,
  IngressVideoEncodingPreset,
  IngressAudioEncodingPreset,
  IngressVideoOptions,
  IngressAudioOptions,
  TrackSource,
  RoomServiceClient,
} from "livekit-server-sdk";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ROOM_NAME = "track-vision-live";

function getLiveKitClients() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    throw new Error("LiveKit server credentials are not configured in environment variables.");
  }

  const ingressClient = new IngressClient(livekitUrl, apiKey, apiSecret);
  const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

  return { ingressClient, roomService, livekitUrl };
}

/**
 * GET /api/admin/ingress
 * Lists active WHIP ingresses and checks if OBS is currently broadcasting.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { ingressClient, roomService } = getLiveKitClients();

    const [ingresses, participants] = await Promise.all([
      ingressClient.listIngress({ roomName: ROOM_NAME }),
      roomService.listParticipants(ROOM_NAME).catch(() => []),
    ]);

    // Check if an OBS or WHIP publisher is currently connected
    const obsParticipant = participants.find(
      (p) =>
        p.identity.startsWith("obs-") ||
        p.name?.toLowerCase().includes("obs") ||
        p.identity.includes("whip")
    );

    const whipIngress = ingresses.find(
      (ing) => ing.inputType === IngressInput.WHIP_INPUT || ing.roomName === ROOM_NAME
    );

    return NextResponse.json({
      ok: true,
      roomName: ROOM_NAME,
      activeIngress: whipIngress
        ? {
            ingressId: whipIngress.ingressId,
            name: whipIngress.name,
            url: whipIngress.url,
            streamKey: whipIngress.streamKey,
            inputType: whipIngress.inputType,
            state: whipIngress.state,
          }
        : null,
      isObsStreaming: !!obsParticipant,
      obsParticipant: obsParticipant
        ? {
            identity: obsParticipant.identity,
            name: obsParticipant.name,
            state: obsParticipant.state,
            tracks: obsParticipant.tracks.map((t) => ({
              name: t.name,
              type: t.type,
              width: t.width,
              height: t.height,
              simulcast: t.simulcast,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/admin/ingress error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ingress state" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ingress
 * Creates or reuses a WHIP Ingress session with 3-layer simulcast for OBS Studio.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { ingressClient } = getLiveKitClients();

    // Check existing ingresses to prevent creating duplicate endpoints
    const existing = await ingressClient.listIngress({ roomName: ROOM_NAME });
    const existingWhip = existing.find(
      (ing) => ing.inputType === IngressInput.WHIP_INPUT && ing.roomName === ROOM_NAME
    );

    if (existingWhip && existingWhip.url && existingWhip.streamKey) {
      return NextResponse.json({
        ok: true,
        reused: true,
        ingressId: existingWhip.ingressId,
        url: existingWhip.url,
        streamKey: existingWhip.streamKey,
        roomName: ROOM_NAME,
      });
    }

    // Create new WHIP Ingress with 3-layer adaptive simulcast (720p 30fps)
    const ingress = await ingressClient.createIngress(IngressInput.WHIP_INPUT, {
      name: "obs-track-camera",
      roomName: ROOM_NAME,
      participantIdentity: "obs-track-camera",
      participantName: "OBS Master Broadcast",
      enableTranscoding: true,
      video: new IngressVideoOptions({
        name: "obs-video",
        source: TrackSource.CAMERA,
        encodingOptions: {
          case: "preset",
          value: IngressVideoEncodingPreset.H264_720P_30FPS_3_LAYERS,
        },
      }),
      audio: new IngressAudioOptions({
        name: "obs-audio",
        source: TrackSource.MICROPHONE,
        encodingOptions: {
          case: "preset",
          value: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
        },
      }),
    });

    return NextResponse.json({
      ok: true,
      reused: false,
      ingressId: ingress.ingressId,
      url: ingress.url,
      streamKey: ingress.streamKey,
      roomName: ROOM_NAME,
    });
  } catch (error) {
    console.error("POST /api/admin/ingress error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create WHIP ingress" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ingress
 * Deletes an existing WHIP Ingress session.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const ingressId = searchParams.get("ingressId");

    if (!ingressId) {
      return NextResponse.json({ error: "Missing ingressId query parameter" }, { status: 400 });
    }

    const { ingressClient } = getLiveKitClients();
    await ingressClient.deleteIngress(ingressId);

    return NextResponse.json({ ok: true, deleted: ingressId });
  } catch (error) {
    console.error("DELETE /api/admin/ingress error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete ingress" },
      { status: 500 }
    );
  }
}
