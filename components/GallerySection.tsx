"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";

type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

// Placeholder gallery — replace src with real event photos
const GALLERY: GalleryImage[] = [
  { src: "/gallery/race-01.jpg", alt: "Line follower bot at start gate", caption: "Circuit Breakers launching at Gate 01" },
  { src: "/gallery/race-02.jpg", alt: "Bot clearing hairpin", caption: "Track Titans clearing the hairpin" },
  { src: "/gallery/race-03.jpg", alt: "Podium celebration", caption: "NIRMAN 6.0 — Podium celebration" },
  { src: "/gallery/race-04.jpg", alt: "ESP32 hardware setup", caption: "4-Gate laser timing setup" },
  { src: "/gallery/race-05.jpg", alt: "Pit lane activity", caption: "Teams in the pit lane" },
  { src: "/gallery/race-06.jpg", alt: "Crowd watching race", caption: "Spectators at NIRMAN 6.0" },
];

export default function GallerySection() {
  const [activeImg, setActiveImg] = useState<GalleryImage | null>(null);

  return (
    <section
      style={{
        marginTop: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "#6c84a0",
              marginBottom: 6,
            }}
          >
            INTO THE ARCHIVE
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: 0,
            }}
          >
            <Camera size={20} color="#00f0ff" />
            Race Gallery
          </h2>
        </div>
        <span
          className="pill"
          style={{ fontSize: 10 }}
        >
          NIRMAN 6.0
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {GALLERY.map((img, i) => (
          <div
            key={i}
            onClick={() => setActiveImg(img)}
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              cursor: "pointer",
              aspectRatio: "16/10",
              background: "rgba(10, 18, 30, 0.9)",
              border: "1px solid rgba(45, 75, 110, 0.4)",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "rgba(0, 240, 255, 0.5)";
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "0 8px 30px rgba(0, 240, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "rgba(45, 75, 110, 0.4)";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            {/* Try to load image; if not found, show placeholder */}
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                // Show placeholder gradient if image is missing
                const parent = (e.currentTarget as HTMLImageElement).parentElement;
                if (parent) {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  parent.style.background = `linear-gradient(135deg, rgba(${
                    [
                      "0, 240, 255",
                      "255, 106, 0",
                      "0, 255, 136",
                      "255, 170, 0",
                      "120, 100, 255",
                      "255, 42, 85",
                    ][i % 6]
                  }, 0.12) 0%, rgba(8, 14, 24, 0.95) 100%)`;
                }
              }}
            />
            {/* Caption overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 12px 10px",
                background: "linear-gradient(to top, rgba(4, 8, 14, 0.95) 0%, transparent 100%)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "#a0b4c8",
                lineHeight: 1.4,
              }}
            >
              {img.caption}
            </div>
            {/* Placeholder icon for missing images */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -60%)",
                pointerEvents: "none",
                opacity: 0.15,
              }}
            >
              <Camera size={32} color="#00f0ff" />
            </div>
          </div>
        ))}
      </div>

      {/* Add photos hint */}
      <div
        style={{
          marginTop: 14,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "#3d556e",
        }}
      >
        Add photos to <code style={{ color: "#00f0ff" }}>public/gallery/</code> to populate the gallery
      </div>

      {/* Lightbox modal */}
      {activeImg && (
        <div
          onClick={() => setActiveImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(2, 5, 10, 0.92)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setActiveImg(null)}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              background: "rgba(10, 20, 32, 0.9)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#00f0ff",
            }}
          >
            <X size={20} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 900,
              width: "100%",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(0, 240, 255, 0.25)",
              boxShadow: "0 0 60px rgba(0, 240, 255, 0.15)",
              cursor: "default",
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                background: "rgba(8, 14, 24, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <img
                src={activeImg.src}
                alt={activeImg.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div style={{ position: "absolute", opacity: 0.1 }}>
                <Camera size={64} color="#00f0ff" />
              </div>
            </div>
            <div
              style={{
                padding: "14px 20px",
                background: "rgba(6, 12, 20, 0.95)",
                borderTop: "1px solid rgba(45, 75, 110, 0.3)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#8da3be",
              }}
            >
              {activeImg.caption}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
