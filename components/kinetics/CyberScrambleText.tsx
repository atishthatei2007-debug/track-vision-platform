"use client";

import { useEffect, useState } from "react";

const GLYPHS = "0123456789ABCDEF!@#$<>_/-[]";

interface CyberScrambleTextProps {
  text: string;
  speed?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function CyberScrambleText({
  text,
  speed = 25,
  duration = 400,
  className = "",
  style = {},
}: CyberScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(Math.floor(duration / speed), 6);
    const targetLength = text.length;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      const scrambled = text
        .split("")
        .map((char, idx) => {
          if (char === " " || char === "." || char === ":") return char;
          // As progress advances, reveal original characters from left to right
          if (idx / targetLength < progress) {
            return char;
          }
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplayText(scrambled);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, duration]);

  return (
    <span className={className} style={style}>
      {displayText}
    </span>
  );
}
