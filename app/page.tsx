import Image from "next/image";
import { MotionConfig } from "motion/react";
import { branding } from "@/lib/branding";
import NavLink from "@/components/home/nav-link";
import HeroSection from "@/components/home/hero-section";
import AboutSection from "@/components/home/about-section";
import FeaturesSection from "@/components/home/features-section";
import LocationSection from "@/components/home/location-section";
import ContactSection from "@/components/home/contact-section";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src={branding.logoPath} alt={branding.siteName} width={36} height={36} />
          <span className="font-semibold tracking-tight">{branding.siteName}</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <NavLink href="/login" className="text-muted-foreground hover:text-foreground">
            Client Login
          </NavLink>
          <NavLink href="/signup" className="text-muted-foreground hover:text-foreground">
            Sign Up
          </NavLink>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <LocationSection />
        <ContactSection />
      </main>

      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {branding.siteName}. All rights reserved.
          </span>
          <div className="flex gap-4">
            <NavLink href="/login" className="hover:text-foreground">
              Client Login
            </NavLink>
            <NavLink href="/signup" className="hover:text-foreground">
              Sign Up
            </NavLink>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
