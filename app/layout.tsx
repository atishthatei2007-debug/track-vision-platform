import type { Metadata } from "next";
import LenisProvider from "@/components/LenisProvider";
import Preloader from "@/components/Preloader";
import TechkritiCursor from "@/components/TechkritiCursor";
import CyberParticlesCanvas from "@/components/CyberParticlesCanvas";
import "./globals.css";

export const metadata: Metadata = {
  title: "Track Vision | NIRMAN 6.0 — Line Follower Robotics Competition",
  description:
    "Track Vision is the official live competition portal for NIRMAN 6.0 — 4-gate ESP32 laser timing, real-time leaderboard, YouTube broadcast, and sub-millisecond precision.",
  applicationName: "Track Vision",
  keywords: [
    "NIRMAN 6.0",
    "Line Follower",
    "Robotics Competition",
    "Track Vision",
    "ESP32",
    "Laser Timing",
    "Leaderboard",
    "Live Race",
  ],
  authors: [{ name: "NIRMAN Robotics Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Track Vision | NIRMAN 6.0 Line Follower Robotics",
    description:
      "Live competition portal with 4-gate ESP32 optical laser tracking, real-time leaderboard, and YouTube broadcast.",
    url: "https://trackvision.vercel.app",
    siteName: "Track Vision",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Vision | NIRMAN 6.0 Line Follower Robotics",
    description:
      "Live competition portal with 4-gate ESP32 optical laser tracking and real-time leaderboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TechkritiCursor />
        <CyberParticlesCanvas />
        <LenisProvider>
          <Preloader />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
