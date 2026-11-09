"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

// ─── SVG ring constants ───────────────────────────────────────────────────────
const OUTER_R = 72;   // outer ring radius
const INNER_R = 56;   // inner ring radius
const STROKE  = 5;    // stroke width
const SIZE    = (OUTER_R + STROKE) * 2 + 4; // svg viewport size

const circumference = (r: number) => 2 * Math.PI * r;

/** Convert a 0-100 progress value to a stroke-dashoffset for a given radius */
function progressToOffset(pct: number, r: number) {
  const c = circumference(r);
  return c - (pct / 100) * c;
}

// ─── Animated counter that smoothly interpolates to `target` ─────────────────
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
        fontSize: "clamp(28px, 5vw, 40px)",
        fontWeight: 900,
        color: "#ff6a00",
        textShadow: "0 0 24px rgba(255,106,0,0.9), 0 0 48px rgba(255,106,0,0.4)",
        lineHeight: 1,
        display: "block",
        textAlign: "center",
      }}
    >
      {displayed}
      <span
        style={{
          fontSize: "clamp(14px, 2.5vw, 18px)",
          marginLeft: 2,
          color: "rgba(255,106,0,0.7)",
        }}
      >
        %
      </span>
    </span>
  );
}

// ─── Spinning arc ring (decorative rotation) ──────────────────────────────────
function SpinRing({
  r,
  dir,
  speed,
  color,
  opacity = 0.35,
}: {
  r: number;
  dir: 1 | -1;
  speed: number;
  color: string;
  opacity?: number;
}) {
  const c = circumference(r);
  // Show only ~20% of the circumference as a rotating dashed arc
  const dash = c * 0.2;
  const gap = c * 0.8;

  return (
    <motion.circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={STROKE * 0.6}
      strokeLinecap="round"
      strokeDasharray={`${dash} ${gap}`}
      style={{
        opacity,
        transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`,
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

// ─── Main Preloader ───────────────────────────────────────────────────────────
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(true);
  const [fade, setFade]         = useState(false);
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

  // Telemetry status readout
  const getStatusText = (val: number) => {
    if (val < 20) return "BOOTING HARDWARE: ESP32 DevKit V1...";
    if (val < 40) return "CALIBRATING 4-GATE OPTICAL LASER ARRAY (CH1 - CH4)...";
    if (val < 65) return "ESTABLISHING SUPABASE REALTIME WEBSOCKETS...";
    if (val < 85) return "SYNCHRONIZING MILLISECOND COMPETITION TIMER...";
    if (val < 98) return "CONNECTING BROADCAST SPECTATOR STREAM...";
    return "SYSTEMS ARMED // LAUNCHING TRACK VISION ARENA...";
  };

  // SVG arc values
  const outerC    = circumference(OUTER_R);
  const innerC    = circumference(INNER_R);
  const outerOffset = progressToOffset(progress, OUTER_R);
  const innerOffset = progressToOffset(Math.max(0, progress - 8), INNER_R); // inner lags slightly

  return (
    <div
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
          filter: "brightness(0.85) contrast(1.1)",
        }}
      />

      {/* ── Overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: [
            "radial-gradient(circle at center, rgba(3,6,10,0.6) 0%, rgba(3,6,10,0.92) 80%, #03060a 100%)",
            "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.4) 50%)",
          ].join(", "),
          backgroundSize: "100% 100%, 100% 4px",
        }}
      />

      {/* ── Top HUD Bar ── */}
      <div
        style={{
          position: "absolute",
          top: 24, left: 28, right: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.15em",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="live-beacon live-dot-green" />
          <span>NIRMAN 6.0 ROBOTICS ARENA</span>
        </div>
        <div className="mono" style={{ color: "#00f0ff", fontSize: 10, letterSpacing: "0.18em" }}>
          SYSTEM BOOT SEQUENCE // 1000 Hz
        </div>
      </div>

      {/* ── Centered Loading Card ── */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          width: "min(560px, 94vw)",
          background: "rgba(6,14,26,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(0,240,255,0.45)",
          borderRadius: 22,
          padding: "32px 30px 26px",
          textAlign: "center",
          boxShadow: "0 25px 70px rgba(0,0,0,0.9), 0 0 45px rgba(0,240,255,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
        className="hud-panel"
      >

        {/* ══════════════════════════════════════════════
            ANIMATION LOADER — SVG dual-ring + counter
            Replaces the old static logo box.
            ══════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          {/* SVG Ring Assembly */}
          <div style={{ position: "relative", width: SIZE, height: SIZE }}>
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ overflow: "visible" }}
            >
              {/* ── Track circles (dim background) ── */}
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={OUTER_R}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={STROKE}
              />
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={INNER_R}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={STROKE}
              />

              {/* ── Decorative spinning arcs (Framer Motion) ── */}
              <SpinRing r={OUTER_R} dir={-1} speed={3.5} color="#00f0ff" opacity={0.3} />
              <SpinRing r={INNER_R} dir={1}  speed={2.2} color="#ffaa00" opacity={0.25} />

              {/* ── Outer fill arc — orange, tracks progress ── */}
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
                  filter: "drop-shadow(0 0 6px #ff6a00) drop-shadow(0 0 14px rgba(255,106,0,0.5))",
                }}
                transition={{ duration: 0.08, ease: "linear" }}
              />

              {/* ── Inner fill arc — cyan, lags slightly ── */}
              <motion.circle
                cx={SIZE / 2} cy={SIZE / 2} r={INNER_R}
                fill="none"
                stroke="url(#innerGrad)"
                strokeWidth={STROKE * 0.8}
                strokeLinecap="round"
                strokeDasharray={innerC}
                strokeDashoffset={innerOffset}
                style={{
                  rotate: -90,
                  transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`,
                  filter: "drop-shadow(0 0 5px #00f0ff) drop-shadow(0 0 12px rgba(0,240,255,0.4))",
                }}
                transition={{ duration: 0.08, ease: "linear" }}
              />

              {/* ── Gradient defs ── */}
              <defs>
                <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#ff6a00" />
                  <stop offset="60%"  stopColor="#ff9500" />
                  <stop offset="100%" stopColor="#ffcc00" />
                </linearGradient>
                <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#00ff88" />
                </linearGradient>
              </defs>
            </svg>

            {/* ── Centre: logo + animated percent counter ── */}
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
              }}
            >
              {/* Logo */}
              <motion.img
                src="/track-vision-logo.png"
                alt="Track Vision"
                width={36}
                height={36}
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 8px rgba(0,240,255,0.9))",
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                  scale:   [0.97, 1.03, 0.97],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Animated % counter */}
              <AnimatedPercent value={progress} />
            </div>
          </div>

          {/* ── Title & sub-label (below the rings) ── */}
          <div
            className="digital"
            style={{
              marginTop: 16,
              fontSize: "clamp(18px, 3.5vw, 24px)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              color: "#ffffff",
              textShadow: "0 0 25px rgba(0,240,255,0.5)",
            }}
          >
            TRACK{" "}
            <span
              style={{ color: "#ff6a00", textShadow: "0 0 25px rgba(255,106,0,0.6)" }}
            >
              VISION
            </span>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "#ffaa00",
              letterSpacing: "0.22em",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Zap size={11} color="#ffaa00" /> NIRMAN 6.0 ROBOTICS ARENA
          </div>
        </div>
        {/* ══ end Animation Loader section ══ */}

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
          <span style={{ color: "#8da3be", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="live-beacon live-dot-green" />
            <span style={{ color: "#d0e4ff", letterSpacing: "0.08em" }}>SYSTEM TELEMETRY BOOT</span>
          </span>
          <span
            style={{
              fontFamily: "var(--font-digital)",
              color: "#00f0ff",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.05em",
              textShadow: "0 0 14px rgba(0,240,255,0.8)",
            }}
          >
            {progress}%
          </span>
        </div>

        {/* ── Progress Bar ── */}
        <div
          style={{
            height: 8,
            background: "rgba(12,24,40,0.9)",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,240,255,0.35)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #00f0ff 0%, #00ff88 55%, #ff6a00 100%)",
              boxShadow: "0 0 20px rgba(0,240,255,0.9), 0 0 35px rgba(255,106,0,0.5)",
              transition: "width 25ms linear",
            }}
          />
        </div>

        {/* ── Dynamic Status Text Readout ── */}
        <div
          style={{
            marginTop: 14,
            padding: "8px 14px",
            background: "rgba(3,8,16,0.85)",
            borderRadius: 10,
            border: "1px solid rgba(0,240,255,0.2)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#6de8ff",
            letterSpacing: "0.08em",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          <span style={{ color: "#ffaa00", fontWeight: "bold" }}>&gt;</span>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {getStatusText(progress)}
          </span>
        </div>
      </div>
    </div>
  );
}
