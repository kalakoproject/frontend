import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Ambil hostname tanpa port
 */
function getHostname(req: NextRequest) {
  return (req.headers.get("host") || "").split(":")[0];
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const host = getHostname(req);

  // Token tenant
  const token = req.cookies.get("token")?.value;

  // Token admin (root domain)
  const adminToken =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  // ================= STATIC FILE =================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/landingpage")
  ) {
    return NextResponse.next();
  }

  // ================= DOMAIN DETECTION =================
  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "portorey.my.id";

  const isRootDomain =
    host === BASE_DOMAIN ||
    host === `www.${BASE_DOMAIN}` ||
    host === "localhost";

  const isSubdomain =
    host.endsWith(`.${BASE_DOMAIN}`) && !isRootDomain;

  // ================= ROOT DOMAIN =================
  if (isRootDomain) {
    // 🔐 ADMIN AREA (ROOT ONLY)
    if (pathname.startsWith("/admin")) {
      if (!pathname.startsWith("/admin/login") && !adminToken) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      if (pathname === "/admin/login" && adminToken) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      return NextResponse.next();
    }

    // 🔁 ROOT DOMAIN: /login → /register
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/register", req.url));
    }

    // ✅ ROOT ONLY PAGES
    if (pathname === "/" || pathname === "/register" || pathname === "/not") {
      return NextResponse.next();
    }

    // ❌ BLOK SEMUA TENANT PAGE DI ROOT
    return NextResponse.redirect(new URL("/not", req.url));
  }

  // ================= SUBDOMAIN (TENANT) =================
  if (isSubdomain) {
    const subdomain = host.replace(`.${BASE_DOMAIN}`, "");

    // 🚫 SUBDOMAIN TIDAK BOLEH AKSES REGISTER
    if (pathname.startsWith("/register")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    /**
     * 🚫 SUBDOMAIN TIDAK BOLEH AKSES ROOT "/"
     */
    if (pathname === "/") {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    /**
     * 🌐 HALAMAN BEBAS (TANPA LOGIN)
     */
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/suspended") ||
      pathname.startsWith("/payments") ||
      pathname.startsWith("/api")
    ) {
      return NextResponse.next();
    }

    /**
     * 🔐 AUTH CHECK (TENANT)
     */
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    /**
     * 🔄 SUDAH LOGIN TIDAK BOLEH KE LOGIN
     */
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    /**
     * 🛑 CEK STATUS SUSPEND KE BACKEND
     */
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || `https://api.${BASE_DOMAIN}`;

    return fetch(`${apiBase}/api/tenant/status`, {
      headers: {
        "X-Tenant": subdomain,
      },
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) return NextResponse.next();

        const info = await res.json();
        const status = (info.status || "").toLowerCase();

        let suspended = false;

        if (status === "suspended") suspended = true;
        else if (status === "active" || status === "trial") suspended = false;
        else if (info.trial_ends_at) {
          const ends = Date.parse(info.trial_ends_at);
          if (!isNaN(ends) && ends < Date.now()) suspended = true;
        }

        if (suspended) {
          if (
            pathname.startsWith("/suspended") ||
            pathname.startsWith("/payments")
          ) {
            return NextResponse.next();
          }
          return NextResponse.redirect(new URL("/suspended", req.url));
        }

        return NextResponse.next();
      })
      .catch(() => NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
