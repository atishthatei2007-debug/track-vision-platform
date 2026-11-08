"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Antenna,
  ChevronDown,
  Cpu,
  Radio,
  Shield,
  Trophy,
  Wifi,
  Zap,
} from "lucide-react";

// Frame Sequence Configuration
// If you extract frames into public/trackvision-frames/frame-001.jpg ... frame-120.jpg,
// adjust FRAME_COUNT and FOLDER accordingly.
const FRAME_COUNT = 120;
const FOLDER = "trackvision-frames";
const MIDDLE = Math.round((FRAME_COUNT - 1) / 2);

interface TrackVisionHeroProps {
  onEnterArena?: () => void;
}

export default function TrackVisionHero({ onEnterArena }: TrackVisionHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef = useRef(MIDDLE);
  const [currentFrame, setCurrentFrame] = useState(MIDDLE);
  const [hasFrames, setHasFrames] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // 1. Canvas & Frame Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Dynamic cover resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderCurrent();
    };
    resize();
    window.addEventListener("resize", resize);

    function renderCurrent() {
      const idx = frameRef.current;
      const img = images.current[idx];

      if (img && img.complete && img.naturalWidth > 0) {
        const { naturalWidth: iw, naturalHeight: ih } = img;
        const cw = canvas!.width;
        const ch = canvas!.height;
        const s = Math.max(cw / iw, ch / ih);
        ctx!.clearRect(0, 0, cw, ch);
        ctx!.drawImage(img, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
      }
    }

    // Attempt to preload frames if available
    images.current = new Array(FRAME_COUNT).fill(null);
    let successfulLoads = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/${FOLDER}/frame-${String(i + 1).padStart(3, "0")}.jpg`;
      img.onload = () => {
        images.current[i] = img;
        successfulLoads++;
        setLoadedCount(successfulLoads);

        if (successfulLoads > 5 && !hasFrames) {
          setHasFrames(true);
        }
        if (i === frameRef.current) {
          renderCurrent();
        }
      };
      img.onerror = () => {
        // Frames directory not yet populated; video background fallback remains active
      };
    }

    // 2. High-precision mouse movement frame scrubber
    const onMove = (e: MouseEvent) => {
      if (!section) return;
      const r = section.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;

      const ratioX = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const ratioY = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      setMousePos({ x: ratioX, y: ratioY });

      // Frame selection across horizontal axis
      const idx = Math.round(ratioX * (FRAME_COUNT - 1));
      if (idx !== frameRef.current) {
        frameRef.current = idx;
        setCurrentFrame(idx);
        renderCurrent();
      }

      // If video fallback is active, scrub video timestamp smoothly
      if (videoRef.current && videoRef.current.duration) {
        const targetTime = ratioX * videoRef.current.duration;
        videoRef.current.currentTime = targetTime;
      }
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [hasFrames]);

  const handleScrollToArena = () => {
    if (onEnterArena) {
      onEnterArena();
    } else {
      const arenaEl = document.getElementById("spectator-arena");
      if (arenaEl) {
        arenaEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#03060a",
      }}
    >
      {/* Fallback Cinematic Video — Full Screen Edge-to-Edge */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        src="/track-vision-intro.mp4"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.85) contrast(1.1)",
          display: hasFrames ? "none" : "block",
        }}
      />

      {/* Full-viewport canvas for frame-scrubbing */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: hasFrames ? "block" : "none",
        }}
      />

      {/* Cyberpunk Vignette & Lighting Gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: [
            "linear-gradient(to right, rgba(3,6,10,0.92) 0%, rgba(3,6,10,0.65) 28%, rgba(3,6,10,0.2) 60%, rgba(3,6,10,0.85) 100%)",
            "linear-gradient(180deg, rgba(3,6,10,0.75) 0%, transparent 20%, transparent 70%, rgba(3,6,10,0.98) 100%)",
          ].join(", "),
        }}
      />

      {/* Scanline Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)",
          backgroundSize: "100% 4px",
          opacity: 0.5,
        }}
      />

      {/* ── TOP NAV BAR ── */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(1rem, 2.5vh, 1.8rem) clamp(1.2rem, 4vw, 3rem)",
          zIndex: 10,
        }}
      >
        {/* Logo Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "radial-gradient(circle, #10243b 0%, #060e18 100%)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 20px rgba(0, 240, 255, 0.3)",
            }}
          >
            <img
              src="/track-vision-logo.png"
              alt="Track Vision Logo"
              width={32}
              height={32}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <span
              className="digital"
              style={{
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.22em",
                color: "#fff",
              }}
            >
              TRACK <span style={{ color: "#ff6a00" }}>VISION</span>
            </span>
            <div
              className="mono"
              style={{
                fontSize: 9,
                color: "#ffaa00",
                letterSpacing: "0.2em",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              NIRMAN 6.0 ROBOTICS
            </div>
          </div>
        </div>

        {/* Central HUD Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(10, 20, 32, 0.65)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(0, 240, 255, 0.25)",
            borderRadius: 40,
            padding: "6px 16px",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span className="live-beacon live-dot-green" />
            <span className="mono" style={{ color: "#00ff88", fontWeight: 600 }}>
              GATES ARMED [4/4]
            </span>
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
          <div className="mono" style={{ fontSize: 11, color: "#8da3be" }}>
            FREQ: <span style={{ color: "#00f0ff" }}>1000 Hz</span>
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
          <div className="mono" style={{ fontSize: 11, color: "#8da3be" }}>
            SCRUB: <span style={{ color: "#ffaa00" }}>{Math.round(mousePos.x * 100)}%</span>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={handleScrollToArena}
            className="btn"
            style={{ fontSize: 12, padding: "8px 16px" }}
          >
            <Radio size={14} color="#00f0ff" />
            <span>Live Arena</span>
          </button>
          <Link href="/admin" className="btn btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
            <Shield size={14} />
            <span>Control Room</span>
          </Link>
        </div>
      </nav>

      {/* ── MAIN CONTENT (Left Telemetry Display) ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: "clamp(1.5rem, 6vw, 5rem)",
          maxWidth: "clamp(320px, 42vw, 580px)",
          zIndex: 5,
        }}
      >
        {/* Category Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            borderRadius: 6,
            background: "rgba(255, 170, 0, 0.12)",
            border: "1px solid rgba(255, 170, 0, 0.35)",
            color: "#ffaa00",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            marginBottom: 16,
          }}
        >
          <Zap size={13} color="#ffaa00" />
          <span>ROBOTICS TIMING & TELEMETRY PROTOCOL</span>
        </div>

        {/* Main Title */}
        <h1
          className="digital"
          style={{
            fontSize: "clamp(2.8rem, 6.5vw, 5.8rem)",
            fontWeight: 900,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#ffffff",
            lineHeight: 0.95,
            margin: "0 0 18px",
            textShadow: "0 0 40px rgba(0, 240, 255, 0.4), 0 4px 30px rgba(0, 0, 0, 0.95)",
          }}
        >
          TRACK
          <br />
          <span style={{ color: "#ff6a00", textShadow: "0 0 45px rgba(255, 106, 0, 0.7)" }}>
            VISION
          </span>
        </h1>

        {/* Subtitle Description */}
        <p
          style={{
            fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
            fontWeight: 400,
            lineHeight: 1.6,
            color: "rgba(220, 235, 255, 0.75)",
            marginBottom: 28,
            maxWidth: 480,
          }}
        >
          Engineered for <strong>NIRMAN 6.0</strong>: 4-gate ESP32 optical laser tracking,
          server-recorded split timestamps, sub-millisecond precision, and live broadcast synchronization.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleScrollToArena}
            className="btn btn-primary"
            style={{ padding: "12px 24px", fontSize: 13 }}
          >
            <Radio size={16} /> Enter Live Arena
          </button>

          <Link
            href="/admin"
            className="btn"
            style={{ padding: "12px 22px", fontSize: 13 }}
          >
            <Shield size={16} color="#00f0ff" /> Launch Console
          </Link>
        </div>

        {/* Diagnostics Ticker */}
        <div
          style={{
            marginTop: 32,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(10, 18, 30, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(45, 75, 110, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#8da3be",
          }}
        >
          <div>
            HARDWARE: <span style={{ color: "#00f0ff" }}>ESP32 DevKit V1</span>
          </div>
          <span style={{ opacity: 0.3 }}>//</span>
          <div>
            CHANNELS: <span style={{ color: "#00ff88" }}>4x ADC1 LDR Gates</span>
          </div>
          <span style={{ opacity: 0.3 }}>//</span>
          <div>
            SYNC: <span style={{ color: "#ffaa00" }}>Supabase Realtime</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TELEMETRY BAR ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "clamp(56px, 8vh, 72px)",
          background: "rgba(4, 8, 14, 0.8)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(45, 75, 110, 0.35)",
          padding: "0 clamp(1.2rem, 4vw, 3rem)",
          zIndex: 6,
        }}
      >
        {/* Play Live Broadcast CTA */}
        <div
          onClick={handleScrollToArena}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            paddingRight: 24,
            borderRight: "1px solid rgba(45, 75, 110, 0.3)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0, 240, 255, 0.15)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 12px rgba(0, 240, 255, 0.3)",
            }}
          >
            <ChevronDown size={18} color="#00f0ff" />
          </div>
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Scroll to Arena
          </span>
        </div>

        {/* 4 Hardware Optical Gate Indicators */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[
            { n: "01", name: "CH1 - START", pin: "GPIO 32" },
            { n: "02", name: "CH2 - SPLIT", pin: "GPIO 33" },
            { n: "03", name: "CH3 - HAIRPIN", pin: "GPIO 34" },
            { n: "04", name: "CH4 - FINISH", pin: "GPIO 35" },
          ].map((ch) => (
            <div
              key={ch.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(10, 20, 32, 0.5)",
                border: "1px solid rgba(45, 75, 110, 0.3)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00ff88",
                  boxShadow: "0 0 8px #00ff88",
                }}
              />
              <span className="mono" style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>
                {ch.name}
              </span>
              <span className="mono" style={{ fontSize: 9, color: "#6c84a0" }}>
                ({ch.pin})
              </span>
            </div>
          ))}
        </div>

        {/* Frame / Timeline Scrubber Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: "#8da3be", textAlign: "right" }}>
            <div>FRAME SCRUBBER</div>
            <div style={{ color: "#00f0ff" }}>
              {String(currentFrame + 1).padStart(3, "0")} / {FRAME_COUNT}
            </div>
          </div>
          <div
            style={{
              width: 90,
              height: 4,
              background: "rgba(25, 45, 70, 0.6)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${mousePos.x * 100}%`,
                background: "linear-gradient(90deg, #00f0ff, #ff6a00)",
                boxShadow: "0 0 10px #00f0ff",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
