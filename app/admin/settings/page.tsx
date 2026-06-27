import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { auth } from "@/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={KeyRound}
        title="Settings"
        description="Manage your admin account."
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Enter your current password, then choose a new one. You stay logged
            in on this device after changing it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
