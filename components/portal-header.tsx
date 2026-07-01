"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  href: string;
  label: string;
}

export function PortalHeader({
  navLinks,
  homeHref,
  badge,
}: {
  navLinks: NavLink[];
  homeHref: string;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);
  // Mirrors the `md` breakpoint (768px) in JS. `md:hidden` doesn't reliably
  // compile in this project's Turbopack dev build (md:flex/md:block do), so
  // the mobile-only hamburger's visibility is driven here instead of relying
  // on that specific Tailwind utility.
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      {/* gold hairline */}
      <div className="h-0.5 w-full bg-gold-gradient" />
      <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 shrink items-center">
          <Link href={homeHref} className="flex min-w-0 items-center gap-2">
            <BrandLogo size={32} />
            {badge && (
              <span className="hidden shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold sm:inline">
                {badge}
              </span>
            )}
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <form action={logoutAction} className="hidden md:block">
            <Button type="submit" variant="outline" size="sm">
              <LogOut />
              Log out
            </Button>
          </form>
          <div style={{ display: isDesktop ? "none" : "block" }}>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <Menu />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.href}
                    render={<Link href={link.href} />}
                    className={cn(isActive(link.href) && "text-primary")}
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <button
                      type="button"
                      onClick={() => logoutAction()}
                      className="w-full"
                    />
                  }
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
