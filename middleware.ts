import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths yang bisa diakses tanpa login
const PUBLIC_PATHS = ["/login", "/register"];

// Protected paths yang memerlukan login
const PROTECTED_PATHS = [
  "/dashboard",
  "/stok-retail",
  "/transaksi",
  "/profile",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Debug log
  console.log(`[MIDDLEWARE] PATH: ${pathname} | TOKEN: ${token ? "✓ ADA" : "✗ KOSONG"}`);

  // Cek apakah path adalah public path
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Cek apakah path adalah protected path
  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // ============================================================
  // RULE 1: Jika sudah login dan coba akses /login → redirect ke /dashboard
  // ============================================================
  if (token && isPublicPath && pathname === "/login") {
    console.log(`[MIDDLEWARE] Redirect: User sudah login, redirect dari /login → /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ============================================================
  // RULE 2: Jika belum login dan coba akses protected path → redirect ke /login
  // ============================================================
  if (!token && isProtectedPath) {
    console.log(`[MIDDLEWARE] Redirect: User belum login, redirect dari ${pathname} → /login`);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ============================================================
  // RULE 3: Jika belum login dan coba akses root path "/" → redirect ke /login
  // ============================================================
  if (!token && pathname === "/") {
    console.log(`[MIDDLEWARE] Redirect: User belum login, redirect dari / → /login`);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ============================================================
  // RULE 4: Jika sudah login dan coba akses root path "/" → redirect ke /dashboard
  // ============================================================
  if (token && pathname === "/") {
    console.log(`[MIDDLEWARE] Redirect: User sudah login, redirect dari / → /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Izinkan akses
  return NextResponse.next();
}

// Matcher untuk route yang perlu di-check
export const config = {
  matcher: [
    // Protect semua path kecuali file static dan next internals
    "/((?!_next|api|favicon.ico|public|assets).*)",
  ],
};

