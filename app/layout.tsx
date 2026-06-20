import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { branding } from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: branding.siteName,
  description: branding.tagline,
};

// Brand colors are defined once in lib/branding.ts and applied here as CSS
// variables, so the entire theme (via Tailwind tokens like bg-primary)
// updates from a single edit once the real branding is finalized.
const brandStyle = {
  "--primary": branding.colors.primary,
  "--primary-foreground": branding.colors.primaryForeground,
  "--brand-accent": branding.colors.accent,
  "--brand-accent-foreground": branding.colors.accentForeground,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={brandStyle}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
