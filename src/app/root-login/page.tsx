"use client";

import { useState } from "react";
import { setToken } from "@/lib/auth";

export default function RootLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://api.portorey.my.id/api/root-login/root-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Login gagal" }));
        setError(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Simpan token (localStorage + cookie) dulu di root domain
      setToken(data.token);

      // Redirect ke subdomain dengan fallback token di URL
      const targetUrl = `https://${data.subdomain}.portorey.my.id/login?auto_token=${encodeURIComponent(
        data.token
      )}`;
      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Kalako</h1>
          <p className="text-gray-600 mt-2">Login ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2 text-sm text-gray-600">
          <p>
            Belum punya akun?{" "}
            <a href="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
              Daftar sekarang
            </a>
          </p>
          <p>
            <a href="/forgot-password" className="text-purple-600 hover:text-purple-700 font-semibold">
              Lupa password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
