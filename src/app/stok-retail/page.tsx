"use client";

import { useEffect, useState } from "react";
import ClientShell from "@/components/clientShell";
import { useProtectedPage } from "@/lib/hooks";
import {
  getRetailProducts,
  getRetailCategories,
  addRetailCategory,
  addRetailProduct,
  updateRetailProduct,
  deleteRetailProduct,
} from "@/lib/api";
import CategoryFormModal from "@/components/categoryForm";

/* ============================================================
 * MAIN PAGE
 * ============================================================ */

export default function RetailStockPage() {
  const { isReady, user } = useProtectedPage();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [storePhoto, setStorePhoto] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  async function loadData() {
    try {
      const [prod, cats] = await Promise.all([
        getRetailProducts({ search, categoryId }),
        getRetailCategories(),
      ]);

      // backend kirim { items, total, ... }
      setProducts(prod.items || []);
      setCategories(cats || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  }

  useEffect(() => {
    if (!isReady || !user) return;
    // Load client info with store photo
    const clientInfo = user.client || {};
    setStoreName(clientInfo.name || "");
    setStorePhoto(clientInfo.store_photo_url || null);
    loadData();
  }, [search, categoryId, isReady, user]);

  // Tampilkan loading saat check auth
  if (!isReady) {
    return (
      <ClientShell title="Stok Retail">
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
    <ClientShell title="📦 Stok Retail">
      <div className="space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Kelola Stok Produk</h3>
            <p className="text-xs sm:text-sm text-slate-500">Tambah, edit, atau hapus produk di toko Anda</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="🔍 Cari produk..."
              className="border-2 border-slate-300 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 flex-1"
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border-2 border-slate-300 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              onChange={(e) =>
                setCategoryId(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">📂 Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all shadow-md w-full sm:w-auto"
            >
              ➕ Tambah Produk
            </button>

            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all shadow-md w-full sm:w-auto"
            >
              🏷️ Tambah Kategori
            </button>
          </div>
        </div>

        {/* PRODUCT TABLE */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <th className="text-left py-3 px-2 sm:px-4 font-bold">📦 Nama Produk</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-bold">📏 Satuan</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-bold">💵 Harga</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-bold">📊 Stok</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-bold hidden lg:table-cell">📅 Kadaluarsa</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-bold">🏷️ Status</th>
                  <th className="text-center py-3 px-2 sm:px-4 font-bold">⚙️ Aksi</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-2 sm:px-4 font-medium text-slate-900 text-xs sm:text-sm">{p.name}</td>
                    <td className="text-center py-3 px-2 sm:px-4 text-slate-600 text-xs sm:text-sm">{p.unit}</td>
                    <td className="text-center py-3 px-2 sm:px-4 font-bold text-green-600 text-xs sm:text-sm">
                      {(Number(p.selling_price) || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="text-center py-3 px-2 sm:px-4 font-bold text-slate-900 text-xs sm:text-sm">{Number(p.stock).toFixed(4).replace(/\.?0+$/, '')}</td>
                    <td className="text-center py-3 px-2 sm:px-4 text-slate-600 hidden lg:table-cell text-xs sm:text-sm">
                      {p.expiry_date
                        ? new Date(p.expiry_date).toLocaleDateString("id-ID")
                        : "—"}
                    </td>
                    <td className="text-center py-3 px-2 sm:px-4">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <StockStatusBadge stock={p.stock} expiry={p.expiry_date} />
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 sm:px-4">
                      <div className="flex gap-1 justify-center flex-wrap">
                        <button
                          className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all"
                          onClick={() => setEditProduct(p)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all"
                          onClick={() => handleDelete(p.id, loadData)}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 font-medium">
                      📭 Tidak ada produk ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <ProductFormModal
          title="Tambah Produk"
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            await addRetailProduct(data);
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {showAddCategoryModal && (
        <CategoryFormModal
          onClose={() => setShowAddCategoryModal(false)}
          onSubmit={async (data) => {
            await addRetailCategory(data);
            setShowAddCategoryModal(false);
            loadData();
          }}
        />
      )}

      {/* MODAL EDIT */}
      {editProduct && (
        <ProductFormModal
          title="Edit Produk"
          initial={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSubmit={async (data) => {
            await updateRetailProduct(editProduct.id, data);
            setEditProduct(null);
            loadData();
          }}
        />
      )}
    </ClientShell>
  );
}

/* ============================================================
 * STOCK STATUS BADGE
 * ============================================================ */

function StockStatusBadge({
  stock,
  expiry,
}: {
  stock: number;
  expiry?: string | null;
}) {
  // Status Kadalauwarsa (sebelah kiri)
  let expiryBadge = null;
  const isExpired = expiry && new Date(expiry).getTime() < Date.now();
  if (isExpired) {
    expiryBadge = (
      <span className="inline-block px-2 py-1 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
        ❌ Kadalauwarsa
      </span>
    );
  } else {
    const isExpiredSoon =
      expiry &&
      new Date(expiry).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
    if (isExpiredSoon) {
      expiryBadge = (
        <span className="inline-block px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
          ⚠️ Mau Kadalauwarsa
        </span>
      );
    }
  }

  // Status Stok (sebelah kanan)
  let stockBadge = null;
  if (stock === 0) {
    stockBadge = (
      <span className="inline-block px-2 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
        🚫 Stok Habis
      </span>
    );
  } else if (stock < 10) {
    stockBadge = (
      <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
        📉 Stok Sedikit
      </span>
    );
  } else {
    stockBadge = (
      <span className="inline-block px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
        ✅ Stok Ada
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {expiryBadge}
      {stockBadge}
    </div>
  );
}

/* ============================================================
 * DELETE HANDLER
 * ============================================================ */

async function handleDelete(id: number, refresh: () => void) {
  if (!confirm("Hapus produk ini?")) return;
  await deleteRetailProduct(id);
  refresh();
}

/* ============================================================
 * PRODUCT FORM MODAL (TAMBAH / EDIT)
 * ============================================================ */

function ProductFormModal({
  title,
  initial,
  categories,
  onClose,
  onSubmit,
}: {
  title: string;
  initial?: any;
  categories?: any[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    selling_price: initial?.selling_price?.toString() || "",
    unit: initial?.unit || "PCS",
    stock: initial?.stock?.toString() || "",
    category_id: initial?.category_id?.toString() || "",
    expiry_date: initial?.expiry_date
      ? String(initial.expiry_date).split("T")[0]
      : "",
  });

  const [saving, setSaving] = useState(false);

  function update(key: string, val: any) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    if (!form.name || !form.selling_price) {
      alert("Nama dan harga wajib diisi");
      return;
    }

    const payload = {
      name: form.name,
      selling_price: Number(form.selling_price) || 0,
      unit: form.unit,
      stock: form.stock ? Number(form.stock) : 0,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      expiry_date: form.expiry_date || undefined,
    };

    try {
      setSaving(true);
      await onSubmit(payload);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border-t-4 border-blue-600 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">📦 Nama Produk</label>
            <input
              type="text"
              className="border-2 border-slate-300 w-full px-3 py-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">💵 Harga Jual</label>
            <input
              type="number"
              className="border-2 border-slate-300 w-full px-3 py-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              value={form.selling_price}
              onChange={(e) => update("selling_price", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">📏 Satuan</label>
              <select
                className="border-2 border-slate-300 w-full px-3 py-2 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
              >
                <option value="PCS">PCS</option>
                <option value="KG">KG</option>
                <option value="L">Liter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">📊 Stok</label>
              <input
                type="number"
                step={form.unit === "KG" ? "0.01" : "1"}
                className="border-2 border-slate-300 w-full px-3 py-2 rounded-lg text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">📂 Kategori</label>
            <select
              className="border-2 border-slate-300 w-full px-3 py-2 rounded-lg text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">📅 Tanggal Kadaluarsa</label>
            <input
              type="date"
              className="border-2 border-slate-300 w-full px-3 py-2 rounded-lg text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
              value={form.expiry_date}
              onChange={(e) => update("expiry_date", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-bold border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
            onClick={onClose}
          >
            ❌ Batal
          </button>

          <button
            type="button"
            className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all disabled:from-slate-400 disabled:to-slate-500"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "⏳ Menyimpan..." : "💾 Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}