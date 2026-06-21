"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  href: string;
  label: string;
}

export function PortalHeader({
  title,
  navLinks,
}: {
  title: string;
  navLinks: NavLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-6">
        <span className="truncate font-semibold">{title}</span>
        <nav className="hidden gap-4 text-sm text-muted-foreground sm:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open navigation menu" />}
          >
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="sm:hidden">
            {navLinks.map((link) => (
              <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
