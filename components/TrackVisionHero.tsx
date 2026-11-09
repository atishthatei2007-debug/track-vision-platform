"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Award,
  BarChart3,
  ChevronDown,
  Cpu,
  Radio,
  RotateCcw,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { GccTab } from "@/components/gcc/GccNav";

// Frame Sequence Configuration
const FRAME_COUNT = 120;
const FOLDER = "trackvision-frames";

interface TrackVisionHeroProps {
  onEnterArena?: () => void;
  onSelectTab?: (tab: GccTab) => void;
  isBackground?: boolean;
}

export default function TrackVisionHero({
  onEnterArena,
  onSelectTab,
  isBackground = false,
}: TrackVisionHeroProps) {
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

    // Dynamic cover resize with full retina resolution and high quality smoothing
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
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
        minHeight: "100vh",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#03060a",
      }}
    >
      {/* Full-viewport canvas for 120 FPS frame-scrubbing — Crystal Clear Retina */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          imageRendering: "auto",
        }}
      />

      {/* Fallback Cinematic Video — High Fidelity, Crisp & Bright */}
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
          filter: "brightness(1) contrast(1.05)",
          display: "none",
        }}
      />

      {/* Soft Vignette Gradient (Ensures HUD text legibility without dimming the robot or adding grids) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(to right, rgba(3,6,10,0.7) 0%, rgba(3,6,10,0.3) 35%, transparent 65%)",
        }}
      />

      {/* ── FOREGROUND INTERACTIVE HUD OVERLAYS (Visible on Showcase tab) ── */}
      <div
        style={{
          opacity: isBackground ? 0 : 1,
          pointerEvents: isBackground ? "none" : "auto",
          transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
      {/* ── HERO TELEMETRY SUB-HEADER (Clean, Minimal, No Redundant Top Nav) ── */}
      <header
        style={{
          position: "absolute",
          top: 16,
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
        {/* Brand Logo & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "radial-gradient(circle, #10243b 0%, #060e18 100%)",
              border: "1px solid rgba(0, 240, 255, 0.45)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 14px rgba(0, 240, 255, 0.25)",
            }}
          >
            <img
              src="/track-vision-logo.png"
              alt="Track Vision Logo"
              width={24}
              height={24}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <div
              className="digital"
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              TRACK <span style={{ color: "#ff6a00" }}>VISION</span>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 8.5,
                color: "#ffaa00",
                letterSpacing: "0.16em",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              GCC SMART RACE CONTROL // NIRMAN 6.0
            </div>
          </div>
        </div>

        {/* Central HUD Status Pill with Real-time Direct DOM Scrub readout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(10, 20, 32, 0.8)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            borderRadius: 30,
            padding: "5px 14px",
            boxShadow: "0 0 16px rgba(0, 240, 255, 0.12)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
            <span className="live-beacon live-dot-green" />
            <span className="mono" style={{ color: "#00ff88", fontWeight: 600 }}>
              GATES ARMED [4/4]
            </span>
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
          <div className="mono" style={{ fontSize: 10, color: "#8da3be" }}>
            FREQ: <span style={{ color: "#00f0ff" }}>1000 Hz</span>
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
          <div className="mono" style={{ fontSize: 10, color: "#8da3be" }}>
            SCRUB: <span ref={scrubTopRef} style={{ color: "#ffaa00", minWidth: 28, display: "inline-block" }}>50%</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (Left Telemetry Display — Precision Responsive Screen Size) ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: "clamp(1.5rem, 5vw, 4.5rem)",
          maxWidth: "clamp(320px, 46vw, 600px)",
          zIndex: 5,
          maxHeight: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Category Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "4px 10px",
            borderRadius: 6,
            background: "rgba(255, 170, 0, 0.12)",
            border: "1px solid rgba(255, 170, 0, 0.35)",
            color: "#ffaa00",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            marginBottom: 10,
            alignSelf: "flex-start",
          }}
        >
          <Zap size={12} color="#ffaa00" />
          <span>ROBOTICS TIMING & TELEMETRY PROTOCOL</span>
        </div>

        {/* Main Title */}
        <h1
          className="digital"
          style={{
            fontSize: "clamp(2.2rem, 4.4vw, 3.8rem)",
            fontWeight: 900,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#ffffff",
            lineHeight: 0.95,
            margin: "0 0 10px",
            textShadow: "0 0 35px rgba(0, 240, 255, 0.35), 0 4px 25px rgba(0, 0, 0, 0.95)",
          }}
        >
          TRACK{" "}
          <span style={{ color: "#ff6a00", textShadow: "0 0 40px rgba(255, 106, 0, 0.7)" }}>
            VISION
          </span>
        </h1>

        {/* Subtitle Description */}
        <p
          style={{
            fontSize: "clamp(0.8rem, 0.95vw, 0.88rem)",
            fontWeight: 400,
            lineHeight: 1.5,
            color: "rgba(220, 235, 255, 0.78)",
            marginBottom: 14,
            maxWidth: 480,
          }}
        >
          Engineered for <strong>NIRMAN 6.0</strong>: 4-gate ESP32 optical laser tracking,
          server-recorded split timestamps, sub-millisecond precision, and live broadcast synchronization.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <button
            onClick={handleScrollToArena}
            className="btn btn-primary"
            style={{ padding: "8px 18px", fontSize: 12, gap: 7 }}
          >
            <Radio size={14} /> Enter Live Arena
          </button>

          <Link
            href="/admin"
            className="btn"
            style={{ padding: "8px 16px", fontSize: 12, gap: 7, background: "rgba(10, 20, 34, 0.75)", border: "1px solid rgba(0, 240, 255, 0.35)" }}
          >
            <Shield size={14} color="#00f0ff" /> Launch Console
          </Link>
        </div>

        {/* ── ALL RACE CONTROL OPTIONS (Integrated Directly on the Animation Video) ── */}
        <div
          style={{
            background: "rgba(6, 12, 22, 0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(45, 75, 110, 0.45)",
            borderRadius: 12,
            padding: "10px 12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 9.5,
              color: "#ffaa00",
              letterSpacing: "0.16em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Activity size={11} color="#ffaa00" />
              <span>RACE CONTROL PORTALS // CLICK TO OPEN:</span>
            </div>
            <span style={{ color: "#00ff88", fontSize: 9 }}>● REALTIME</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
              gap: 6,
            }}
          >
            {[
              { id: "live" as GccTab, label: "Live Arena", sub: "Live Timing", icon: Radio, color: "#ff6a00" },
              { id: "overview" as GccTab, label: "Overview", sub: "Telemetry", icon: Activity, color: "#00f0ff" },
              { id: "teams" as GccTab, label: "Teams", sub: "16 Squads", icon: Users, color: "#00ff88" },
              { id: "leaderboard" as GccTab, label: "Leaderboard", sub: "Standings", icon: Award, color: "#ffaa00" },
              { id: "replay" as GccTab, label: "Replay", sub: "Playback", icon: RotateCcw, color: "#c084fc" },
              { id: "hardware" as GccTab, label: "Hardware", sub: "ESP32 DevKit", icon: Cpu, color: "#38bdf8" },
              { id: "reports" as GccTab, label: "Reports", sub: "PDF Analytics", icon: BarChart3, color: "#34d399" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => (onSelectTab ? onSelectTab(item.id) : handleScrollToArena())}
                  className="gcc-card"
                  style={{
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: "rgba(10, 18, 30, 0.8)",
                    border: `1px solid ${item.color}35`,
                    borderRadius: 7,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.16s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 3px 12px ${item.color}35`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${item.color}35`;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Icon size={13} color={item.color} />
                  <div>
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        fontFamily: "var(--font-digital)",
                        color: "#fff",
                        letterSpacing: "0.03em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </div>
                    <div className="mono" style={{ fontSize: 7.5, color: "#8da3be" }}>
                      {item.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostics Ticker */}
        <div
          style={{
            marginTop: 12,
            padding: "6px 12px",
            borderRadius: 8,
            background: "rgba(10, 18, 30, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(45, 75, 110, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#8da3be",
            alignSelf: "flex-start",
          }}
        >
          <div>
            HARDWARE: <span style={{ color: "#00f0ff" }}>ESP32 DevKit V1</span>
          </div>
          <span style={{ opacity: 0.3 }}>//</span>
          <div>
            CHANNELS: <span style={{ color: "#00ff88" }}>4x ADC1 Gates</span>
          </div>
          <span style={{ opacity: 0.3 }}>//</span>
          <div>
            SYNC: <span style={{ color: "#ffaa00" }}>Supabase Realtime</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TELEMETRY BAR (Compact 52px for Optimal Viewport Fit) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
          background: "rgba(4, 8, 14, 0.85)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(45, 75, 110, 0.35)",
          padding: "0 clamp(1rem, 3.5vw, 2.5rem)",
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
      </div>
    </section>
  );
}
