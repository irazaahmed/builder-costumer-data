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
  },
} as const;
