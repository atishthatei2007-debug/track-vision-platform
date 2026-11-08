"use client";

import { useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const duration = 5200; // 5.2s cinematic load
    const start = Date.now();

    const playAudio = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.volume = 1.0;
        audio.play().catch(() => {
          // Will play on user interaction
        });
      }
    };

    // Try playing immediately
    playAudio();

    // Listen for any interaction anywhere on the screen
    const handleInteraction = () => {
      playAudio();
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    document.addEventListener("click", handleInteraction);

    // Progress counter
    const timer = setInterval(() => {
      const value = Math.min(
        100,
        Math.floor(((Date.now() - start) / duration) * 100)
      );

      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);
        finish();
      }
    }, 25);

    function finish() {
      setFade(true);

      // Smooth audio fade-out when loading completes
      const audio = audioRef.current;
      if (audio) {
        const fadeInterval = setInterval(() => {
          if (audio && audio.volume > 0.08) {
            audio.volume = Math.max(0, audio.volume - 0.12);
          } else {
            clearInterval(fadeInterval);
            if (audio) {
              audio.pause();
            }
          }
        }, 50);
      }

      setTimeout(() => setVisible(false), 700);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("click", handleInteraction);
    };
  }, []);

  if (!visible) return null;

  // Telemetry status readout message
  const getStatusText = (val: number) => {
    if (val < 25) return "CONNECTING ESP32 LASER GATE ARRAYS (CH1 - CH4)...";
    if (val < 50) return "ESTABLISHING SUPABASE REALTIME WEBSOCKETS...";
    if (val < 75) return "CALIBRATING COMPETITION STOPWATCH & TELEMETRY...";
    if (val < 95) return "SYNCHRONIZING LIVE ARENA LEADERBOARD...";
    return "SYSTEMS ONLINE // LAUNCHING ARENA CONTROL...";
  };

  return (
    <div
      onClick={() => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#03060a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
        opacity: fade ? 0 : 1,
        transform: fade ? "scale(1.03)" : "scale(1)",
        transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Native HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src="/intro-music.mp3"
        autoPlay
        playsInline
        preload="auto"
        style={{ display: "none" }}
      />

      {/* Background Video — Full Screen Edge-to-Edge */}
      <video
        autoPlay
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
          filter: "brightness(0.95) contrast(1.05)",
        }}
      />

      {/* Cyber Grid & Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(3, 6, 10, 0.8) 100%)",
        }}
      />

      {/* Subtle Scanline Effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)",
          backgroundSize: "100% 4px",
          pointerEvents: "none",
          opacity: 0.4,
        }}
      />

      {/* Top HUD Bar */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 28,
          right: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "rgba(255, 255, 255, 0.7)",
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
          SYSTEM BOOT SEQUENCE
        </div>
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: "min(480px, 90%)",
          background: "rgba(6, 12, 22, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 240, 255, 0.35)",
          borderRadius: 16,
          padding: "18px 24px 16px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 240, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
        className="hud-panel"
      >
        {/* Status Line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            marginBottom: 8,
          }}
        >
          <span style={{ color: "#8da3be", display: "flex", alignItems: "center", gap: 6 }}>
            <Radio size={13} color="#00ff88" className="eq-bar" /> CALIBRATING SENSORS
          </span>
          <span
            style={{
              fontFamily: "var(--font-digital)",
              color: "#00f0ff",
              fontWeight: 800,
              fontSize: 14,
              textShadow: "0 0 10px rgba(0, 240, 255, 0.6)",
            }}
          >
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 6,
            background: "rgba(20, 35, 55, 0.8)",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(0, 240, 255, 0.2)",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #00f0ff, #ff6a00)",
              boxShadow: "0 0 16px rgba(0, 240, 255, 0.8)",
              transition: "width 25ms linear",
            }}
          />
        </div>

        {/* Status Text Readout */}
        <div
          style={{
            marginTop: 12,
            padding: "6px 12px",
            background: "rgba(3, 7, 14, 0.75)",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.05)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#6de8ff",
            letterSpacing: "0.08em",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "#ffaa00" }}>&gt;</span>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {getStatusText(progress)}
          </span>
        </div>
      </div>
    </div>
  );
}
