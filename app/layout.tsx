import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { branding } from "@/lib/branding";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: {
    default: branding.siteName,
    template: `%s · ${branding.shortName}`,
  },
  description: branding.tagline,
  icons: { icon: branding.logoPath },
};

// Brand source colors are defined once in lib/branding.ts and injected here as
// CSS variables. app/globals.css derives every theme token (primary, ring,
// sidebar, gold, gradients) from these, so a single edit to branding.ts
// re-skins the entire app in both light and dark themes.
const brandStyle = {
  "--brand": branding.colors.primary,
  "--brand-strong": branding.colors.primaryStrong,
  "--brand-foreground": branding.colors.primaryForeground,
  "--gold": branding.colors.accent,
  "--gold-light": branding.colors.goldLight,
  "--gold-foreground": branding.colors.accentForeground,
  "--palette-blue": branding.colors.palette.blue,
  "--palette-emerald": branding.colors.palette.emerald,
  "--palette-violet": branding.colors.palette.violet,
  "--palette-amber": branding.colors.palette.amber,
  "--palette-rose": branding.colors.palette.rose,
  "--palette-slate": branding.colors.palette.slate,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={brandStyle}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
