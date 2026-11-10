"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  Track,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  ConnectionQuality,
  VideoPresets,
  setLogLevel,
} from "livekit-client";

if (typeof window !== "undefined") {
  try {
    setLogLevel("warn");
  } catch {}
}
import {
  Camera,
  Mic,
  Radio,
  RefreshCw,
  AlertCircle,
  Play,
  Square,
  Tablet,
  CheckCircle2,
  VideoOff,
} from "lucide-react";

interface LiveKitBroadcasterProps {
  session: { access_token: string } | null;
}

type BroadcastStatus = "offline" | "connecting" | "live" | "reconnecting" | "error";

export default function LiveKitBroadcaster({ session }: LiveKitBroadcasterProps) {
  // Device Selection States
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Status & Telemetry States
  const [status, setStatus] = useState<BroadcastStatus>("offline");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDeviceBusy, setIsDeviceBusy] = useState<boolean>(false);
  const [streamResolution, setStreamResolution] = useState<string>("—");
  const [streamFps, setStreamFps] = useState<string>("—");
  const [connectionQuality, setConnectionQuality] = useState<string>("Unknown");
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);
  const [hasPreviewTrack, setHasPreviewTrack] = useState<boolean>(false);

  // DOM & LiveKit Refs
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);
  const uptimeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAcquiringRef = useRef<boolean>(false);
  const activeVideoDeviceIdRef = useRef<string>("");

  // Helper delay to allow Windows DirectShow / DroidCam drivers to release kernel pins
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. Enumerate Media Devices (Detecting DroidCam tablet camera)
  const loadDevices = useCallback(async () => {
    try {
      let devices = await navigator.mediaDevices.enumerateDevices();
      const hasLabels = devices.some((d) => d.label.length > 0);

      // Only request temporary permission if labels are masked
      if (!hasLabels) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
          tempStream.getTracks().forEach((t) => t.stop());
          // Wait 350ms so Windows DirectShow filter releases the virtual camera pin
          await sleep(350);
          devices = await navigator.mediaDevices.enumerateDevices();
        } catch {
          // Permissions declined or partial
        }
      }

      const vInputs = devices.filter((d) => d.kind === "videoinput");
      const aInputs = devices.filter((d) => d.kind === "audioinput");

      setVideoDevices(vInputs);
      setAudioDevices(aInputs);

      // Auto-select DroidCam if present, otherwise default to first available
      if (vInputs.length > 0) {
        const droidCam = vInputs.find((d) => d.label.toLowerCase().includes("droidcam"));
        setSelectedVideoId((prev) =>
          prev && vInputs.some((d) => d.deviceId === prev)
            ? prev
            : droidCam
            ? droidCam.deviceId
            : vInputs[0].deviceId
        );
      }

      if (aInputs.length > 0) {
        setSelectedAudioId((prev) =>
          prev && aInputs.some((d) => d.deviceId === prev) ? prev : aInputs[0].deviceId
        );
      }
    } catch (err) {
      console.error("Device enumeration failed:", err);
      setErrorMessage("Could not enumerate camera devices.");
    }
  }, []);

  useEffect(() => {
    loadDevices();
    navigator.mediaDevices?.addEventListener("devicechange", loadDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", loadDevices);
    };
  }, [loadDevices]);

  // 2. Start Single Unified Camera Track (Used for Preview AND Broadcast — Zero Device Collisions)
  const acquireCameraTrack = useCallback(async (deviceId: string) => {
    if (!deviceId) return;
    if (isAcquiringRef.current) return;

    // If track is already running on the same device and is alive, simply ensure it is attached
    if (
      localVideoTrackRef.current &&
      activeVideoDeviceIdRef.current === deviceId &&
      localVideoTrackRef.current.mediaStreamTrack.readyState === "live"
    ) {
      if (previewVideoRef.current) {
        localVideoTrackRef.current.attach(previewVideoRef.current);
      }
      setHasPreviewTrack(true);
      return;
    }

    isAcquiringRef.current = true;
    setErrorMessage("");
    setIsDeviceBusy(false);

    // If switching from a different camera, cleanly release it first with a cooldown delay
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.detach();
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current = null;
      activeVideoDeviceIdRef.current = "";
      setHasPreviewTrack(false);
      await sleep(350); // Grace period for Windows DirectShow driver to unlock
    }

    try {
      let track: LocalVideoTrack;

      try {
        track = await createLocalVideoTrack({
          deviceId: deviceId ? { ideal: deviceId } : undefined,
          resolution: VideoPresets.h720,
        });
      } catch (firstErr: any) {
        // Fallback without resolution constraint (many DroidCam setups run native 480p)
        if (firstErr?.name === "NotReadableError" || firstErr?.name === "OverconstrainedError") {
          await sleep(300);
          track = await createLocalVideoTrack({
            deviceId: deviceId ? { ideal: deviceId } : undefined,
          });
        } else {
          throw firstErr;
        }
      }

      localVideoTrackRef.current = track;
      activeVideoDeviceIdRef.current = deviceId;

      if (previewVideoRef.current) {
        track.attach(previewVideoRef.current);
      }
      setHasPreviewTrack(true);

      const settings = track.mediaStreamTrack.getSettings();
      setStreamResolution(
        settings.width && settings.height ? `${settings.width}x${settings.height}` : "1280x720"
      );
      setStreamFps(settings.frameRate ? `${Math.round(settings.frameRate)} FPS` : "30 FPS");
    } catch (err: any) {
      console.error("Camera acquisition failed:", err);
      setHasPreviewTrack(false);

      if (err?.name === "NotReadableError" || String(err?.message).includes("Device in use")) {
        setIsDeviceBusy(true);
        setErrorMessage(
          "Camera is currently busy or in use by another application. If using DroidCam, ensure DroidCam Client on Windows is connected to your tablet and clicked 'Start'. Also check if another browser tab or app (Zoom/OBS) is accessing the camera."
        );
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Failed to access camera.");
      }
    } finally {
      isAcquiringRef.current = false;
    }
  }, []);

  // Update preview when selected camera changes and offline
  useEffect(() => {
    if (status === "offline" && selectedVideoId) {
      acquireCameraTrack(selectedVideoId);
    }
  }, [selectedVideoId, status, acquireCameraTrack]);

  // 3. Start Live Stream Broadcast to LiveKit Cloud (Reuses Existing Acquired Track!)
  const startBroadcast = async () => {
    if (!session?.access_token) {
      setErrorMessage("You must be logged in as an official administrator to broadcast.");
      return;
    }

    if (!selectedVideoId) {
      setErrorMessage("Please select a camera input first.");
      return;
    }

    setStatus("connecting");
    setErrorMessage("");

    try {
      // A. Fetch broadcaster token with Supabase auth
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: "broadcaster",
          room: "track-vision-live",
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned non-JSON response (${res.status}). Server may be compiling. Please retry.`);
      }

      if (!res.ok || !data) {
        throw new Error(data?.error || `Failed to obtain broadcaster token from server (${res.status}).`);
      }

      // B. Ensure local video track is alive (reuse existing preview track — NO RE-ACQUIRE!)
      let videoTrack = localVideoTrackRef.current;
      if (!videoTrack || videoTrack.mediaStreamTrack.readyState !== "live") {
        await acquireCameraTrack(selectedVideoId);
        videoTrack = localVideoTrackRef.current;
      }

      if (!videoTrack) {
        throw new Error("Camera track is not active. Please click 'Retry Camera' first.");
      }

      // C. Optional Microphone Audio Track
      let audioTrack: LocalAudioTrack | null = null;
      if (audioEnabled) {
        try {
          audioTrack = await createLocalAudioTrack({
            deviceId: selectedAudioId ? { exact: selectedAudioId } : undefined,
          });
          localAudioTrackRef.current = audioTrack;
        } catch (audioErr) {
          console.warn("Audio track creation failed, continuing video only:", audioErr);
        }
      }

      // D. Initialize LiveKit Room & Bind Lifecycle Events
      const room = new Room({
        adaptiveStream: false,
        dynacast: false,
      });
      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        setStatus("live");
        setUptimeSeconds(0);
        if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
        uptimeTimerRef.current = setInterval(() => {
          setUptimeSeconds((prev) => prev + 1);
        }, 1000);
      });

      room.on(RoomEvent.Reconnecting, () => {
        setStatus("reconnecting");
      });

      room.on(RoomEvent.Reconnected, () => {
        setStatus("live");
      });

      room.on(RoomEvent.Disconnected, () => {
        stopBroadcastInternal();
      });

      room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        if (participant === room.localParticipant) {
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
        }
      });

      // E. Connect to LiveKit Room & Publish Tracks Directly (Zero Device Re-opening!)
      await room.connect(data.url, data.token);
      await room.localParticipant.publishTrack(videoTrack, {
        name: "track-camera",
        source: Track.Source.Camera,
        simulcast: false,
      });

      if (audioTrack) {
        await room.localParticipant.publishTrack(audioTrack, {
          name: "track-microphone",
          source: Track.Source.Microphone,
        });
      }

      // Attach video to preview element
      if (previewVideoRef.current) {
        videoTrack.attach(previewVideoRef.current);
      }

      const settings = videoTrack.mediaStreamTrack.getSettings();
      setStreamResolution(
        settings.width && settings.height ? `${settings.width}x${settings.height}` : "1280x720"
      );
      setStreamFps(settings.frameRate ? `${Math.round(settings.frameRate)} FPS` : "30 FPS");
    } catch (err: any) {
      console.error("Broadcast failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Broadcast failed to connect.");
      setStatus("error");
      stopBroadcastInternal();
    }
  };

  // 4. Internal Stop: Unpublish tracks from room without destroying the camera preview
  const stopBroadcastInternal = useCallback(async () => {
    if (uptimeTimerRef.current) {
      clearInterval(uptimeTimerRef.current);
      uptimeTimerRef.current = null;
    }

    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current = null;
    }

    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    setStatus("offline");
    setUptimeSeconds(0);
    setConnectionQuality("Offline");

    // Ensure camera track is still attached to the preview
    if (localVideoTrackRef.current && previewVideoRef.current) {
      localVideoTrackRef.current.attach(previewVideoRef.current);
      setHasPreviewTrack(true);
    }
  }, []);

  const stopBroadcast = () => {
    stopBroadcastInternal();
  };

  // 5. Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.detach();
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current = null;
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current = null;
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (uptimeTimerRef.current) {
        clearInterval(uptimeTimerRef.current);
      }
    };
  }, []);

  // Format uptime HH:MM:SS
  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isLive = status === "live";
  const isConnecting = status === "connecting";
  const isReconnecting = status === "reconnecting";

  // Check if active device is DroidCam
  const selectedVideoDevice = videoDevices.find((d) => d.deviceId === selectedVideoId);
  const isDroidCam = selectedVideoDevice?.label.toLowerCase().includes("droidcam");

  return (
    <div className="panel hud-panel" style={{ padding: 24, marginBottom: 20 }}>
      {/* Panel Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 16,
          borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
          marginBottom: 20,
        }}
      >
        <div>
          <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#ffaa00" }}>
            OPTICAL VIDEO TRANSMITTER // WEBRTC
          </div>
          <h2
            style={{
              margin: "4px 0 0",
              fontSize: 20,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#fff",
            }}
          >
            <Radio size={20} color="#00f0ff" /> Live Track Broadcaster
          </h2>
        </div>

        {/* Live Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 30,
              background: isLive
                ? "rgba(0, 255, 136, 0.15)"
                : isConnecting || isReconnecting
                ? "rgba(255, 170, 0, 0.15)"
                : "rgba(10, 18, 30, 0.8)",
              border: `1px solid ${
                isLive
                  ? "#00ff88"
                  : isConnecting || isReconnecting
                  ? "#ffaa00"
                  : "rgba(45, 75, 110, 0.4)"
              }`,
            }}
          >
            <span
              className={`live-beacon ${isLive ? "live-dot-green" : ""}`}
              style={{
                background: isLive
                  ? "#00ff88"
                  : isConnecting || isReconnecting
                  ? "#ffaa00"
                  : "#6c84a0",
              }}
            />
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isLive ? "#00ff88" : isConnecting || isReconnecting ? "#ffaa00" : "#8da3be",
                letterSpacing: "0.08em",
              }}
            >
              {isLive ? `LIVE // ${formatUptime(uptimeSeconds)}` : status.toUpperCase()}
            </span>
          </div>

          <button
            onClick={() => {
              loadDevices();
              if (selectedVideoId) acquireCameraTrack(selectedVideoId);
            }}
            className="btn"
            title="Refresh Camera Devices"
            style={{ padding: "8px 12px", fontSize: 11 }}
          >
            <RefreshCw size={14} color="#00f0ff" />
          </button>
        </div>
      </div>

      {/* Error / Device Busy Notification */}
      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: isDeviceBusy ? "rgba(255, 170, 0, 0.12)" : "rgba(255, 73, 107, 0.12)",
            border: `1px solid ${isDeviceBusy ? "rgba(255, 170, 0, 0.4)" : "rgba(255, 73, 107, 0.4)"}`,
            color: isDeviceBusy ? "#ffbb33" : "#ff6b8b",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            marginBottom: 16,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {isDeviceBusy ? "CAMERA BUSY / NOT READABLE (DEVICE IN USE)" : "BROADCAST ERROR"}
            </div>
            <div>{errorMessage}</div>
            {isDeviceBusy && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => acquireCameraTrack(selectedVideoId)}
                  className="btn"
                  style={{
                    fontSize: 11,
                    padding: "6px 12px",
                    background: "rgba(255, 170, 0, 0.2)",
                    border: "1px solid #ffaa00",
                    color: "#ffaa00",
                  }}
                >
                  <RefreshCw size={12} /> Retry Camera Connection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Broadcaster Grid: Preview (Left) & Controls (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr)",
          gap: 20,
        }}
      >
        {/* Left: Camera Preview Viewport */}
        <div
          style={{
            position: "relative",
            aspectRatio: "16/9",
            borderRadius: 12,
            overflow: "hidden",
            background: "#020408",
            border: `1px solid ${isLive ? "rgba(0, 255, 136, 0.4)" : "rgba(45, 75, 110, 0.4)"}`,
            boxShadow: isLive ? "0 0 25px rgba(0, 255, 136, 0.15)" : "none",
          }}
        >
          <video
            ref={previewVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: hasPreviewTrack ? "block" : "none",
            }}
          />

          {/* Standby / Device Busy Placeholder */}
          {!hasPreviewTrack && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                padding: 20,
                background: "radial-gradient(circle at center, #0a1422 0%, #03060a 100%)",
              }}
            >
              <div>
                <VideoOff size={36} color="#6c84a0" style={{ margin: "0 auto 12px" }} />
                <div className="digital" style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  {isDeviceBusy ? "CAMERA IN USE / BUSY" : "CAMERA PREVIEW OFFLINE"}
                </div>
                <p className="muted mono" style={{ fontSize: 11, maxWidth: 320, margin: "6px auto 14px" }}>
                  {isDeviceBusy
                    ? "DirectShow lock detected. Close any other window/app using DroidCam and click retry."
                    : "Select a camera input below to activate live optical preview."}
                </p>
                <button
                  onClick={() => acquireCameraTrack(selectedVideoId)}
                  className="btn"
                  style={{ fontSize: 11, padding: "6px 14px" }}
                >
                  <RefreshCw size={12} /> Connect Camera
                </button>
              </div>
            </div>
          )}

          {/* Viewport HUD Overlays */}
          {hasPreviewTrack && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 2,
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(3, 6, 12, 0.8)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  color: "#00f0ff",
                  fontWeight: 700,
                }}
              >
                {isLive ? "BROADCAST ACTIVE" : "LOCAL PREVIEW"}
              </span>

              {isDroidCam && (
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(255, 106, 0, 0.85)",
                    color: "#fff",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Tablet size={12} /> DROIDCAM UPLINK
                </span>
              )}
            </div>
          )}

          {/* Bottom Viewport Telemetry Bar */}
          {hasPreviewTrack && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "8px 14px",
                background: "linear-gradient(to top, rgba(2, 4, 8, 0.9) 0%, transparent 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "#8da3be",
                zIndex: 2,
              }}
            >
              <div>
                RES: <span style={{ color: "#fff" }}>{streamResolution}</span> · FPS:{" "}
                <span style={{ color: "#00ff88" }}>{streamFps}</span>
              </div>
              {isLive && (
                <div>
                  QUALITY: <span style={{ color: "#00f0ff" }}>{connectionQuality}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Broadcast Settings & Controls */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "grid", gap: 14 }}>
            {/* Video Input Device Selection */}
            <div>
              <label
                className="mono muted"
                style={{
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                  color: "#00f0ff",
                }}
              >
                <Camera size={13} /> SELECT CAMERA INPUT
              </label>
              <select
                className="field"
                value={selectedVideoId}
                disabled={isLive || isConnecting}
                onChange={(e) => setSelectedVideoId(e.target.value)}
                style={{ cursor: isLive ? "not-allowed" : "pointer" }}
              >
                {videoDevices.map((d, idx) => {
                  const isDc = d.label.toLowerCase().includes("droidcam");
                  return (
                    <option key={d.deviceId || idx} value={d.deviceId}>
                      {isDc ? "⭐ [DROIDCAM TABLET] " : ""}
                      {d.label || `Camera ${idx + 1}`}
                    </option>
                  );
                })}
              </select>
              {isDroidCam && (
                <div className="mono" style={{ fontSize: 10, color: "#ffaa00", marginTop: 4 }}>
                  ✓ DroidCam tablet camera detected and selected
                </div>
              )}
            </div>

            {/* Audio Input Device Selection */}
            <div>
              <label
                className="mono muted"
                style={{
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                  color: "#8da3be",
                }}
              >
                <Mic size={13} /> MICROPHONE INPUT
              </label>
              <select
                className="field"
                value={selectedAudioId}
                disabled={isLive || isConnecting || !audioEnabled}
                onChange={(e) => setSelectedAudioId(e.target.value)}
                style={{ cursor: !audioEnabled || isLive ? "not-allowed" : "pointer" }}
              >
                {audioDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Microphone Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: isLive ? "not-allowed" : "pointer",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "#e2ecf8",
              }}
            >
              <input
                type="checkbox"
                checked={audioEnabled}
                disabled={isLive}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                style={{ accentColor: "#ff6a00", cursor: "pointer", width: 16, height: 16 }}
              />
              <span>Enable Microphone Audio Track</span>
            </label>

            {/* Target Room Information */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(10, 18, 30, 0.6)",
                border: "1px solid rgba(45, 75, 110, 0.3)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "#8da3be",
                display: "grid",
                gap: 4,
              }}
            >
              <div>
                ROOM: <span style={{ color: "#ffaa00", fontWeight: 700 }}>track-vision-live</span>
              </div>
              <div>
                UPLINK: <span style={{ color: "#00ff88" }}>LiveKit Cloud WebRTC</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div>
            {!isLive ? (
              <button
                className="btn btn-primary"
                disabled={isConnecting || videoDevices.length === 0}
                onClick={startBroadcast}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: 13,
                  fontWeight: 800,
                  gap: 10,
                  boxShadow: "0 0 25px rgba(255, 106, 0, 0.35)",
                }}
              >
                <Play size={16} />
                <span>{isConnecting ? "ESTABLISHING WEBRTC UPLINK..." : "START LIVE BROADCAST"}</span>
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={stopBroadcast}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: 13,
                  fontWeight: 800,
                  gap: 10,
                  boxShadow: "0 0 25px rgba(255, 73, 107, 0.35)",
                }}
              >
                <Square size={16} />
                <span>STOP LIVE BROADCAST</span>
              </button>
            )}
            <p className="muted mono" style={{ fontSize: 10, marginTop: 8, textAlign: "center" }}>
              Publishing will stream camera feed directly to public spectators in the Live Arena.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
