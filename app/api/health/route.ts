import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pinged by an external cron service to keep the Supabase free-tier project
// from auto-pausing after 7 days of inactivity. Not covered by proxy.ts's
// matcher (/admin, /client only), so it's reachable without a session —
// the shared secret below is the only gate.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const providedKey = request.headers.get("x-health-check-key");

  if (!providedKey || providedKey !== process.env.HEALTH_CHECK_SECRET) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Database health check failed" },
      { status: 500 }
    );
  }
}
