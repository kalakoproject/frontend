"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout, getClientInfo, getApiBase } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ClientShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [storeName, setStoreName] = useState("");
  const [storePhoto, setStorePhoto] = useState<string | null>(null);
  // when true the sidebar is collapsed to a narrow bar showing only the hamburger
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const host = window.location.hostname.split(".")[0];
    setStoreName(host.replace("-", " "));

    // Get store photo from database via API
    getClientInfo()
      .then((data) => {
        if (data && data.store_photo_url) {
          // Construct full URL with backend base URL
          const fullUrl = `${getApiBase()}${data.store_photo_url}`;
          setStorePhoto(fullUrl);
        }
      })
      .catch((err) => {
        console.error("Failed to load client info:", err);
      });
  }, []);

  async function handleLogout() {
    if (confirm("Keluar dari akun?")) {
      try {
        await logout();
      } catch (err) {
        console.error("Logout error:", err);
        // fallback redirect
        window.location.href = "/login";
      }
    }
  }

  function isActive(href: string, exact = false) {
    try {
      if (!pathname) return false;
      const normalize = (s: string) =>
        s.endsWith("/") && s.length > 1 ? s.slice(0, -1) : s;
      const p = normalize(pathname);
      const h = normalize(href);
      if (exact) return p === h;
      return p === h || p.startsWith(h + "/");
    } catch {
      return false;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col md:flex-row">
      {/* NAVBAR MOBILE / SIDEBAR DESKTOP */}
      <aside className={`
        bg-white shadow transition-all
        ${sidebarCollapsed 
          ? 'fixed top-0 left-0 right-0 h-16 w-full z-50 md:relative md:w-16 md:h-screen md:flex-col md:p-4 md:overflow-y-auto' 
          : 'fixed top-0 left-0 h-screen w-[65%] max-w-[280px] z-50 md:relative md:w-64 md:h-screen md:p-4 md:overflow-y-auto'
        }
        flex flex-col
      `}>
        {/* hamburger toggle (top center) - shown only when collapsed */}
        {sidebarCollapsed && (
          <div className="flex items-center justify-between px-4 md:flex-col md:gap-4 h-16 md:h-auto">
            <div className="hidden md:flex md:justify-center">
              <button
                aria-label="Open sidebar"
                className="p-2 rounded-md hover:bg-slate-100"
                onClick={() => setSidebarCollapsed(false)}
              >
                <span className="block w-6 h-[2px] bg-slate-800 mb-1" />
                <span className="block w-6 h-[2px] bg-slate-800 mb-1" />
                <span className="block w-6 h-[2px] bg-slate-800" />
              </button>
            </div>
            <button
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-slate-100 md:hidden"
              onClick={() => setSidebarCollapsed(false)}
            >
              <span className="block w-6 h-[2px] bg-slate-800 mb-1" />
              <span className="block w-6 h-[2px] bg-slate-800 mb-1" />
              <span className="block w-6 h-[2px] bg-slate-800" />
            </button>
          </div>
        )}

        {/* full content (hidden when collapsed) */}
        {!sidebarCollapsed && (
          <div className="flex flex-col h-full p-4 md:p-0">
            {/* close button (top-right) - visible when expanded */}
            <div className="flex justify-between items-center mb-4 md:mb-0 md:absolute md:right-3 md:top-3">
              <h1 className="text-lg font-bold capitalize md:hidden">
                {storeName}
              </h1>
              <button
                aria-label="Tutup menu"
                className="p-2 rounded-md hover:bg-slate-100"
                onClick={() => setSidebarCollapsed(true)}
              >
                ✕
              </button>
            </div>
            {/* Store Photo */}
            <div className="mb-4 hidden md:flex items-center gap-3">
              <Image
                src={storePhoto || "/kalako_logo.png"}
                alt={storeName}
                width={100}
                height={100}
                className="rounded-md object-cover shadow-md"
                unoptimized
              />
            </div>

            {/* Store name - only desktop */}
            <div className="mb-2 text-[#181616] hidden md:block">
              <h1 className="text-2xl font-bold capitalize tracking-tight">
                {storeName}
              </h1>
            </div>

            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 hidden md:block">
              Main Menu
            </p>

          <nav className="flex flex-col gap-2 text-sm flex-1 md:mt-0 mt-6">
          <Link
            href="/dashboard"
            className={`w-full px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-3 ${
              isActive("/dashboard") ? "bg-[#EBEEF0]" : "hover:bg-[#EBEEF0]"
            }`}
            onClick={() => setSidebarCollapsed(true)}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/dashboard.svg"
                alt="dashboard"
                width={18}
                height={18}
                unoptimized
              />
            </div>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/stok-retail"
            className={`w-full px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-3 ${
              isActive("/stok-retail") ? "bg-[#EBEEF0]" : "hover:bg-[#EBEEF0]"
            }`}
            onClick={() => setSidebarCollapsed(true)}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/box.svg"
                alt="stok"
                width={18}
                height={18}
                unoptimized
              />
            </div>
            <span>Stok Retail</span>
          </Link>

          <Link
            href="/transaksi"
            className={`w-full px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-3 ${
              isActive("/transaksi", true)
                ? "bg-[#EBEEF0]"
                : "hover:bg-[#EBEEF0]"
            }`}
            onClick={() => setSidebarCollapsed(true)}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/card.svg"
                alt="transaksi"
                width={18}
                height={18}
                unoptimized
              />
            </div>
            <span>Transaksi Kasir</span>
          </Link>

          <Link
            href="/transaksi/histori"
            className={`w-full px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-3 ${
              isActive("/transaksi/histori")
                ? "bg-[#EBEEF0]"
                : "hover:bg-[#EBEEF0]"
            }`}
            onClick={() => setSidebarCollapsed(true)}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/history.svg"
                alt="histori"
                width={18}
                height={18}
                unoptimized
              />
            </div>
            <span>Histori Transaksi</span>
          </Link>

          <Link
            href="/laporan"
            className={`w-full px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-3 ${
              isActive("/laporan") ? "bg-[#EBEEF0]" : "hover:bg-[#EBEEF0]"
            }`}
            onClick={() => setSidebarCollapsed(true)}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/report.svg"
                alt="laporan"
                width={18}
                height={18}
                unoptimized
              />
            </div>
            <span>Laporan Keuangan</span>
          </Link>
          </nav>

            <div className="pt-6 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all duration-200"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-3 sm:p-4 md:p-6 lg:p-8 ${sidebarCollapsed ? 'pt-20 md:pt-6' : 'pt-20 md:pt-6'}`}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">
          {title}
        </h2>
        {children}
      </main>
    </div>
  );
}
