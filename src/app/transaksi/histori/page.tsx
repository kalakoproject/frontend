"use client";

import { useEffect, useState } from "react";
import ClientShell from "@/components/clientShell";
import { useProtectedPage } from "@/lib/hooks";
import { getTransactionHistory, getTransactionItems } from "@/lib/api";

interface Transaction {
  id: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  created_at: string;
  cashier_name: string;
  item_count: number;
}

interface TransactionItem {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  unit: string;
}

export default function HistoriTransaksiPage() {
  const { isReady } = useProtectedPage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<TransactionItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const limit = 10;

  async function loadTransactions() {
    setLoading(true);
    try {
      const res = await getTransactionHistory({
        limit,
        offset: currentPage * limit,
        search,
      });
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCurrentPage(0);
  }, [search]);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, search]);

  async function handleViewDetail(transactionId: number) {
    if (selectedTransaction === transactionId) {
      setSelectedTransaction(null);
      setSelectedItems([]);
      return;
    }

    setSelectedTransaction(transactionId);
    setItemsLoading(true);
    try {
      const res = await getTransactionItems(transactionId);
      setSelectedItems(res.items || []);
    } catch (err: any) {
      console.error("Error loading items:", err);
    } finally {
      setItemsLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  // Tampilkan loading saat check auth
  if (!isReady) {
    return (
      <ClientShell title="Histori Transaksi">
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
    <ClientShell title="📜 Histori Transaksi">
      <div className="w-full">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari No. Transaksi atau Kasir..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border-2 border-amber-300 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              />
              <span className="absolute right-3 sm:right-4 top-2.5 sm:top-3 text-amber-600">🔍</span>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-600">
          {/* Table Header */}
          <div className="hidden md:grid bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 grid-cols-6 gap-4 text-white font-bold text-sm">
            <div>🔢 ID</div>
            <div>👤 Kasir</div>
            <div className="text-right">💰 Total</div>
            <div className="text-right">📦 Items</div>
            <div>📅 Waktu</div>
            <div className="text-center">⚙️</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500">
              ⏳ Memuat data...
            </div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              ❌ Tidak ada transaksi
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {transactions.map((tx) => (
                <div key={tx.id}>
                  {/* Desktop Row */}
                  <div
                    onClick={() => handleViewDetail(tx.id)}
                    className="hidden md:grid px-6 py-4 grid-cols-6 gap-4 items-center hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="font-mono font-bold text-blue-600">
                      #{tx.id}
                    </div>
                    <div className="text-slate-700">
                      {tx.cashier_name || "Unknown"}
                    </div>
                    <div className="text-right font-bold text-slate-900">
                      Rp {Number(tx.total_amount).toLocaleString("id-ID")}
                    </div>
                    <div className="text-right text-slate-600">
                      {tx.item_count} item
                    </div>
                    <div className="text-sm text-slate-600">
                      {new Date(tx.created_at).toLocaleString("id-ID")}
                    </div>
                    <div className="text-center">
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                        {selectedTransaction === tx.id ? "▼" : "▶"}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div
                    onClick={() => handleViewDetail(tx.id)}
                    className="md:hidden px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono font-bold text-blue-600 text-lg">
                            #{tx.id}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            {tx.cashier_name || "Unknown"}
                          </div>
                        </div>
                        <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                          {selectedTransaction === tx.id ? "▼" : "▶"}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
                          <div className="text-xs text-blue-600 font-bold">Total</div>
                          <div className="font-bold text-slate-900">
                            Rp {Number(tx.total_amount).toLocaleString("id-ID", {
                              notation: "compact",
                              compactDisplay: "short"
                            })}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
                          <div className="text-xs text-green-600 font-bold">Items</div>
                          <div className="font-bold text-slate-900">{tx.item_count}</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 border border-amber-200">
                          <div className="text-xs text-amber-600 font-bold">Waktu</div>
                          <div className="font-bold text-xs text-slate-900">
                            {new Date(tx.created_at).toLocaleDateString("id-ID")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Rows - Items */}
                  {selectedTransaction === tx.id && (
                    <div className="bg-blue-50 px-6 py-4 border-t-2 border-blue-200">
                      {itemsLoading ? (
                        <div className="text-center text-slate-600 py-4">
                          ⏳ Memuat detail...
                        </div>
                      ) : selectedItems.length === 0 ? (
                        <div className="text-center text-slate-600 py-4">
                          ❌ Tidak ada item
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="font-bold text-slate-900 mb-3 text-sm">
                            📦 Detail Item Transaksi
                          </div>
                          {selectedItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-lg p-2 sm:p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-xs sm:text-sm"
                            >
                              <div className="text-slate-700 font-medium col-span-2 sm:col-span-1 break-words">
                                {item.product_name}
                              </div>
                              <div className="text-right text-slate-600">
                                {item.quantity} {item.unit}
                              </div>
                              <div className="hidden sm:block text-right text-slate-600">
                                @ Rp{" "}
                                {Number(item.unit_price).toLocaleString(
                                  "id-ID", {notation: 'compact', compactDisplay: 'short'}
                                )}
                              </div>
                              <div className="text-right font-bold text-slate-900">
                                Rp{" "}
                                {Number(item.subtotal).toLocaleString(
                                  "id-ID"
                                )}
                              </div>
                              <div></div>
                            </div>
                          ))}

                          {/* Summary */}
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3 mt-4 grid grid-cols-5 gap-3 border-2 border-blue-300">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div className="text-right font-bold text-slate-900">
                              Subtotal:
                            </div>
                            <div className="text-right font-bold text-blue-600">
                              Rp{" "}
                              {Number(tx.total_amount).toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                            <div className="bg-green-50 rounded-lg p-2 sm:p-3 border-2 border-green-200">
                              <div className="text-xs text-green-600 font-bold">
                                💳 DIBAYAR
                              </div>
                              <div className="text-sm sm:text-lg font-bold text-green-700">
                                Rp{" "}
                                {Number(tx.paid_amount).toLocaleString(
                                  "id-ID", {notation: 'compact', compactDisplay: 'short'}
                                )}
                              </div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-2 sm:p-3 border-2 border-yellow-200">
                              <div className="text-xs text-yellow-600 font-bold">
                                🔄 KEMBALIAN
                              </div>
                              <div className="text-lg font-bold text-yellow-700">
                                Rp{" "}
                                {Number(tx.change_amount).toLocaleString(
                                  "id-ID"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-slate-600 text-center md:text-left">
              Menampilkan {currentPage * limit + 1} -{" "}
              {Math.min((currentPage + 1) * limit, total)} dari {total} transaksi
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-end">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
              >
                ◀ Sebelumnya
              </button>
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }).map((_, i) => {
                  // Tampilkan hanya page buttons yang visible di mobile
                  if (totalPages > 5 && Math.abs(i - currentPage) > 1 && i !== 0 && i !== totalPages - 1) {
                    return null;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-sm transition-all ${
                        currentPage === i
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
              >
                Selanjutnya ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientShell>
  );
}
