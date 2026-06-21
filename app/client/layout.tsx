import { PortalHeader } from "@/components/portal-header";

const NAV_LINKS = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/documents", label: "Documents" },
  { href: "/client/profile", label: "Profile" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <PortalHeader navLinks={NAV_LINKS} homeHref="/client/dashboard" />
      {children}
    </div>
  );
}
