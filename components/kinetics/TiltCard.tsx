"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glareColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glareColor = "rgba(0, 240, 255, 0.15)",
  style = {},
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = x / rect.width;
    const yPct = y / rect.height;

    // Calculate rotation (-maxTilt to +maxTilt)
    const rotateY = (xPct - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - yPct) * (maxTilt * 2);

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: xPct * 100, y: yPct * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card-root ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        position: "relative",
        ...style,
      }}
    >
      {children}

      {/* Dynamic Specular Glare Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${glareColor} 0%, transparent 65%)`,
          opacity: glare.opacity,
          transition: "opacity 0.25s ease",
          zIndex: 5,
        }}
      />
    </div>
  );
}
