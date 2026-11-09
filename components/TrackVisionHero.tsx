"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Radio,
  Shield,
  Zap,
} from "lucide-react";

// Frame Sequence Configuration
const FRAME_COUNT = 120;
const FOLDER = "trackvision-frames";

interface TrackVisionHeroProps {
  onEnterArena?: () => void;
}

export default function TrackVisionHero({ onEnterArena }: TrackVisionHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);

  // Telemetry DOM Refs for ZERO React re-render overhead
  const scrubTopRef = useRef<HTMLSpanElement>(null);
  const frameNumberRef = useRef<HTMLDivElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);

  // Smooth Interpolation Refs
  const targetRatioRef = useRef(0.5);
  const smoothRatioRef = useRef(0.5);
  const hasFramesRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const renderFrame = (idx: number) => {
      let img = images.current[idx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        img = images.current[0];
      }
      if (img && img.complete && img.naturalWidth > 0) {
        const { naturalWidth: iw, naturalHeight: ih } = img;
        const cw = canvas.width;
        const ch = canvas.height;
        const s = Math.max(cw / iw, ch / ih);
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
      }
    };

    // Dynamic cover resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const currentIdx = Math.round(smoothRatioRef.current * (FRAME_COUNT - 1));
      renderFrame(currentIdx);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Preload image frames if available
    images.current = new Array(FRAME_COUNT).fill(null);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/${FOLDER}/frame-${String(i + 1).padStart(3, "0")}.jpg`;
      img.onload = () => {
        images.current[i] = img;
        if (i === 0 || !hasFramesRef.current) {
          hasFramesRef.current = true;
          if (videoRef.current) {
            videoRef.current.style.display = "none";
            videoRef.current.pause();
          }
          canvas.style.display = "block";
          renderFrame(i === 0 ? 0 : Math.round(smoothRatioRef.current * (FRAME_COUNT - 1)));
        }
      };
      img.onerror = () => {
        // Fallback video remains active
      };
    }

    // ── High-speed Mousemove (Target assignment only — 0ms overhead) ──
    const onMove = (e: MouseEvent) => {
      if (!section) return;
      const r = section.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;

      const ratioX = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      targetRatioRef.current = ratioX;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    // ── 60-120 FPS Butter-Smooth RAF Interpolation Engine ──
    let rafId: number;
    let lastDrawnFrame = -1;

    const loop = () => {
      // Smooth LERP (spring inertia)
      const diff = targetRatioRef.current - smoothRatioRef.current;
      if (Math.abs(diff) > 0.0004) {
        smoothRatioRef.current += diff * 0.12;
      } else {
        smoothRatioRef.current = targetRatioRef.current;
      }

      const ratio = smoothRatioRef.current;
      const percent = Math.round(ratio * 100);

      // 1. Direct DOM Updates (Zero React Re-render)
      if (scrubTopRef.current) {
        scrubTopRef.current.textContent = `${percent}%`;
      }
      if (scrubBarRef.current) {
        scrubBarRef.current.style.width = `${ratio * 100}%`;
      }

      // 2. Frame update
      const frameIdx = Math.round(ratio * (FRAME_COUNT - 1));
      if (frameIdx !== lastDrawnFrame) {
        lastDrawnFrame = frameIdx;
        if (frameNumberRef.current) {
          frameNumberRef.current.textContent = `${String(frameIdx + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
        }
        if (hasFramesRef.current) {
          renderFrame(frameIdx);
        }
      }

      // 3. Hardware-Accelerated Video Scrubbing (Only if frames are absent)
      if (!hasFramesRef.current) {
        const video = videoRef.current;
        if (video && video.duration && !video.seeking) {
          const targetTime = ratio * video.duration;
          if (Math.abs(video.currentTime - targetTime) > 0.05) {
            const v = video as any;
            if (typeof v.fastSeek === "function") {
              v.fastSeek(targetTime);
            } else {
              video.currentTime = targetTime;
            }
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

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
        minHeight: "calc(100vh - 58px)",
        height: "calc(100vh - 58px)",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#03060a",
      }}
    >
      {/* Full-viewport canvas for 120 FPS frame-scrubbing */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* Fallback Cinematic Video */}
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
          display: "none",
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

      {/* ── HERO TELEMETRY SUB-HEADER ── */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(1.2rem, 4vw, 3rem)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Left Sub-heading Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(10, 20, 32, 0.7)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(45, 75, 110, 0.45)",
            borderRadius: 30,
            padding: "6px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#8da3be",
            pointerEvents: "auto",
          }}
        >
          <span className="live-beacon live-dot-green" />
          <span>ROBOTICS ARENA // 3D FRAME SCRUBBER</span>
        </div>

        {/* Central HUD Status Pill with Real-time Direct DOM Scrub readout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(10, 20, 32, 0.75)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            borderRadius: 40,
            padding: "6px 18px",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)",
            pointerEvents: "auto",
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
            SCRUB: <span ref={scrubTopRef} style={{ color: "#ffaa00", minWidth: 32, display: "inline-block" }}>50%</span>
          </div>
        </div>

        {/* Right CTA to Jump into Live Arena */}
        <button
          onClick={handleScrollToArena}
          className="btn btn-primary"
          style={{
            fontSize: 12,
            padding: "8px 18px",
            gap: 8,
            pointerEvents: "auto",
            boxShadow: "0 0 20px rgba(255, 106, 0, 0.4)",
          }}
        >
          <Radio size={14} />
          <span>Enter Live Arena</span>
        </button>
      </div>

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
        {/* Play Live Broadcast CTA / Scroll to Arena */}
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

        {/* Frame / Timeline Scrubber Indicator with Direct DOM updates */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: "#8da3be", textAlign: "right" }}>
            <div>FRAME SCRUBBER</div>
            <div ref={frameNumberRef} style={{ color: "#00f0ff" }}>
              060 / {FRAME_COUNT}
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
              ref={scrubBarRef}
              style={{
                height: "100%",
                width: "50%",
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
