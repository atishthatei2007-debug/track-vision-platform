"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Calendar,
  Clock,
  Download,
  Film,
  HardDrive,
  Play,
  RotateCcw,
  Share2,
  Video,
} from "lucide-react";

interface SavedRecording {
  name: string;
  created_at: string;
  size?: number;
  publicUrl: string;
}

interface GccReplayCenterProps {
  videoId?: string;
}

export default function GccReplayCenter({ videoId }: GccReplayCenterProps) {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SavedRecording | null>(null);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, selectedVideo]);

  // Fetch all saved race streams from Supabase Storage via /api/recordings
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/recordings");
      const data = await res.json();
      if (data.recordings) {
        setRecordings(data.recordings);
        if (data.recordings.length > 0 && !selectedVideo) {
          setSelectedVideo(data.recordings[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load recordings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ── Replay Center Header ── */}
      <div
        className="gcc-card"
        style={{
          padding: "18px 22px",
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
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "rgba(0, 240, 255, 0.12)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <RotateCcw size={18} color="#00f0ff" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>
              TEAM RACE REPLAY &amp; STREAM ARCHIVE
            </h2>
            <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
              AUTOMATICALLY CAPTURED RACE FOOTAGE · SUPABASE STORAGE REPLAY
            </div>
          </div>
        </div>

        {/* Speed & Refresh Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={fetchRecordings}
            className="btn"
            style={{ fontSize: 11, padding: "5px 12px" }}
          >
            <Film size={13} /> Refresh Recordings
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="mono muted" style={{ fontSize: 10 }}>
              SPEED:
            </span>
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`gcc-tab-btn ${speed === s ? "active" : ""}`}
                style={{ fontSize: 11, padding: "5px 10px" }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Two-Column View: Video Player on Left, Video List on Right ── */}
      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 1fr)",
          gap: 20,
        }}
      >
        {/* Left: Active Selected Video Player */}
        <div className="gcc-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: "12px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(6, 12, 20, 0.7)",
              borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
              fontSize: 12,
            }}
          >
            <span className="mono" style={{ color: "#00f0ff", fontWeight: 700 }}>
              {selectedVideo ? selectedVideo.name : "NO REPLAY SELECTED"}
            </span>
            {selectedVideo && (
              <span className="pill pill-green" style={{ fontSize: 10 }}>
                ARCHIVED FOOTAGE
              </span>
            )}
          </div>

          {/* Video Player */}
          <div
            style={{
              aspectRatio: "16/9",
              background: "#03060a",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedVideo ? (
              <video
                key={selectedVideo.publicUrl}
                ref={videoRef}
                src={selectedVideo.publicUrl}
                controls
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 36 }}>
                <Film size={42} color="#456585" style={{ margin: "0 auto 12px" }} />
                <div className="digital" style={{ fontSize: 18, color: "#fff" }}>
                  NO RACE FOOTAGE FOUND
                </div>
                <div className="mono muted" style={{ fontSize: 11, maxWidth: 360, margin: "6px auto 0" }}>
                  Start a race in the Admin Room with camera enabled to automatically record and archive this team&apos;s heat.
                </div>
              </div>
            )}
          </div>

          {/* Action Bar for Selected Video */}
          {selectedVideo && (
            <div
              style={{
                padding: "14px 20px",
                background: "rgba(8, 16, 28, 0.9)",
                borderTop: "1px solid rgba(45, 75, 110, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div className="mono muted" style={{ fontSize: 10 }}>
                  CAPTURED: {new Date(selectedVideo.created_at).toLocaleString()}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "#8da3be", marginTop: 2 }}>
                  FILE SIZE: {formatSize(selectedVideo.size)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <a
                  href={selectedVideo.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hud-chamfer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "linear-gradient(135deg, #00f0ff 0%, #00a8ff 100%)",
                    color: "#04080e",
                    textDecoration: "none",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <Share2 size={13} /> SHARE REPLAY LINK
                </a>
                <a
                  href={selectedVideo.publicUrl}
                  download={selectedVideo.name}
                  className="btn"
                  style={{ fontSize: 11, padding: "6px 12px" }}
                >
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Saved Race Recordings Catalog */}
        <div className="gcc-card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <HardDrive size={16} color="#00ff88" /> Captured Runs ({recordings.length})
            </h3>
            <span className="mono muted" style={{ fontSize: 10 }}>
              SUPABASE CLOUD
            </span>
          </div>

          {loading ? (
            <div className="mono muted" style={{ textAlign: "center", padding: 30, fontSize: 12 }}>
              Scanning recordings archive...
            </div>
          ) : recordings.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30 }} className="mono muted">
              <Video size={30} color="#354e6b" style={{ margin: "0 auto 8px" }} />
              No team streams saved yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8, overflowY: "auto", maxHeight: 420, paddingRight: 4 }}>
              {recordings.map((rec) => {
                const isSelected = selectedVideo?.name === rec.name;
                return (
                  <div
                    key={rec.name}
                    onClick={() => setSelectedVideo(rec)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: isSelected ? "rgba(0, 240, 255, 0.12)" : "rgba(8, 16, 28, 0.7)",
                      border: `1px solid ${isSelected ? "rgba(0, 240, 255, 0.5)" : "rgba(45, 75, 110, 0.3)"}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Play size={15} color={isSelected ? "#00f0ff" : "#8da3be"} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                          {rec.name.replace(".webm", "")}
                        </div>
                        <div className="mono muted" style={{ fontSize: 10, marginTop: 2 }}>
                          {new Date(rec.created_at).toLocaleTimeString()} · {formatSize(rec.size)}
                        </div>
                      </div>
                    </div>

                    <span className="mono" style={{ fontSize: 10, color: isSelected ? "#00f0ff" : "#5d738c" }}>
                      {isSelected ? "PLAYING" : "SELECT"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
