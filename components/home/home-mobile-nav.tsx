"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SectionLink {
  href: string;
  label: string;
}

// Mobile-only hamburger for the public homepage's section links (About,
// Gallery, …) plus the Login/Sign Up entries. The desktop header keeps its
// inline nav; this fills the gap where, below `lg`, those section links had no
// way to be reached on a phone.
//
// Visibility is driven by a JS matchMedia check rather than a `lg:hidden`
// utility, because the `*:hidden` responsive variants don't compile reliably
// in this project's Turbopack build (same reason PortalHeader does it this way).
export default function HomeMobileNav({ links }: { links: SectionLink[] }) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return (
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
          {links.map((link) => (
            <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
              {link.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/login" />}>
            <ShieldCheck />
            Login
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/signup" />}>
            <UserPlus />
            Sign Up
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
