import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pinged daily by Vercel Cron (see vercel.json) to keep the Supabase
// free-tier project from auto-pausing after 7 days of inactivity. Also
// reachable by an external cron service using the legacy header, if ever
// needed. Not covered by proxy.ts's matcher (/admin, /client only), so it's
// reachable without a session — one of the two secrets below is required.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const legacyKey = request.headers.get("x-health-check-key");
  const cronAuth = request.headers.get("authorization");

  const isLegacyAuthorized =
    legacyKey !== null && legacyKey === process.env.HEALTH_CHECK_SECRET;
  const isCronAuthorized =
    cronAuth !== null &&
    process.env.CRON_SECRET !== undefined &&
    cronAuth === `Bearer ${process.env.CRON_SECRET}`;

  if (!isLegacyAuthorized && !isCronAuthorized) {
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
