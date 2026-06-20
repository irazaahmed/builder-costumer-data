import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed Middleware to Proxy (same mechanics, new file name —
// see node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
// This only does optimistic, cookie-based checks per CLAUDE.md's
// access-control-rules skill — every server action and page still does its
// own session/role/status check against the database.
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isClientRoute = nextUrl.pathname.startsWith("/client");

  if (!isLoggedIn) {
    if (isAdminRoute || isClientRoute) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  const { role, status } = session.user;

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/client/dashboard", nextUrl));
  }

  if (isClientRoute) {
    if (role !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    // PENDING/BLOCKED clients may only see /client/dashboard, which renders
    // the verification/blocked screen instead of real document data.
    if (status !== "ACTIVE" && nextUrl.pathname !== "/client/dashboard") {
      return NextResponse.redirect(new URL("/client/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
};
