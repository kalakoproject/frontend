"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ClientShell({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    const router = useRouter();

    const [storeName, setStoreName] = useState("");

    useEffect(() => {
        const host = window.location.hostname.split(".")[0];
        setStoreName(host.replace("-", " "));
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col md:flex-row">
            {/* SIDEBAR */}
            <aside className="w-full md:w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl flex flex-col p-4 md:min-h-screen">
                <div className="mb-8 text-white">
                    <h1 className="text-2xl font-bold capitalize tracking-tight">{storeName}</h1>
                    <p className="text-xs text-slate-300 -mt-1 font-medium">Dashboard Toko</p>
                </div>

                <nav className="flex flex-col gap-3 text-sm flex-1">
                    <Link
                        href="/dashboard"
                        className="px-4 py-3 rounded-lg text-white font-medium hover:bg-blue-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        📊 Dashboard
                    </Link>

                    <Link
                        href="/stok-retail"
                        className="px-4 py-3 rounded-lg text-white font-medium hover:bg-green-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        📦 Stok Retail
                    </Link>

                    <Link
                        href="/transaksi"
                        className="px-4 py-3 rounded-lg text-white font-medium hover:bg-amber-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        💳 Transaksi Kasir
                    </Link>

                    <Link
                        href="/transaksi/histori"
                        className="px-4 py-3 rounded-lg text-white font-medium hover:bg-purple-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        📜 Histori Transaksi
                    </Link>
                </nav>

                <div className="pt-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold hover:from-red-700 hover:to-red-800 hover:shadow-lg transition-all duration-200"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">{title}</h2>
                {children}
            </main>
        </div>
    );
}
