"use client";

import { FormEvent, useEffect, useState } from "react";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const host = window.location.hostname;
    const firstPart = host.split(".")[0];
    setSubdomain(firstPart);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    try {
      const resp = await login({
        username: String(fd.get("username") || ""),
        password: String(fd.get("password") || ""),
      });

      // Simpan token ke localStorage dan cookie
      setToken(resp.token);

      // Redirect ke dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const subtitle =
    subdomain && subdomain !== "kalako"
      ? `Login untuk toko: ${subdomain}`
      : "Login ke tenant ERP anda";

  // ... (UI sama persis dengan yang sudah kamu punya)
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-xl border-t-4 border-blue-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
            <div className="text-4xl mb-2">🏪</div>
            <h1 className="text-3xl font-bold text-white">KALAKO</h1>
            <p className="text-blue-100 text-sm mt-1">Sistem ERP Retail Multi-Cabang</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Masuk</h2>
              <p className="text-sm text-slate-600 mt-1">🔐 {subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                <span>❌</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  👤 Username
                </label>
                <input
                  name="username"
                  className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Masukkan username admin / staff"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  🔑 Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Masukkan password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "⏳ Memproses..." : "✅ Masuk Sekarang"}
              </button>
            </form>

            <p className="text-sm text-center text-slate-600 mt-6">
              Belum punya akun toko?{" "}
              <a
                href="http://kalako.local:3000/register"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 hover:underline"
              >
                Daftar di sini
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 px-6 py-4 text-center">
            <p className="text-xs text-slate-600">
              © 2025 KALAKO - Sistem ERP Retail Terpercaya
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
