import Link from "next/link";
import { MotionConfig } from "motion/react";
import { Mail, Phone, MapPin } from "lucide-react";
import { branding } from "@/lib/branding";
import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import NavLink from "@/components/home/nav-link";
import HeroSection from "@/components/home/hero-section";
import AboutSection from "@/components/home/about-section";
import FeaturesSection from "@/components/home/features-section";
import LocationSection from "@/components/home/location-section";
import ContactSection from "@/components/home/contact-section";

const SECTION_LINKS = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Why Choose Us" },
  { href: "#location", label: "Location" },
  { href: "#contact", label: "Contact" },
];

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="h-0.5 w-full bg-gold-gradient" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/">
            <BrandLogo size={36} />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {SECTION_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "gold", size: "sm" })}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <HeroSection />
        <section id="about">
          <AboutSection />
        </section>
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="location">
          <LocationSection />
        </section>
        <section id="contact">
          <ContactSection />
        </section>
      </main>

      <footer className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="h-0.5 w-full bg-gold-gradient" />
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <BrandLogo size={40} variant="onBrand" />
            <p className="max-w-xs text-sm text-primary-foreground/70">
              {branding.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gold-light">Quick Links</h3>
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gold-light">Portal</h3>
            <Link
              href="/login"
              className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              Client Login
            </Link>
            <Link
              href="/signup"
              className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              Sign Up
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gold-light">Contact</h3>
            <a
              href={`mailto:${branding.contact.email}`}
              className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <Mail className="size-4 shrink-0 text-gold-light" />
              {branding.contact.email}
            </a>
            <a
              href={`tel:${branding.contact.phone}`}
              className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <Phone className="size-4 shrink-0 text-gold-light" />
              {branding.contact.phone}
            </a>
            <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="size-4 shrink-0 text-gold-light" />
              {branding.contact.address}
            </span>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-primary-foreground/60">
            &copy; {new Date().getFullYear()} {branding.siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
