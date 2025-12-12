"use client";

import { useEffect, useState } from "react";
import ClientShell from "@/components/clientShell";
import { getDashboardSummary, getTransactionHistory } from "@/lib/api";
import { useProtectedPage } from "@/lib/hooks";
import Link from "next/link";
import Image from "next/image";
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
        setRecentTx(tx.transactions || tx.items || []);
      } catch (e) {
        console.error("Failed load recent transactions", e);
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
        backgroundColor: "rgba(59, 130, 246, 0.85)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false, // biar ngikut tinggi container
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#64748b", font: { size: 11 } },
        grid: { color: "#e2e8f0" },
      },
      x: {
        ticks: { color: "#64748b", font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // Tampilkan loading saat check auth
  if (!isReady) {
    return (
      <ClientShell title="📊 Dashboard">
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
      {/* WRAPPER FULL LAYAR UNTUK DASHBOARD */}
      <div className="min-h-screen py-1 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Range Selector (centered, equal segments) */}
          <div className="flex justify-center">
            <div className="w-[460px] sm:w-[560px] inline-flex items-center bg-slate-200 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setRange("daily")}
                className={`flex-1 text-center px-6 py-2 text-sm font-semibold transition-all duration-150 rounded-full focus:outline-none ${
                  range === "daily"
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Hari ini
              </button>
              <button
                onClick={() => setRange("monthly")}
                className={`flex-1 text-center px-6 py-2 text-sm font-semibold transition-all duration-150 rounded-full focus:outline-none ${
                  range === "monthly"
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Bulan
              </button>
              <button
                onClick={() => setRange("yearly")}
                className={`flex-1 text-center px-6 py-2 text-sm font-semibold transition-all duration-150 rounded-full focus:outline-none ${
                  range === "yearly"
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Tahun
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Stok"
              value={summary?.totalStock ?? 0}
              iconPath="/icons/box.svg"
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Total Terjual"
              value={summary?.totalSold ?? 0}
              iconPath="/icons/card.svg"
              color="from-green-500 to-green-600"
            />
            <StatCard
              title="Total Customer"
              value={summary?.totalCustomers ?? 0}
              iconPath="/icons/history.svg"
              color="from-amber-500 to-amber-600"
            />
            <StatCard
              title="Pemasukan"
              value={`Rp ${Number(summary?.incomeTotal || 0).toLocaleString(
                "id-ID"
              )}`}
              iconPath="/icons/report.svg"
              color="from-purple-500 to-purple-600"
            />
          </div>

          {/* Chart + Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow h-80 sm:h-96">
              <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
                <Image
                  src="/icons/report.svg"
                  alt="grafik"
                  width={18}
                  height={18}
                  unoptimized
                />
                <span>Grafik Pemasukan</span>
              </h3>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 font-medium">
                    ⏳ Memuat data grafik...
                  </p>
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Image
                    src="/icons/history.svg"
                    alt="histori"
                    width={16}
                    height={16}
                    unoptimized
                  />
                  <span>Riwayat Transaksi Terbaru</span>
                </h4>
                <Link
                  href="/transaksi/histori"
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-2">
                {recentTx.length === 0 ? (
                  <p className="text-xs text-slate-500">Belum ada transaksi</p>
                ) : (
                  recentTx.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-md hover:bg-slate-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            #{t.id} — Rp{" "}
                            {Number(t.total_amount).toLocaleString("id-ID")}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t.item_count} item •{" "}
                            {new Date(t.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600">
                          {t.cashier_name || "—"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientShell>
  );
}

/* COMPONENT: STAT CARD */
function StatCard({
  title,
  value,
  iconPath,
  icon,
  color,
}: {
  title: string;
  value: any;
  iconPath?: string;
  icon?: string;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
        <div className="w-16 h-16 rounded-lg flex items-center justify-center">
          {iconPath ? (
            <Image
              src={iconPath}
              alt={title}
              width={36}
              height={36}
              className="object-contain filter brightness-0 invert"
              unoptimized
            />
          ) : (
            <span className="text-3xl">{icon}</span>
          )}
        </div>
      </div>
    </div>
  );
}
