"use client";

import { useEffect, useRef, useState } from "react";

// Module-level AudioContext singleton
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMutedGlobal = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx() as AudioContext;
    audioCtx = ctx;
    const gain = ctx.createGain();
    masterGain = gain;
    gain.gain.value = isMutedGlobal ? 0 : 0.4;
    gain.connect(ctx.destination);
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, delay = 0, volume = 0.6) {
  const ctx = getCtx();
  if (!ctx || !masterGain || isMutedGlobal) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(masterGain);
  const start = ctx.currentTime + delay;
  osc.start(start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.stop(start + duration + 0.05);
}

export function playCheckpointBeep(gate: 1 | 2 | 3 | 4) {
  const freqs: Record<number, number> = { 1: 440, 2: 554, 3: 659, 4: 880 };
  const duration = gate === 4 ? 0.3 : 0.15;
  const vol = gate === 4 ? 0.8 : 0.5;
  playTone(freqs[gate], duration, 0, vol);
  if (gate === 4) {
    // Double beep for finish
    playTone(freqs[gate] * 1.5, 0.2, 0.35, 0.6);
  }
}

export function playRaceStart() {
  playTone(300, 0.1, 0, 0.5);
  playTone(400, 0.1, 0.2, 0.5);
  playTone(600, 0.15, 0.4, 0.7);
}

export function playRaceFinish() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, 0.25, i * 0.15, 0.6);
  });
}

export default function AudioEngine() {
  const [muted, setMuted] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    // Load saved mute preference
    const saved = localStorage.getItem("tv-audio-muted");
    if (saved === "true") {
      setMuted(true);
      isMutedGlobal = true;
    }

    // Initialize AudioContext on first user interaction
    if (!initialized.current) {
      initialized.current = true;
      const unlock = () => {
        getCtx();
        document.removeEventListener("click", unlock);
        document.removeEventListener("keydown", unlock);
      };
      document.addEventListener("click", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
    }
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    isMutedGlobal = next;
    localStorage.setItem("tv-audio-muted", String(next));
    if (masterGain) {
      masterGain.gain.setTargetAtTime(next ? 0 : 0.4, getCtx()!.currentTime, 0.05);
    }
    // If unmuting, ensure context is running
    if (!next) getCtx();
  };

  return (
    <button
      onClick={toggle}
      title={muted ? "Unmute audio" : "Mute audio"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(10, 20, 32, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${muted ? "rgba(45, 75, 110, 0.4)" : "rgba(0, 240, 255, 0.35)"}`,
        boxShadow: muted ? "none" : "0 0 20px rgba(0, 240, 255, 0.15)",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        fontSize: 18,
        transition: "all 0.25s ease",
        color: muted ? "#6c84a0" : "#00f0ff",
        outline: "none",
      }}
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="22" y1="9" x2="16" y2="15"/>
          <line x1="16" y1="9" x2="22" y2="15"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      )}
    </button>
  );
}
