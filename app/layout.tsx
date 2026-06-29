import type { Metadata } from "next";
import { Press_Start_2P, DotGothic16 } from "next/font/google";
import "./globals.css";
import ScanlineMask from "@/components/layout/ScanlineMask";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const dotGothic16 = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dot-gothic",
});

export const metadata: Metadata = {
  title: "Gesture Spell - AI Hand Tracking Game Platform",
  description: "Play games using only your hands. No extra hardware needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} ${dotGothic16.variable} antialiased min-h-screen relative`}
      >
        <ScanlineMask />
        {children}
      </body>
    </html>
  );
}
