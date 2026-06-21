// Single source of truth for all branding values. The real site name, logo,
// and colors are not finalized yet — update this file (and public/logo.svg)
// when they are, instead of editing components directly.

export const branding = {
  siteName: "Builder Portal",
  tagline: "Your plot documents, secured in one place.",
  logoPath: "/logo.svg",
  contact: {
    email: "info@example.com",
    phone: "+92 300 0000000",
  },
  colors: {
    primary: "#1e3a5f",
    primaryForeground: "#ffffff",
    accent: "#c8a04d",
    accentForeground: "#1a1a1a",
    // Supporting palette for decorative variety (homepage accents, category
    // badges) — distinct from primary/accent, which stay the two official
    // brand colors. Exposed as Tailwind tokens (bg-palette-blue, etc.) via
    // app/globals.css, so nothing downstream hardcodes these hex values.
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
