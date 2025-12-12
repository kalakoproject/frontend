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
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white shadow flex flex-col p-4 md:fixed md:left-0 md:top-0 md:h-screen md:overflow-y-auto">
        {/* Store Photo */}
        <div className="mb-4 flex items-center gap-3">
          <Image
            src={storePhoto || "/kalako_logo.png"}
            alt={storeName}
            width={100}
            height={100}
            className="rounded-md object-cover shadow-md"
            unoptimized
          />
        </div>

        <div className="mb-4 text-[#181616]">
          <h1 className="text-2xl font-bold capitalize tracking-tight">
            {storeName}
          </h1>
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Main Menu
        </p>
        <nav className="flex flex-col gap-3 text-sm flex-1">
          <Link
            href="/dashboard"
            className={`px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/dashboard") ? "bg-[#EBEEF0]" : "hover:bg-[#EBEEF0]"
            }`}
          >
            <Image
              src="/icons/dashboard.svg"
              alt="dashboard"
              width={18}
              height={18}
              unoptimized
            />
            <span className="ml-2">Dashboard</span>
          </Link>

          <Link
            href="/stok-retail"
            className={`px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/stok-retail") ? "bg-[#EBEEF0]" : "hover:bg-[#EBEEF0]"
            }`}
          >
            <Image
              src="/icons/box.svg"
              alt="stok"
              width={18}
              height={18}
              unoptimized
            />
            <span className="ml-2">Stok Retail</span>
          </Link>

          <Link
            href="/transaksi"
            className={`px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/transaksi", true)
                ? "bg-[#EBEEF0]"
                : "hover:bg-[#EBEEF0]"
            }`}
          >
            <Image
              src="/icons/card.svg"
              alt="transaksi"
              width={18}
              height={18}
              unoptimized
            />
            <span className="ml-2">Transaksi Kasir</span>
          </Link>

          <Link
            href="/transaksi/histori"
            className={`px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/transaksi/histori")
                ? "bg-[#EBEEF0]"
                : "hover:bg-[#EBEEF0]"
            }`}
          >
            <Image
              src="/icons/history.svg"
              alt="histori"
              width={18}
              height={18}
              unoptimized
            />
            <span className="ml-2">Histori Transaksi</span>
          </Link>

          <Link
            href="/laporan"
            className={`px-4 py-3 rounded-lg text-[#181616] font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/laporan") ? "bg-[#EBEEF0]" : "hover:bg-[#EBEEF0]"
            }`}
          >
            <Image
              src="/icons/report.svg"
              alt="laporan"
              width={18}
              height={18}
              unoptimized
            />
            <span className="ml-2">Laporan Keuangan</span>
          </Link>
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="mt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all duration-200"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">
          {title}
        </h2>
        {children}
      </main>
    </div>
  );
}
