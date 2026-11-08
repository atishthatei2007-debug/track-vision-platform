import type { Metadata } from "next";
import Preloader from "@/components/Preloader";
import "./globals.css";
export const metadata: Metadata = {
  title: "Track Vision | Robotics Arena",
  description: "Live robotics competition broadcast, checkpoint timing and leaderboard."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Preloader />{children}</body></html>;
}