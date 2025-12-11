"use client";

import { useEffect, useState } from "react";
import ClientShell from "@/components/clientShell";
import { getDashboardSummary } from "@/lib/api";
import { useProtectedPage } from "@/lib/hooks";
import { getTransactionHistory } from "@/lib/api";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DashboardPage() {
  const { isReady } = useProtectedPage();
  const [range, setRange] = useState<"daily" | "monthly" | "yearly">("daily");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  useEffect(() => {
    if (!isReady) return;
    loadSummary();
  }, [range, isReady]);

  async function loadSummary() {
    try {
      setLoading(true);
      const data = await getDashboardSummary(range);
      setSummary(data);
      // load recent transactions (5 items)
      try {
        const tx = await getTransactionHistory({ limit: 5, offset: 0 });
        // API returns { transactions, total, ... }
        setRecentTx(tx.transactions || tx.items || []);
      } catch (e) {
        console.error('Failed load recent transactions', e);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  const chartData = {
    labels: summary?.incomeChart?.map((c: any) => c.label) || [],
    datasets: [
      {
        label: "Pemasukan",
        data: summary?.incomeChart?.map((c: any) => c.value) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(244, 63, 94, 0.8)",
          "rgba(20, 184, 166, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(251, 146, 60)",
          "rgb(168, 85, 247)",
          "rgb(244, 63, 94)",
          "rgb(20, 184, 166)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // Tampilkan loading saat check auth
  if (!isReady) {
    return (
      <ClientShell title="Dashboard">
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
    <ClientShell title="📊 Dashboard">
      <div className="space-y-6">
        {/* Range Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setRange("daily")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              range === "daily"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-400"
            }`}
          >
            📅 Harian
          </button>
          <button
            onClick={() => setRange("monthly")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              range === "monthly"
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-green-400"
            }`}
          >
            📆 Bulanan
          </button>
          <button
            onClick={() => setRange("yearly")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              range === "yearly"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-400"
            }`}
          >
            📊 Tahunan
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Stok"
            value={summary?.totalStock ?? 0}
            icon="📦"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Terjual"
            value={summary?.totalSold ?? 0}
            icon="🛍️"
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Total Customer"
            value={summary?.totalCustomers ?? 0}
            icon="👥"
            color="from-amber-500 to-amber-600"
          />
          <StatCard
            title="Pemasukan"
            value={`Rp ${Number(summary?.incomeTotal || 0).toLocaleString("id-ID")}`}
            icon="💰"
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Chart + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">📈 Grafik Pemasukan</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-slate-500 font-medium">⏳ Memuat data grafik...</p>
              </div>
            ) : (
              <Bar data={chartData} options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: true,
                    labels: { font: { size: 12, weight: 'bold' }, padding: 15, color: '#334155' }
                  }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: '#e2e8f0' } },
                  x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } }
                }
              }} />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-amber-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">🧾 Riwayat Transaksi Terbaru</h4>
              <Link href="/transaksi/histori" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
            </div>

            <div className="space-y-2">
              {recentTx.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada transaksi</p>
              ) : (
                recentTx.map((t: any) => (
                  <div key={t.id} className="p-2 rounded-md border border-slate-100 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-slate-900">#{t.id} — Rp {Number(t.total_amount).toLocaleString('id-ID')}</div>
                        <div className="text-xs text-slate-500">{t.item_count} item • {new Date(t.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-slate-600">{t.cashier_name || '—'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientShell>
  );
}

/* COMPONENT: STAT CARD */
function StatCard({ title, value, icon, color }: { title: string; value: any; icon: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-all hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
