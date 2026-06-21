import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  if (session.user.status !== "ACTIVE" || !session.user.clientId) {
    redirect("/client/dashboard");
  }

  const client = await prisma.client.findUnique({
    where: { id: session.user.clientId },
    include: { plot: true },
  });

  if (!client) {
    redirect("/client/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-sm text-muted-foreground">
          Read-only details on file. Contact the admin office to update any of
          this information.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{client.fullName}</CardTitle>
          <CardDescription>
            Plot {client.plot.plotNumber}
            {client.plot.block ? ` · Block ${client.plot.block}` : ""}
            {client.plot.size ? ` · ${client.plot.size}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="text-sm">{client.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm">{session.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CNIC</p>
            <p className="text-sm">{client.cnic ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm">{client.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plot Number</p>
            <p className="text-sm">{client.plot.plotNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Block</p>
            <p className="text-sm">{client.plot.block ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plot Size</p>
            <p className="text-sm">{client.plot.size ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
