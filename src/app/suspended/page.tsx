"use client";

import React, { useState } from "react";
import ImageUploader from "@/components/imageUploader";
import { submitPayment, getApiBase } from "@/lib/api";

export default function SuspendedPage() {
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !proofUrl) {
      alert("Isi jumlah dan unggah bukti pembayaran");
      return;
    }

    try {
      setLoading(true);
      await submitPayment({ amount: Number(amount), note, proof_url: proofUrl });
      alert("Pembayaran dikirim. Menunggu approval super admin.");
      setAmount('');
      setNote('');
      setProofUrl(null);
    } catch (err: any) {
      alert(err.message || "Gagal mengirim pembayaran");
    } finally {
      setLoading(false);
    }
  }

  // If tenant is already active/trial (approved), redirect accordingly:
  React.useEffect(() => {
    (async () => {
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/tenant/status`, { cache: 'no-store' });
        if (!res.ok) return;
        const info = await res.json();
        const status = (info.status || '').toLowerCase();
        if (status === 'active' || status === 'trial') {
          // If user has a token (logged in) go to dashboard, otherwise to login
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          window.location.href = token ? '/dashboard' : '/login';
        }
      } catch (err) {
        // ignore — keep showing suspended page
        console.debug('suspended status check failed', err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Akun Anda Ditangguhkan</h1>
        <p className="text-sm text-slate-600 mb-4">
          Layanan untuk subdomain ini ditangguhkan karena tagihan belum dibayar. Untuk mengaktifkan kembali, silakan unggah bukti pembayaran di bawah.
        </p>

        <div className="mb-6 border rounded p-4 bg-slate-50">
          <h2 className="font-medium mb-2">Instruksi Pembayaran</h2>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
            <li>Transfer sesuai tagihan ke rekening yang tersedia.</li>
            <li>Simpan bukti transfer (foto/scan).</li>
            <li>Unggah bukti di bawah dan masukkan jumlah serta catatan.</li>
            <li>Tim admin akan meninjau dan mengaktifkan kembali jika valid.</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full rounded border px-3 py-2"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Catatan (opsional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Unggah Bukti Pembayaran</label>
            <div className="mt-2">
              <ImageUploader onUploaded={(url) => setProofUrl(url)} />
            </div>
            {proofUrl && <div className="mt-2 text-sm text-slate-600">Preview: <a className="text-blue-600" href={proofUrl} target="_blank" rel="noreferrer">lihat</a></div>}
          </div>

          <div className="flex items-center gap-3">
            <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
              {loading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
            </button>
            <a href="/" className="text-sm text-slate-600">Kembali ke beranda</a>
          </div>
        </form>
      </div>
    </div>
  );
}
