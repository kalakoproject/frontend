"use client";

import { FormEvent, useState } from "react";
import { sendOtpEmail, signupClientWithOtp } from "@/lib/api";
import ImageUploader from "@/components/imageUploader";


export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [storePhotoUrl, setStorePhotoUrl] = useState("");


    async function handleSendOtp() {
        setError(null);
        setSuccess(null);

        if (!email) {
            setError("Email wajib diisi");
            return;
        }

        try {
            setSendingOtp(true);
            await sendOtpEmail(email);
            setOtpSent(true);
            setSuccess("OTP telah dikirim ke email anda.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSendingOtp(false);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);

        try {
            const resp = await signupClientWithOtp({
                store_name: String(fd.get("store_name") || ""),
                owner_name: String(fd.get("owner_name") || ""),
                owner_id_number: String(fd.get("owner_id_number") || ""),
                address: String(fd.get("address") || ""),
                phone: String(fd.get("phone") || ""),
                email: String(fd.get("email") || ""),
                username: String(fd.get("username") || ""),
                password: String(fd.get("password") || ""),
                otp: String(fd.get("otp") || ""),
                city: String(fd.get("city") || ""),
                district: String(fd.get("district") || ""),
                sub_district: String(fd.get("sub_district") || ""),
                province: String(fd.get("province") || ""),
                store_photo_url: String(fd.get("store_photo_url") || ""),
            });

            setSuccess("Pendaftaran berhasil, mengalihkan ke halaman login toko...");

            // redirect ke subdomain
            const subdomain = resp.client.subdomain;
            window.location.href = `http://${subdomain}.kalako.local:3000/login`;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left side text */}
                    <div className="hidden lg:flex flex-col justify-center text-white">
                        <div className="text-5xl mb-4">🏪</div>
                        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Daftar Toko KALAKO
                        </h1>
                        <p className="text-lg text-blue-100 mb-6">
                            Mulai mengelola bisnis retail Anda dengan sistem ERP terintegrasi yang mudah dan powerful.
                        </p>
                        <ul className="space-y-3 text-base text-blue-100">
                            <li className="flex items-center gap-3"><span className="text-2xl">✅</span> Satu akun untuk banyak cabang</li>
                            <li className="flex items-center gap-3"><span className="text-2xl">⚙️</span> Atur user dan role sendiri</li>
                            <li className="flex items-center gap-3"><span className="text-2xl">📊</span> Dashboard realtime untuk pemilik</li>
                            <li className="flex items-center gap-3"><span className="text-2xl">💰</span> Kelola stok dan penjualan dengan mudah</li>
                        </ul>
                    </div>

                    {/* Form card */}
                    <div className="bg-white shadow-2xl rounded-xl border-t-4 border-blue-600 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
                            <h2 className="text-2xl font-bold text-white">📝 Buat Akun Toko</h2>
                            <p className="text-blue-100 text-sm mt-1">Lengkapi data di bawah untuk memulai</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                                    <span>❌</span>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 rounded-lg bg-green-50 border-2 border-green-200 px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2">
                                    <span>✅</span>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            👤 Nama Pemilik / PIC
                                        </label>
                                        <input
                                            name="owner_name"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Nama lengkap"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            🏪 Nama Toko / Brand
                                        </label>
                                        <input
                                            name="store_name"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Contoh: Toko Maju Sejahtera"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email + OTP */}
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            📧 Email
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                                placeholder="email@example.com"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={!email || sendingOtp}
                                                className="px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
                                            >
                                                {sendingOtp ? "⏳ Mengirim..." : otpSent ? "🔄 Kirim Ulang" : "📨 Kirim OTP"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            📱 Nomor Whatsapp
                                        </label>
                                        <input
                                            name="phone"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="62812xxxxxxxx"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            🔐 Username Login
                                        </label>
                                        <input
                                            name="username"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="username unik"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            🔑 Password
                                        </label>
                                        <input
                                            name="password"
                                            type="password"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Minimal 6 karakter"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            🔐 Kode OTP
                                        </label>
                                        <input
                                            name="otp"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="6 digit dari email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        🪪 Nomor KTP (opsional)
                                    </label>
                                    <input
                                        name="owner_id_number"
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                        placeholder="NIK pemilik"
                                    />
                                </div>

                                {/* Alamat & lokasi */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        📍 Alamat Lengkap
                                    </label>
                                    <textarea
                                        name="address"
                                        rows={2}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                        placeholder="Jalan, RT/RW, No, dsb."
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            🏙️ Kota / Kabupaten
                                        </label>
                                        <input
                                            name="city"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Jakarta"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            🗺️ Provinsi
                                        </label>
                                        <input
                                            name="province"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="DKI Jakarta"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            📌 Kecamatan
                                        </label>
                                        <input
                                            name="district"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Senayan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            📍 Kelurahan / Desa
                                        </label>
                                        <input
                                            name="sub_district"
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Gelora"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-3">
                                        📸 Foto Toko (opsional)
                                    </label>
                                    <ImageUploader onUploaded={(url) => setStorePhotoUrl(url)} />
                                    <input type="hidden" name="store_photo_url" value={storePhotoUrl} />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed shadow-md"
                                >
                                    {loading ? "⏳ Mendaftar..." : "✅ Daftar Sekarang"}
                                </button>

                                <p className="text-xs text-center text-slate-600 mt-4">
                                    Sudah punya akun?{" "}
                                    <a
                                        href="http://kalako.local:3000/login"
                                        className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 hover:underline"
                                    >
                                        Masuk di sini
                                    </a>
                                </p>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 px-6 py-4 text-center">
                            <p className="text-xs text-slate-600">
                                © 2025 KALAKO - Sistem ERP Retail Terpercaya
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
