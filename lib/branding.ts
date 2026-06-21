// Single source of truth for all branding values. Change the brand here (and
// public/logo.svg) and the entire app re-skins from this one file — no
// find-and-replace across components. Colors are exposed as CSS variables on
// <html> in app/layout.tsx and consumed via Tailwind theme tokens.

export const branding = {
  siteName: "Lodhi Brothers Housing Society",
  // Compact form for tight spaces (navbars, mobile, favicons).
  shortName: "Lodhi Brothers",
  tagline: "Your plot documents, secured in one place.",
  logoPath: "/logo.svg",
  contact: {
    email: "info@lodhibrothers.com",
    phone: "+92 300 0000000",
    address: "Surjani Sector 12, Karachi, Pakistan",
  },
  colors: {
    // Two official brand colors: deep emerald (land, trust, growth) and gold
    // (premium real-estate accent). These drive the whole theme.
    primary: "#0F5132",
    primaryStrong: "#157347",
    primaryForeground: "#ffffff",
    accent: "#c8a04d",
    accentForeground: "#1a1a1a",
    goldLight: "#e3c77b",
    // Supporting palette for decorative variety (homepage accents, category
    // badges) — distinct from primary/accent. Exposed as Tailwind tokens
    // (bg-palette-blue, etc.) via app/globals.css, so nothing downstream
    // hardcodes these hex values.
    palette: {
      blue: "#2563eb",
      emerald: "#16a34a",
      violet: "#7c3aed",
      amber: "#d97706",
      rose: "#e11d48",
      slate: "#64748b",
    },
  },
} as const;

// Maps each DocumentCategory to a palette color. Centralized here so the
// same category always reads as the same color everywhere it appears
// (admin tables, client document list, dashboard widgets).
export const categoryPaletteKey = {
  LEGAL: "blue",
  PAYMENT: "emerald",
  ALLOTMENT: "violet",
  CNIC: "amber",
  OTHER: "slate",
} as const;
