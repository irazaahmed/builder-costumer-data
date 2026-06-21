import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileLock2, BadgeCheck } from "lucide-react";
import { branding } from "@/lib/branding";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const POINTS = [
  { icon: ShieldCheck, text: "Private vault — documents only ever shared via short-lived signed links." },
  { icon: BadgeCheck, text: "Verified ownership — each account is matched to its plot by the admin." },
  { icon: FileLock2, text: "View and download your own allotment, legal, and payment records." },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      {/* Brand panel — hidden on small screens */}
      <aside className="relative hidden overflow-hidden bg-brand-gradient p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-72 rounded-full bg-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-10 size-72 rounded-full bg-black/20 blur-3xl"
        />
        <Link href="/" className="relative w-fit">
          <BrandLogo size={40} variant="onBrand" />
        </Link>
        <div className="relative flex flex-col gap-6">
          <h2 className="font-heading text-3xl font-bold leading-tight">
            Secure access to your{" "}
            <span className="text-gold-light">property documents</span>
          </h2>
          <ul className="flex flex-col gap-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold-light">
                  <p.icon className="size-5" />
                </span>
                <span className="text-sm text-primary-foreground/85">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          17-acre project · Surjani Sector 12, Karachi · 360 plots
        </p>
      </aside>

      {/* Form area */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-12">
          <Link href="/" className="lg:hidden">
            <BrandLogo size={40} />
          </Link>
          {children}
          <p className="max-w-sm text-center text-xs text-muted-foreground">
            {branding.siteName}
          </p>
        </div>
      </div>
    </main>
  );
}
