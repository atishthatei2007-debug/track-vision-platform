"use client";

import { useEffect, useRef, useState } from "react";

export default function TechkritiCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  const [visible, setVisible] = useState(false);
  const [hoveredState, setHoveredState] = useState<"default" | "button" | "card" | "target">("default");

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only mount on desktop pointer devices
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    if (!isPointerFine) return;

    setVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Instant pinpoint dot update
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check what is hovered
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("button, a, input, select, textarea, [role='button'], .cursor-target");
      if (interactive) {
        if (target.closest(".gate-card, .track-node, [data-cursor='target']")) {
          setHoveredState("target");
        } else if (target.closest(".hud-chamfer, button, a")) {
          setHoveredState("button");
        } else {
          setHoveredState("card");
        }
      } else {
        setHoveredState("default");
      }
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Smooth Lerp Animation Loop for Secondary Ring
    const LERP_FACTOR = 0.16;
    const render = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * LERP_FACTOR;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * LERP_FACTOR;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      if (coordsRef.current && mousePos.current.x > 0) {
        coordsRef.current.textContent = `${Math.round(mousePos.current.x)},${Math.round(mousePos.current.y)}`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!visible) return null;

  const isTarget = hoveredState === "target";
  const isButton = hoveredState === "button";
  const isCard = hoveredState === "card";
  const isHovered = isTarget || isButton || isCard;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999999,
        overflow: "hidden",
      }}
    >
      {/* 1. Primary Precision Zero-Latency Dot */}
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          marginTop: -3,
          marginLeft: -3,
          borderRadius: "50%",
          background: isTarget ? "#ff0055" : isButton ? "#ccff00" : "#00f0ff",
          boxShadow: `0 0 10px ${isTarget ? "#ff0055" : isButton ? "#ccff00" : "#00f0ff"}`,
          transition: "background 0.2s ease, box-shadow 0.2s ease",
          willChange: "transform",
        }}
      />

      {/* 2. Secondary Lerp Inertial Reticle / Crosshair */}
      <div
        ref={ringRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: isTarget ? 54 : isButton ? 44 : isCard ? 36 : 24,
          height: isTarget ? 54 : isButton ? 44 : isCard ? 36 : 24,
          marginTop: isTarget ? -27 : isButton ? -22 : isCard ? -18 : -12,
          marginLeft: isTarget ? -27 : isButton ? -22 : isCard ? -18 : -12,
          borderRadius: isTarget ? "6px" : "50%",
          border: `1.5px solid ${
            isTarget
              ? "rgba(255, 0, 85, 0.85)"
              : isButton
              ? "rgba(204, 255, 0, 0.85)"
              : "rgba(0, 240, 255, 0.45)"
          }`,
          background: isTarget
            ? "rgba(255, 0, 85, 0.08)"
            : isButton
            ? "rgba(204, 255, 0, 0.08)"
            : "transparent",
          boxShadow: isHovered
            ? `0 0 16px ${isTarget ? "rgba(255, 0, 85, 0.4)" : "rgba(204, 255, 0, 0.35)"}`
            : "none",
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), margin 0.25s cubic-bezier(0.16, 1, 0.3, 1), border 0.2s ease, background 0.2s ease, border-radius 0.2s ease",
          willChange: "transform",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Optical Target Crosshairs on Target Mode */}
        {isTarget && (
          <>
            <span
              style={{
                position: "absolute",
                top: -8,
                width: 1,
                height: 6,
                background: "#ff0055",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: -8,
                width: 1,
                height: 6,
                background: "#ff0055",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: -8,
                height: 1,
                width: 6,
                background: "#ff0055",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: -8,
                height: 1,
                width: 6,
                background: "#ff0055",
              }}
            />
          </>
        )}

        {/* Small Real-time Coordinate Telemetry Badge */}
        {isHovered && (
          <span
            ref={coordsRef}
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: isTarget ? "#ff0055" : isButton ? "#ccff00" : "#7cefff",
              whiteSpace: "nowrap",
              background: "rgba(4, 8, 14, 0.85)",
              padding: "1px 5px",
              borderRadius: 3,
              border: `1px solid ${isTarget ? "rgba(255, 0, 85, 0.4)" : "rgba(204, 255, 0, 0.3)"}`,
            }}
          />
        )}
      </div>
    </div>
  );
}
