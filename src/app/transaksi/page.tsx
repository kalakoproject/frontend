"use client";

import { useEffect, useState } from "react";
import ClientShell from "@/components/clientShell";
import { useProtectedPage } from "@/lib/hooks";
import { getRetailProducts, createTransaction } from "@/lib/api";

/* ============================================================
 * MAIN TRANSACTION PAGE
 * ============================================================ */

export default function TransaksiPage() {
  const { isReady } = useProtectedPage();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [items, setItems] = useState<
    {
      product_id: number;
      name: string;
      price: number;
      unit: string;
      qty: number;
      discountPercent?: number;
    }[]
  >([]);

  const [showPayModal, setShowPayModal] = useState(false);

  async function searchProducts() {
    if (!search) return setSearchResults([]);

    const res = await getRetailProducts({ search });
    setSearchResults(res.items || []);
  }

  useEffect(() => {
    const t = setTimeout(searchProducts, 300);
    return () => clearTimeout(t);
  }, [search]);

  function addItem(p: any) {
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        name: p.name,
        price: p.selling_price,
        unit: p.unit,
        qty: 1,
        discountPercent: 0,
      },
    ]);
    setSearch("");
    setSearchResults([]);
  }

  function updateQty(index: number, qty: number) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, qty } : it))
    );
  }

  function updateDiscount(index: number, discountPercent: number) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, discountPercent } : it))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = items.reduce((acc, it) => {
    const disc = it.discountPercent ? Number(it.discountPercent) : 0;
    const line =
      it.qty * it.price * (1 - Math.max(0, Math.min(100, disc)) / 100);
    return acc + line;
  }, 0);

  // Tampilkan loading saat check auth
  if (!isReady) {
    return (
      <ClientShell title="Transaksi">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin text-4xl mb-2">⏳</div>
            <p className="text-slate-600">Memverifikasi akses...</p>
          </div>
        </div>
      </ClientShell>
    );
  }

  return (
    <ClientShell title="💳 Transaksi Kasir">
      <div className="space-y-6">
        {/* SEARCH BAR */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-5 border-t-4 border-amber-500">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-3">
            🔍 Cari Produk
          </label>
          <input
            type="text"
            className="border-2 border-slate-300 w-full px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
            placeholder="Ketik nama produk untuk menambahkan ke keranjang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* SEARCH RESULTS */}
          {searchResults.length > 0 && (
            <div className="mt-3 border border-slate-200 rounded-xl bg-white shadow-sm max-h-48 overflow-y-auto">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="px-3 py-4 sm:px-6 cursor-pointer text-sm sm:text-base border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900">{p.name}</span>
                    <span className="text-green-600 font-bold">
                      Rp {Number(p.selling_price).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    Stok: {p.stock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ITEMS TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <th className="text-left py-4 px-3 sm:px-6 font-semibold text-sm first:rounded-tl-xl w-12 border-r border-slate-200">
                    No
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 font-semibold text-sm border-r border-slate-200">
                    Nama Produk
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 font-semibold text-sm w-24 border-r border-slate-200">
                    Qty
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 font-semibold text-sm w-28 border-r border-slate-200">
                    % Diskon
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 font-semibold text-sm border-r border-slate-200">
                    Harga Satuan
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 font-semibold text-sm border-r border-slate-200">
                    Subtotal
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 font-semibold text-sm last:rounded-tr-xl w-28 border-r border-slate-200">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((it, i) => {
                  const disc = it.discountPercent
                    ? Number(it.discountPercent)
                    : 0;
                  const lineSubtotal = Math.round(
                    it.qty *
                      it.price *
                      (1 - Math.max(0, Math.min(100, disc)) / 100)
                  );
                  return (
                    <tr
                      key={i}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-3 sm:px-6 font-medium text-slate-900 text-sm sm:text-base">
                        {i + 1}
                      </td>
                      <td className="py-4 px-3 sm:px-6 font-medium text-slate-900 text-sm sm:text-base">
                        {it.name}
                      </td>

                      <td className="text-center py-3 px-2 sm:px-4">
                        <input
                          type="number"
                          min={0}
                          step={it.unit === "KG" ? "0.01" : "1"}
                          className="w-16 sm:w-20 border-2 border-slate-300 px-2 py-1 rounded-lg text-sm sm:text-base text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                          value={it.qty}
                          onChange={(e) => {
                            // sanitize and prevent negative values
                            const raw = e.target.value;
                            // allow empty then treat as 0
                            const num = raw === "" ? 0 : Number(raw);
                            updateQty(i, Number.isNaN(num) ? 0 : num);
                          }}
                        />
                      </td>

                      <td className="text-center py-3 px-2 sm:px-4">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          className="w-16 sm:w-20 border-2 border-slate-300 px-2 py-1 rounded-lg text-sm sm:text-base text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                          value={disc}
                          onChange={(e) =>
                            updateDiscount(i, Number(e.target.value))
                          }
                        />
                      </td>

                      <td className="text-center py-4 px-3 sm:px-6 text-green-600 font-bold text-sm sm:text-base">
                        Rp{" "}
                        {Number(it.price).toLocaleString("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                        })}
                      </td>

                      <td className="text-center py-4 px-3 sm:px-6 font-bold text-slate-900 text-sm sm:text-base">
                        Rp{" "}
                        {Number(lineSubtotal).toLocaleString("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                        })}
                      </td>

                      <td className="text-center py-3 px-2 sm:px-4">
                        <button
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg transition-all font-bold"
                          onClick={() => removeItem(i)}
                        >
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td
                      className="text-center text-slate-500 py-12 text-sm sm:text-base"
                      colSpan={7}
                    >
                      📭 Belum ada item. Gunakan pencarian di atas untuk
                      menambahkan produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TOTAL */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-t-2 border-blue-200 p-4 flex flex-col sm:flex-row sm:justify-end">
              <div className="text-right w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                  Total Belanja:
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-3">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                <div className="flex gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => {
                      if (!confirm("Batal transaksi dan kosongkan keranjang?"))
                        return;
                      setItems([]);
                    }}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm sm:text-base rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all shadow-md"
                  >
                    ❌ Batal
                  </button>

                  <button
                    onClick={() => setShowPayModal(true)}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-sm sm:text-base rounded-lg hover:from-green-700 hover:to-green-800 hover:shadow-lg transition-all shadow-md"
                  >
                    💳 Proses Pembayaran
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPayModal && (
        <PayModal
          total={total}
          items={items}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => {
            setItems([]);
            setShowPayModal(false);
          }}
        />
      )}
    </ClientShell>
  );
}

/* ============================================================
 * PAYMENT MODAL
 * ============================================================ */

function PayModal({
  total,
  items,
  onClose,
  onSuccess,
}: {
  total: number;
  items: { product_id: number; qty: number }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paid, setPaid] = useState(0);
  const [paidInput, setPaidInput] = useState("");
  const change = paid - total;

  async function handlePay() {
    if (paid < total) return alert("❌ Nominal kurang!");

    try {
      await createTransaction({
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.qty,
        })),
        paid_amount: paid,
      });

      alert("✅ Transaksi berhasil!");
      onSuccess();
    } catch (err: any) {
      alert("❌ " + (err.message || "Transaksi gagal"));
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border-t-4 border-green-600 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
          <h2 className="font-bold text-lg text-white">💳 Proses Pembayaran</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 font-medium">Total Belanja:</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              💵 Nominal Pembayaran
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="border-2 border-slate-300 w-full px-4 py-3 rounded-lg text-lg font-semibold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
              value={paidInput}
              onChange={(e) => {
                const cleaned = String(e.target.value).replace(/[^0-9]/g, "");
                setPaidInput(cleaned);
                setPaid(cleaned ? Number(cleaned) : 0);
              }}
              autoFocus
            />
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 font-medium mb-1">
              Kembalian:
            </p>
            <p
              className={`text-2xl font-bold ${
                change < 0
                  ? "text-red-600"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700"
              }`}
            >
              Rp {Math.max(change, 0).toLocaleString("id-ID")}
            </p>
            {change < 0 && (
              <p className="text-xs text-red-600 font-medium mt-1">
                ⚠️ Nominal pembayaran kurang Rp{" "}
                {Math.abs(change).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-bold border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
            onClick={onClose}
          >
            ❌ Batal
          </button>

          <button
            className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
            disabled={paid < total}
            onClick={handlePay}
          >
            ✅ Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
