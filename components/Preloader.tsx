"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useLenis } from "lenis/react";
import FastLfrPreloaderTrack, { FlybyStreakBot } from "./FastLfrPreloaderTrack";

// ─── SVG ring constants with expanded canvas for neon lighting bloom ──────────
const OUTER_R = 84;   // outer ring radius
const INNER_R = 68;   // inner ring radius
const STROKE  = 6;    // stroke width
const SIZE    = (OUTER_R + STROKE) * 2 + 20; // svg viewport size with extra margin for glow

const circumference = (r: number) => 2 * Math.PI * r;

/** Convert a 0-100 progress value to a stroke-dashoffset for a given radius */
function progressToOffset(pct: number, r: number) {
  const c = circumference(r);
  return c - (pct / 100) * c;
}

// ─── Animated counter with illuminated neon digital readout ──────────────────
function AnimatedPercent({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    // Animate from current displayed → new value over 300ms
    const start     = displayed;
    const end       = value;
    const duration  = 300;
    const startTime = performance.now();

    const raf = (now: number) => {
      const t   = Math.min((now - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setDisplayed(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(raf);
    };

    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span
      style={{
        fontFamily: "var(--font-digital)",
        fontSize: "clamp(24px, 4.5vw, 34px)",
        fontWeight: 900,
        color: "#ffffff",
        textShadow: "0 0 12px #ffaa00, 0 0 24px #ff6a00, 0 0 45px rgba(255,106,0,0.95)",
        lineHeight: 1,
        display: "block",
        textAlign: "center",
      }}
    >
      {displayed}
      <span
        style={{
          fontSize: "clamp(13px, 2.2vw, 16px)",
          marginLeft: 2,
          color: "#ffaa00",
          textShadow: "0 0 10px #ff6a00",
        }}
      >
        %
      </span>
    </span>
  );
}

// ─── Spinning arc ring with intense lighting & glow ─────────────────────────
function SpinRing({
  r,
  dir,
  speed,
  color,
  glowColor,
  opacity = 0.9,
}: {
  r: number;
  dir: 1 | -1;
  speed: number;
  color: string;
  glowColor: string;
  opacity?: number;
}) {
  const c = circumference(r);
  const dash = c * 0.28;
  const gap = c * 0.72;

  return (
    <motion.circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={STROKE * 0.8}
      strokeLinecap="round"
      strokeDasharray={`${dash} ${gap}`}
      style={{
        opacity,
        transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`,
        filter: `drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 14px ${glowColor}) drop-shadow(0 0 28px ${glowColor})`,
      }}
      animate={{ rotate: dir === 1 ? 360 : -360 }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// ─── Floating LFR Bot Character with cinematic entry ─────────────────────────
function LfrBotCharacter({ progress }: { progress: number }) {
  // Bot gets more energized as progress increases
  const energy = progress / 100;
  const glowIntensity = 0.5 + energy * 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, x: -60, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{
        position: "relative",
        width: "clamp(130px, 20vw, 200px)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ── Copper-chrome ground scanner arc ── */}
      <motion.div
        style={{
          position: "absolute",
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: "75%",
          height: 18,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(255,106,0,${0.25 + energy * 0.35}) 0%, transparent 70%)`,
          filter: "blur(6px)",
          zIndex: 0,
        }}
        animate={{
          scaleX: [0.85, 1.1, 0.85],
          opacity: [0.4, 0.75, 0.4],
        }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Bot image with floating + copper-silver glow ── */}
      <motion.img
        src="/lfr-bot.png"
        alt="LFR Race Bot"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
          filter: `drop-shadow(0 0 ${12 + energy * 20}px rgba(255,106,0,${glowIntensity}))
                   drop-shadow(0 0 ${24 + energy * 30}px rgba(255,170,0,${glowIntensity * 0.7}))
                   drop-shadow(0 0 8px rgba(226,232,240,0.4))`,
        }}
        animate={{
          y: [0, -10, 0, -6, 0],
          filter: [
            `drop-shadow(0 0 12px rgba(255,106,0,0.55)) drop-shadow(0 0 24px rgba(255,170,0,0.4)) drop-shadow(0 0 8px rgba(226,232,240,0.3))`,
            `drop-shadow(0 0 ${18 + energy * 24}px rgba(255,106,0,${glowIntensity})) drop-shadow(0 0 ${36 + energy * 30}px rgba(255,170,0,${glowIntensity * 0.8})) drop-shadow(0 0 16px rgba(255,255,255,0.6))`,
            `drop-shadow(0 0 12px rgba(255,106,0,0.55)) drop-shadow(0 0 24px rgba(255,170,0,0.4)) drop-shadow(0 0 8px rgba(226,232,240,0.3))`,
          ],
        }}
        transition={{
          y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* ── READY indicator label ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 15 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          marginTop: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          fontWeight: 700,
          color: progress >= 100 ? "#ffaa00" : "#94a3b8",
          textShadow: progress >= 100
            ? "0 0 10px rgba(255,170,0,0.9)"
            : "0 2px 4px rgba(0,0,0,0.8)",
          textAlign: "center",
        }}
      >
        {progress >= 100 ? "▶ ARMED" : `BOOT ${progress}%`}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Preloader ───────────────────────────────────────────────────────────
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(true);
  const [fade, setFade]         = useState(false);
  const lenis                   = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (visible) {
      lenis.stop();
    } else {
      lenis.start();
    }
    return () => {
      lenis.start();
    };
  }, [lenis, visible]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const duration = 5200; // 5.2 s cinematic load
    const start    = Date.now();

    const playAudio = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.volume = 1.0;
        audio.play().catch(() => {});
      }
    };

    playAudio();

    const handleInteraction = () => playAudio();
    window.addEventListener("click",       handleInteraction);
    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("touchstart",  handleInteraction);
    window.addEventListener("keydown",     handleInteraction);
    document.addEventListener("click",     handleInteraction);

    // Progress counter — drives both the bar and the SVG arcs
    const timer = setInterval(() => {
      const value = Math.min(
        100,
        Math.floor(((Date.now() - start) / duration) * 100),
      );
      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);
        finish();
      }
    }, 25);

    function finish() {
      setFade(true);

      // Smooth audio fade-out
      const audio = audioRef.current;
      if (audio) {
        const fi = setInterval(() => {
          if (audio && audio.volume > 0.08) {
            audio.volume = Math.max(0, audio.volume - 0.12);
          } else {
            clearInterval(fi);
            audio?.pause();
          }
        }, 50);
      }

      setTimeout(() => setVisible(false), 700);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener("click",       handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("touchstart",  handleInteraction);
      window.removeEventListener("keydown",     handleInteraction);
      document.removeEventListener("click",     handleInteraction);
    };
  }, []);

  if (!visible) return null;

  // SVG arc values
  const outerC    = circumference(OUTER_R);
  const innerC    = circumference(INNER_R);
  const outerOffset = progressToOffset(progress, OUTER_R);
  const innerOffset = progressToOffset(Math.max(0, progress - 8), INNER_R); // inner lags slightly

  return (
    <div
      data-lenis-prevent
      onClick={() => {
        if (audioRef.current?.paused) audioRef.current.play().catch(() => {});
      }}
      style={{
        position:   "fixed",
        inset:       0,
        zIndex:      99999,
        background: "#03060a",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow:   "hidden",
        cursor:     "pointer",
        opacity:    fade ? 0 : 1,
        transform:  fade ? "scale(1.03)" : "scale(1)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* ── Audio ── */}
      <audio
        ref={audioRef}
        src="/intro-music.mp3"
        autoPlay
        playsInline
        preload="auto"
        style={{ display: "none" }}
      />

      {/* ── Background Video ── */}
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        src="/track-vision-intro.mp4"
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "brightness(1) contrast(1.05)",
        }}
      />

      {/* ── Subtle Transparent Vignette (Soft edge shading so full video remains visible) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at center, transparent 40%, rgba(3,6,10,0.35) 100%)",
        }}
      />

      {/* ── High-Speed LFR Supersonic Flyby Lanes (TechGeeks Fast Bot Atmosphere) ── */}
      <FlybyStreakBot top="14%" delay={2.1} speed={1.15} direction="right" />
      <FlybyStreakBot top="86%" delay={2.8} speed={0.95} direction="left" />

      {/* ── Centered Transparent Loader (Bot left + Ring right, float over video) ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          width: "min(780px, 94vw)",
          background: "transparent",
          border: "none",
          padding: "16px 20px",
          textAlign: "center",
        }}
      >

        {/* ══ TOP SECTION: Bot + Ring side-by-side ══ */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(18px, 4vw, 48px)",
            marginBottom: 20,
          }}
        >

          {/* ── LEFT: LFR Bot Character ── */}
          <LfrBotCharacter progress={progress} />
          {/* ── RIGHT: SVG Ring Assembly with Intense Reactor Lighting ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", width: SIZE, height: SIZE }}>
              {/* ── Ambient Radial Lighting Core Aura (Warm Copper & Platinum Chrome Halo) ── */}
              <div
                style={{
                  position: "absolute",
                  inset: -28,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,106,0,0.35) 0%, rgba(255,170,0,0.2) 35%, rgba(226,232,240,0.15) 55%, transparent 75%)",
                  filter: "blur(24px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                style={{ overflow: "visible", position: "relative", zIndex: 1 }}
              >
                {/* ── Track circles (subtle metallic background) ── */}
                <circle
                  cx={SIZE / 2} cy={SIZE / 2} r={OUTER_R}
                  fill="none"
                  stroke="rgba(255,106,0,0.22)"
                  strokeWidth={STROKE}
                />
                <circle
                  cx={SIZE / 2} cy={SIZE / 2} r={INNER_R}
                  fill="none"
                  stroke="rgba(226,232,240,0.2)"
                  strokeWidth={STROKE}
                />

                {/* ── High-Luminescence Spinning Arcs: Copper Orange & Platinum Silver ── */}
                <SpinRing r={OUTER_R} dir={-1} speed={3.2} color="#ffaa00" glowColor="#ff6a00" opacity={0.92} />
                <SpinRing r={INNER_R} dir={1}  speed={2.2} color="#ffffff" glowColor="#e2e8f0" opacity={0.9} />

                {/* ── Outer fill arc — intense electric copper/orange matching logo's "V" & ring ── */}
                <motion.circle
                  cx={SIZE / 2} cy={SIZE / 2} r={OUTER_R}
                  fill="none"
                  stroke="url(#outerGrad)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={outerC}
                  strokeDashoffset={outerOffset}
                  style={{
                    rotate: -90,
                    transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`,
                    filter: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 16px #ffaa00) drop-shadow(0 0 32px #ff6a00) drop-shadow(0 0 65px rgba(255,106,0,0.9))",
                  }}
                  transition={{ duration: 0.08, ease: "linear" }}
                />

                {/* ── Inner fill arc — polished brushed titanium chrome matching logo's "T" & bezel ── */}
                <motion.circle
                  cx={SIZE / 2} cy={SIZE / 2} r={INNER_R}
                  fill="none"
                  stroke="url(#innerGrad)"
                  strokeWidth={STROKE * 0.85}
                  strokeLinecap="round"
                  strokeDasharray={innerC}
                  strokeDashoffset={innerOffset}
                  style={{
                    rotate: -90,
                    transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`,
                    filter: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 16px #f1f5f9) drop-shadow(0 0 28px #cbd5e1) drop-shadow(0 0 50px rgba(226,232,240,0.85))",
                  }}
                  transition={{ duration: 0.08, ease: "linear" }}
                />

                {/* ── Official Metallic Dual-Tone Lighting Gradients ── */}
                <defs>
                  <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#ffffff" />
                    <stop offset="20%"  stopColor="#ffdd55" />
                    <stop offset="55%"  stopColor="#ff8800" />
                    <stop offset="85%"  stopColor="#ff5500" />
                    <stop offset="100%" stopColor="#c85a17" />
                  </linearGradient>
                  <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#ffffff" />
                    <stop offset="25%"  stopColor="#f8fafc" />
                    <stop offset="60%"  stopColor="#e2e8f0" />
                    <stop offset="85%"  stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* ── Centre: Official Metallic TV Emblem Badge + Animated % Counter ── */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                {/* Official Metallic TV Logo Badge */}
                <motion.img
                  src="/track-vision-badge.png"
                  alt="Track Vision Official Emblem"
                  width={64}
                  height={64}
                  style={{
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 16px rgba(255, 106, 0, 0.9)) drop-shadow(0 0 28px rgba(226, 232, 240, 0.7))",
                  }}
                  animate={{
                    scale: [0.96, 1.05, 0.96],
                    filter: [
                      "drop-shadow(0 0 10px rgba(255,106,0,0.7)) drop-shadow(0 0 18px rgba(226,232,240,0.5))",
                      "drop-shadow(0 0 24px rgba(255,120,0,1)) drop-shadow(0 0 38px rgba(255,255,255,0.85))",
                      "drop-shadow(0 0 10px rgba(255,106,0,0.7)) drop-shadow(0 0 18px rgba(226,232,240,0.5))",
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Animated % counter */}
                <AnimatedPercent value={progress} />
              </div>
            </div>

            {/* ── Official Metallic TRACK VISION Title Wordmark with Glowing Lighting ── */}
            <div style={{ marginTop: 18, marginBottom: 2 }}>
              <img
                src="/track-vision-text.png"
                alt="Track Vision"
                style={{
                  height: 34,
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 16px rgba(255,255,255,0.7)) drop-shadow(0 0 32px rgba(255,106,0,0.8)) drop-shadow(0 4px 14px rgba(0,0,0,0.95))",
                }}
              />
            </div>
          </div>
        </div>
        {/* ══ end TOP SECTION ══ */}

        {/* ── Live Status Header Row ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            marginBottom: 10,
            padding: "0 2px",
          }}
        >
          <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#ffaa00",
                boxShadow: "0 0 10px #ff6a00, 0 0 18px rgba(255,106,0,0.8)",
                display: "inline-block",
              }}
            />
            <span style={{ color: "#e2e8f0", letterSpacing: "0.1em", fontWeight: 600, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
              SYSTEM TELEMETRY BOOT
            </span>
          </span>
          <span
            style={{
              fontFamily: "var(--font-digital)",
              color: "#ffaa00",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.05em",
              textShadow: "0 0 14px rgba(255,170,0,0.85), 0 0 24px rgba(255,106,0,0.6), 0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            {progress}%
          </span>
        </div>

        {/* ── Progress Bar (Translucent glass over video matching metallic logo palette) ── */}
        <div
          style={{
            height: 8,
            background: "rgba(10,14,22,0.65)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,106,0,0.45)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(255,106,0,0.25), inset 0 2px 4px rgba(0,0,0,0.8)",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #ffffff 0%, #cbd5e1 20%, #ffaa00 60%, #ff6a00 100%)",
              boxShadow: "0 0 20px rgba(255,170,0,0.95), 0 0 35px rgba(255,106,0,0.8)",
              transition: "width 25ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
