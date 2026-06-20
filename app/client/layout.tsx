import { branding } from "@/lib/branding";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">{branding.siteName}</span>
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
