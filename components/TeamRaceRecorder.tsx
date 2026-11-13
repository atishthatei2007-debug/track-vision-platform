"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  CheckCircle2,
  Download,
  Film,
  Play,
  Share2,
  Square,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

interface TeamRaceRecorderProps {
  activeRun: {
    id: string;
    team_id: string;
    started_at: string;
    teams?: { code: string; name: string; college: string };
  } | null;
  onRecordingSaved?: (url: string) => void;
}

export default function TeamRaceRecorder({ activeRun, onRecordingSaved }: TeamRaceRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of previous activeRun status to automatically trigger recording
  const prevRunIdRef = useRef<string | null>(null);

  // 1. Initialize camera stream for local recording
  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (e) {
      console.error("Camera access error:", e);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  // 2. Start Recording
  const startRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];
    setRecordedBlob(null);
    setPreviewUrl(null);
    setUploadedUrl(null);

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      recorder.start(500); // 500ms chunk slices
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (e) {
      console.error("Failed to start MediaRecorder:", e);
    }
  }, [stream]);

  // 3. Stop Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  // 4. Auto-detect when organizer clicks START RACE or when RUN FINISHES
  useEffect(() => {
    const currentRunId = activeRun?.id ?? null;
    const prevRunId = prevRunIdRef.current;

    // Run just started!
    if (currentRunId && !prevRunId && stream && !isRecording) {
      startRecording();
    }
    // Run just finished / aborted!
    else if (!currentRunId && prevRunId && isRecording) {
      stopRecording();
    }

    prevRunIdRef.current = currentRunId;
  }, [activeRun, stream, isRecording, startRecording, stopRecording]);

  // 5. Upload to Supabase Storage & Team Portal
  const uploadVideo = async () => {
    if (!recordedBlob) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", recordedBlob, "race.webm");
      formData.append("run_id", prevRunIdRef.current || `run_${Date.now()}`);
      formData.append("team_code", activeRun?.teams?.code || "TV-BOT");

      const res = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadedUrl(data.publicUrl);
      if (onRecordingSaved) onRecordingSaved(data.publicUrl);
    } catch (e) {
      console.error("Upload failed:", e);
      alert("Failed to upload recording: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="panel hud-panel"
      style={{
        padding: 20,
        background: "radial-gradient(ellipse at top left, rgba(0, 240, 255, 0.08) 0%, rgba(8, 16, 28, 0.9) 70%)",
        border: "1px solid rgba(0, 240, 255, 0.4)",
        marginTop: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Film size={18} color="#00f0ff" />
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            AUTOMATIC RACE STREAM RECORDER
          </span>
        </div>
        <span className={`pill ${isRecording ? "pill-orange" : "pill-green"}`}>
          {isRecording ? `RECORDING: ${seconds}s` : stream ? "CAMERA ARMED" : "OFFLINE"}
        </span>
      </div>

      {/* Camera Live Preview / Video Element */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          borderRadius: 10,
          overflow: "hidden",
          background: "#03070e",
          border: "1px solid rgba(45, 75, 110, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {previewUrl ? (
          <video src={previewUrl} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}

        {!stream && !previewUrl && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Camera size={36} color="#456585" style={{ margin: "0 auto 10px" }} />
            <div className="mono muted" style={{ fontSize: 12 }}>
              Enable Arena Camera to record this team&apos;s heat
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="hud-chamfer"
              style={{
                marginTop: 12,
                padding: "8px 16px",
                background: "linear-gradient(135deg, #00f0ff 0%, #00a8ff 100%)",
                border: "none",
                color: "#04080e",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ENABLE CAMERA FEED
            </button>
          </div>
        )}

        {/* Recording Indicator Overlay */}
        {isRecording && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 0, 85, 0.85)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#fff",
                animation: "pulse 1s infinite",
              }}
            />
            REC // {activeRun?.teams?.code || "TEAM"} [{seconds}s]
          </div>
        )}
      </div>

      {/* Manual / Auto Control Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {stream && !isRecording && !previewUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="btn btn-primary"
              style={{ fontSize: 12, padding: "8px 14px" }}
            >
              <Play size={14} /> MANUAL RECORD
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="btn btn-danger"
              style={{ fontSize: 12, padding: "8px 14px" }}
            >
              <Square size={14} /> STOP RECORDING
            </button>
          )}

          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setRecordedBlob(null);
                setUploadedUrl(null);
                if (videoRef.current && stream) {
                  videoRef.current.srcObject = stream;
                }
              }}
              className="btn"
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              <X size={13} /> Clear Replay
            </button>
          )}
        </div>

        {/* Upload Button */}
        {recordedBlob && !uploadedUrl && (
          <button
            type="button"
            onClick={uploadVideo}
            disabled={uploading}
            className="hud-chamfer"
            style={{
              padding: "8px 18px",
              background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
              border: "none",
              color: "#04080e",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              cursor: uploading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <UploadCloud size={15} />
            {uploading ? "SAVING TO TEAM ARCHIVE..." : "SAVE STREAM TO TEAM PORTAL"}
          </button>
        )}

        {uploadedUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ color: "#00ff88", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={13} /> SAVED TO PORTAL!
            </span>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-green"
              style={{ textDecoration: "none", fontSize: 11 }}
            >
              <Share2 size={12} /> OPEN VIDEO LINK
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
