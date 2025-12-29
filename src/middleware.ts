import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getHostname(req: NextRequest) {
  return (req.headers.get("host") || "").split(":")[0];
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ================= STATIC FILE =================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/landingpage") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const host = getHostname(req);
  const isRoot = host === "kalako.local" || host === "localhost";
  const token = req.cookies.get("token")?.value;

  // ================= ROOT DOMAIN =================
  if (isRoot) {
    // Izinkan akses hanya melalui /admin/login pada root domain
    // Render halaman login yang ada melalui rewrite ke /login
    if (pathname === "/admin/login") {
      return NextResponse.rewrite(new URL("/login", req.url));
    }

    if (pathname === "/register" || pathname === "/not") {
      return NextResponse.next();
    }

    // Blok akses langsung ke /login pada root domain
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/not", req.url));
    }

    return NextResponse.redirect(new URL("/not", req.url));
  }

  // ================= SUBDOMAIN =================

  // ❌ SUBDOMAIN TIDAK BOLEH REGISTER
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/not", req.url));
  }

  // 🔴 ROOT PATH SUBDOMAIN → LOGIN
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ BELUM LOGIN → BOLEH KE LOGIN
  if (!token && pathname === "/login") {
    return NextResponse.next();
  }

  // ❌ BELUM LOGIN → BLOK SEMUA HALAMAN LAIN
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ SUDAH LOGIN → JANGAN BALIK KE LOGIN
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
