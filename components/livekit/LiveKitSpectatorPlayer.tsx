"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  ConnectionQuality,
  ConnectionState,
} from "livekit-client";
import {
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Volume2,
  VolumeX,
  Radio,
  Wifi,
  WifiOff,
  Signal,
  Eye,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LiveKitSpectatorPlayer() {
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<string>("connecting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted to satisfy browser autoplay policies
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<string>("Good");
  const [showControls, setShowControls] = useState<boolean>(false);
  const [broadcasterCount, setBroadcasterCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<Room | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect as Spectator to track-vision-live
  const connectToStream = useCallback(async () => {
    setConnectionState("connecting");
    setErrorMessage("");

    // Clean up previous room instance if any
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    try {
      // 1. Check for existing Supabase session (optional for spectators)
      const db = getSupabaseBrowser();
      let accessToken = "";
      if (db) {
        const { data } = await db.auth.getSession();
        accessToken = data?.session?.access_token || "";
      }

      // 2. Request spectator token from /api/livekit/token
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers,
        body: JSON.stringify({
          role: "spectator",
          room: "track-vision-live",
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let tokenData: any = null;
      if (contentType.includes("application/json")) {
        tokenData = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned non-JSON response (${res.status}). Server may be compiling. Retrying...`);
      }

      if (!res.ok || !tokenData) {
        throw new Error(tokenData?.error || `Failed to obtain live stream credentials (${res.status}).`);
      }

      // Helper to attach remote video with guaranteed DOM playback & autoplay policy handling
      const attachVideo = (track: RemoteTrack) => {
        if (videoElementRef.current) {
          const el = videoElementRef.current;
          el.muted = true; // Required by Chrome/Edge autoplay policy
          track.attach(el);
          el.play().catch((err) => {
            console.warn("Spectator video autoplay waiting for interaction:", err);
          });
          setHasVideo(true);
        }
      };

      // Helper to attach remote audio
      const attachAudio = (track: RemoteTrack) => {
        if (audioElementRef.current) {
          const el = audioElementRef.current;
          track.attach(el);
          el.muted = isMuted;
          el.play().catch(() => {});
        }
      };

      // 3. Initialize LiveKit Room instance (Disable dynacast & adaptiveStream to ensure instant playback)
      const room = new Room({
        adaptiveStream: false,
        dynacast: false,
      });
      roomRef.current = room;

      // 4. Handle Track Subscriptions
      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, _participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Video) {
            attachVideo(track);
            setBroadcasterCount(room.remoteParticipants.size);
          } else if (track.kind === Track.Kind.Audio) {
            attachAudio(track);
          }
        }
      );

      // Handle Track Published (ensure auto-subscribe is active)
      room.on(RoomEvent.TrackPublished, (pub: RemoteTrackPublication) => {
        if (!pub.isSubscribed) {
          pub.setSubscribed(true);
        }
      });

      // Handle Track Unmuted (ensure video is active when unmuted)
      room.on(RoomEvent.TrackUnmuted, (pub) => {
        if (pub.kind === Track.Kind.Video && pub.track) {
          attachVideo(pub.track as RemoteTrack);
        }
      });

      // Handle Track Unsubscriptions
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach();

        // Check if any other remote video track is active
        const hasAnyVideo = Array.from(room.remoteParticipants.values()).some((p) =>
          Array.from(p.videoTrackPublications.values()).some((pub) => pub.isSubscribed && pub.track)
        );
        setHasVideo(hasAnyVideo);
        setBroadcasterCount(room.remoteParticipants.size);
      });

      // Participant connect/disconnect events
      room.on(RoomEvent.ParticipantConnected, () => {
        setBroadcasterCount(room.remoteParticipants.size);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        const hasAnyVideo = Array.from(room.remoteParticipants.values()).some((p) =>
          Array.from(p.videoTrackPublications.values()).some((pub) => pub.isSubscribed && pub.track)
        );
        setHasVideo(hasAnyVideo);
        setBroadcasterCount(room.remoteParticipants.size);
      });

      // Connection state listeners
      room.on(RoomEvent.Connected, () => {
        setConnectionState("connected");
        setBroadcasterCount(room.remoteParticipants.size);
      });

      room.on(RoomEvent.Reconnecting, () => {
        setConnectionState("reconnecting");
      });

      room.on(RoomEvent.Reconnected, () => {
        setConnectionState("connected");
      });

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState("disconnected");
        setHasVideo(false);
      });

      room.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality) => {
        switch (quality) {
          case ConnectionQuality.Excellent:
            setConnectionQuality("Excellent");
            break;
          case ConnectionQuality.Good:
            setConnectionQuality("Good");
            break;
          case ConnectionQuality.Poor:
            setConnectionQuality("Poor");
            break;
          default:
            setConnectionQuality("Normal");
        }
      });

      // 5. Connect room to LiveKit server
      await room.connect(tokenData.url, tokenData.token);

      // 6. Inspect already-published tracks if broadcaster joined before spectator
      for (const p of room.remoteParticipants.values()) {
        for (const pub of p.videoTrackPublications.values()) {
          if (pub.track) {
            attachVideo(pub.track);
          } else if (!pub.isSubscribed) {
            pub.setSubscribed(true);
          }
        }
        for (const pub of p.audioTrackPublications.values()) {
          if (pub.track) {
            attachAudio(pub.track);
          } else if (!pub.isSubscribed) {
            pub.setSubscribed(true);
          }
        }
      }
      setBroadcasterCount(room.remoteParticipants.size);
    } catch (err) {
      console.error("LiveKit Spectator connect error:", err);
      const msg = err instanceof Error ? err.message : "Could not connect to live stream.";
      setErrorMessage(msg);
      setConnectionState("error");

      // Auto-retry connection in 3 seconds to recover from transient server compilation/restarts
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectToStream();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    connectToStream();

    // Listen to Fullscreen changes
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [connectToStream]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Mute / Unmute Handler
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioElementRef.current) {
        audioElementRef.current.muted = next;
      }
      return next;
    });
  };

  // Volume Slider Handler
  const handleVolume = (val: number) => {
    setVolume(val);
    if (audioElementRef.current) {
      audioElementRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioElementRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioElementRef.current.muted = false;
      }
    }
  };

  const isConnected = connectionState === "connected";
  const isReconnecting = connectionState === "reconnecting";

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{
        position: "relative",
        aspectRatio: "16/9",
        background: "#03060a",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(45, 75, 110, 0.4)",
        boxShadow: hasVideo ? "0 0 35px rgba(0, 240, 255, 0.15)" : "none",
      }}
    >
      {/* ── 1. ACTIVE LIVE WEBRTC VIDEO LAYER (Always in layout so viewport is measured accurately) ── */}
      <video
        ref={videoElementRef}
        autoPlay
        playsInline
        muted={isMuted}
        onLoadedMetadata={() => setHasVideo(true)}
        onPlaying={() => setHasVideo(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "#000",
          zIndex: 1,
        }}
      />

      {/* Hidden Audio Renderer */}
      <audio ref={audioElementRef} autoPlay muted={isMuted} />

      {/* ── 2. STANDBY / OFFLINE SCREEN (When no camera broadcaster is streaming) ── */}
      {!hasVideo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 24,
            textAlign: "center",
            background: "radial-gradient(circle at center, #091422 0%, #03060a 100%)",
            zIndex: 2,
          }}
        >
          <div>
            {/* Animated Radar Pulse Icon */}
            <div
              style={{
                width: 76,
                height: 76,
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: "rgba(0, 240, 255, 0.08)",
                border: "1px solid rgba(0, 240, 255, 0.35)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 35px rgba(0, 240, 255, 0.2)",
                position: "relative",
              }}
            >
              <Radio size={32} color="#00f0ff" />
              <span
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  border: "1px solid rgba(0, 240, 255, 0.2)",
                  animation: "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            </div>

            {/* Standby Messaging */}
            <div
              className="digital"
              style={{
                fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              {isReconnecting
                ? "RECONNECTING TO LIVE STREAM..."
                : isConnected
                ? "LIVE TRACK FEED // STANDBY"
                : "CONNECTING TO LIVEKIT WEBRTC..."}
            </div>

            <p
              className="muted mono"
              style={{
                fontSize: 12,
                maxWidth: 420,
                margin: "0 auto 18px",
                lineHeight: 1.5,
                color: "#8da3be",
              }}
            >
              {isReconnecting
                ? "Network stream interrupted. Re-establishing WebRTC telemetry bridge..."
                : "Awaiting real-time DroidCam camera uplink from Race Control. Video will play automatically as soon as the race marshal broadcasts."}
            </p>

            {/* Status Pills */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px",
                borderRadius: 20,
                background: "rgba(10, 20, 32, 0.7)",
                border: "1px solid rgba(45, 75, 110, 0.4)",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isConnected ? "#ffaa00" : "#ff496b",
                  boxShadow: `0 0 10px ${isConnected ? "#ffaa00" : "#ff496b"}`,
                }}
              />
              <span className="mono" style={{ fontSize: 11, color: isConnected ? "#ffaa00" : "#ff496b", fontWeight: 700 }}>
                {isConnected ? "WEBRTC STANDBY // ROOM: track-vision-live" : "CONNECTING TO SIGNAL"}
              </span>
            </div>

            {/* Manual Reconnect Action */}
            <div>
              <button
                onClick={connectToStream}
                className="btn"
                style={{
                  fontSize: 11,
                  padding: "8px 16px",
                  gap: 8,
                  background: "rgba(10, 20, 34, 0.8)",
                  border: "1px solid rgba(0, 240, 255, 0.35)",
                  color: "#00f0ff",
                }}
              >
                <RefreshCw size={13} color="#00f0ff" />
                <span>Refresh Video Uplink</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. TOP TELEMETRY HUD OVERLAY (Always visible on hover / permanent on mobile) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "12px 18px",
          background: "linear-gradient(to bottom, rgba(3, 6, 10, 0.85) 0%, transparent 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        {/* Left: Live Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "4px 10px",
              borderRadius: 6,
              background: hasVideo ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 170, 0, 0.15)",
              border: `1px solid ${hasVideo ? "#00ff88" : "#ffaa00"}`,
            }}
          >
            <span
              className={`live-beacon ${hasVideo ? "live-dot-green" : ""}`}
              style={{ background: hasVideo ? "#00ff88" : "#ffaa00" }}
            />
            <span
              className="mono"
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: hasVideo ? "#00ff88" : "#ffaa00",
                letterSpacing: "0.1em",
              }}
            >
              {hasVideo ? "LIVE WEBRTC" : "STANDBY"}
            </span>
          </div>

          <span
            className="mono"
            style={{
              fontSize: 10,
              color: "#8da3be",
              letterSpacing: "0.08em",
            }}
          >
            LATENCY: <strong style={{ color: "#00f0ff" }}>&lt;200ms</strong>
          </span>
        </div>

        {/* Right: Signal Quality Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <span className="mono" style={{ fontSize: 10, color: "#8da3be" }}>
            QUALITY: <strong style={{ color: "#00ff88" }}>{connectionQuality}</strong>
          </span>
        </div>
      </div>

      {/* ── 4. BOTTOM INTERACTIVE CONTROLS BAR (Appears on Hover / Always accessible) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 18px",
          background: "linear-gradient(to top, rgba(3, 6, 10, 0.9) 0%, transparent 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          zIndex: 3,
          opacity: showControls || !hasVideo ? 1 : 0.85,
          transition: "opacity 0.25s ease",
        }}
      >
        {/* Left: Volume & Mute Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggleMute}
            className="btn"
            style={{
              padding: "6px 10px",
              fontSize: 11,
              background: "rgba(10, 20, 32, 0.8)",
              border: "1px solid rgba(45, 75, 110, 0.4)",
            }}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={14} color="#ff496b" /> : <Volume2 size={14} color="#00ff88" />}
            <span style={{ fontSize: 10, color: isMuted ? "#ff496b" : "#fff" }}>
              {isMuted ? "MUTED" : `${Math.round(volume * 100)}%`}
            </span>
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolume(parseFloat(e.target.value))}
            style={{
              width: 75,
              accentColor: "#ff6a00",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Right: Reconnect & Fullscreen Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={connectToStream}
            className="btn"
            style={{
              padding: "6px 10px",
              fontSize: 11,
              background: "rgba(10, 20, 32, 0.8)",
              border: "1px solid rgba(45, 75, 110, 0.4)",
            }}
            title="Reconnect to stream"
          >
            <RefreshCw size={13} color="#00f0ff" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn"
            style={{
              padding: "6px 12px",
              fontSize: 11,
              background: "rgba(10, 20, 32, 0.8)",
              border: "1px solid rgba(0, 240, 255, 0.35)",
              color: "#00f0ff",
            }}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}
