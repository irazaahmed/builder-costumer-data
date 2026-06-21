import Link from "next/link";
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

const CATEGORIES = [
  { value: "LEGAL", label: "Legal" },
  { value: "PAYMENT", label: "Payment" },
  { value: "ALLOTMENT", label: "Allotment" },
  { value: "CNIC", label: "CNIC" },
  { value: "OTHER", label: "Other" },
] as const;

// Mirrors lib/branding.ts's categoryPaletteKey mapping (LEGAL→blue,
// PAYMENT→emerald, ALLOTMENT→violet, CNIC→amber, OTHER→slate). Written out
// literally per-category because Tailwind can't pick up an interpolated
// class name like `border-t-palette-${key}`.
const CATEGORY_TILE_CLASS: Record<(typeof CATEGORIES)[number]["value"], string> = {
  LEGAL: "border-t-4 border-t-palette-blue bg-palette-blue/5 hover:bg-palette-blue/10",
  PAYMENT: "border-t-4 border-t-palette-emerald bg-palette-emerald/5 hover:bg-palette-emerald/10",
  ALLOTMENT: "border-t-4 border-t-palette-violet bg-palette-violet/5 hover:bg-palette-violet/10",
  CNIC: "border-t-4 border-t-palette-amber bg-palette-amber/5 hover:bg-palette-amber/10",
  OTHER: "border-t-4 border-t-palette-slate bg-palette-slate/5 hover:bg-palette-slate/10",
};

const CATEGORY_COUNT_CLASS: Record<(typeof CATEGORIES)[number]["value"], string> = {
  LEGAL: "text-palette-blue",
  PAYMENT: "text-palette-emerald",
  ALLOTMENT: "text-palette-violet",
  CNIC: "text-palette-amber",
  OTHER: "text-palette-slate",
};

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const { status } = session.user;

  if (status === "PENDING") {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Your account is under verification</CardTitle>
            <CardDescription>
              We&apos;ve received your sign-up. The admin will verify your
              CNIC/plot details and link your account shortly — you&apos;ll
              be able to see your documents here once that&apos;s done.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (status === "BLOCKED") {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Account access restricted</CardTitle>
            <CardDescription>
              Your account access has been restricted. Please contact the
              admin office for assistance.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: { plot: true, documents: true },
  });

  if (!client) {
    redirect("/login");
  }

  const countsByCategory = Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat.value,
      client.documents.filter((doc) => doc.category === cat.value).length,
    ])
  );

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {client.fullName}</CardTitle>
          <CardDescription>
            Plot {client.plot.plotNumber}
            {client.plot.block ? ` · Block ${client.plot.block}` : ""}
            {client.plot.size ? ` · ${client.plot.size}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have {client.documents.length} document
            {client.documents.length === 1 ? "" : "s"} on file.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents by category</CardTitle>
          <CardDescription>Tap a category to view those documents.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/client/documents?category=${cat.value}`}
              className={`flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors ${CATEGORY_TILE_CLASS[cat.value]}`}
            >
              <span className={`text-2xl font-semibold ${CATEGORY_COUNT_CLASS[cat.value]}`}>
                {countsByCategory[cat.value]}
              </span>
              <span className="text-xs text-muted-foreground">{cat.label}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
