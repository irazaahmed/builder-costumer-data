import Link from "next/link";
import { branding } from "@/lib/branding";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/documents", label: "Documents" },
  { href: "/client/profile", label: "Profile" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold">{branding.siteName}</span>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </header>
      {children}
    </div>
  );
}
