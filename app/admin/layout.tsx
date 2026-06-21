import { PortalHeader } from "@/components/portal-header";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/pending", label: "Pending" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/plots", label: "Plots" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <PortalHeader navLinks={NAV_LINKS} homeHref="/admin/dashboard" badge="Admin" />
      {children}
    </div>
  );
}
