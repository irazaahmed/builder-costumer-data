import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

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

  const fields = [
    { label: "Full Name", value: client.fullName },
    { label: "Email", value: session.user.email },
    { label: "CNIC", value: client.cnic ?? "—" },
    { label: "Phone", value: client.phone ?? "—" },
    { label: "Plot Number", value: client.plot.plotNumber },
    { label: "Block", value: client.plot.block ?? "—" },
    { label: "Plot Size", value: client.plot.size ?? "—" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={UserRound}
        title="Your Profile"
        description="Read-only details on file. Contact the admin office to update any of this information."
      />

      <Card className="overflow-hidden p-0">
        <div className="relative flex items-center gap-4 bg-brand-gradient p-6 text-primary-foreground">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 size-32 rounded-full bg-gold/20 blur-2xl"
          />
          <span className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-heading text-xl font-bold ring-1 ring-white/25">
            {initials(client.fullName)}
          </span>
          <div className="relative flex flex-col gap-1">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              {client.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-primary-foreground/85">
              <span className="rounded-full bg-black/15 px-3 py-0.5 font-medium">
                Plot {client.plot.plotNumber}
              </span>
              {client.plot.block && (
                <span className="rounded-full bg-black/15 px-3 py-0.5">
                  Block {client.plot.block}
                </span>
              )}
              {client.plot.size && (
                <span className="rounded-full bg-black/15 px-3 py-0.5">
                  {client.plot.size}
                </span>
              )}
            </div>
          </div>
        </div>
        <CardContent className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border bg-muted/30 px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {f.label}
              </p>
              <p className="mt-0.5 text-sm font-medium">{f.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
