"use client";

import { useEffect, useState } from "react";
import ClientShell from "@/components/clientShell";
import { useProtectedPage } from "@/lib/hooks";
import { getProductReport, getMonthlySalesData, exportProductReport, authHeaders } from "@/lib/api";
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

export default function LaporanPage() {
    const { isReady } = useProtectedPage();
    const [range, setRange] = useState<"daily" | "monthly" | "yearly">("monthly");
    const [rows, setRows] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isReady) return;
        fetchData();
    }, [range, isReady]);

    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
            const res: any = await getProductReport({ range, limit: 100 });
            setRows(res.rows || []);

            // Fetch monthly sales chart data
            try {
                const monthlyRes: any = await getMonthlySalesData();
                const data = monthlyRes.chart || [];
                
                // Alternating colors: orange, blue
                const colors = ["rgba(251,146,60,0.9)", "rgba(59,130,246,0.9)"];
                const borderColors = ["rgb(251,146,60)", "rgb(59,130,246)"];
                
                setChartData({
                    labels: data.map((d: any) => d.bulan),
                    datasets: [
                        {
                            label: "Penjualan (Rp)",
                            data: data.map((d: any) => d.total),
                            backgroundColor: data.map((_: any, idx: number) => colors[idx % 2]),
                            borderColor: data.map((_: any, idx: number) => borderColors[idx % 2]),
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (e) {
                console.error("Failed to fetch monthly sales:", e);
                setChartData(null);
            }
        } catch (e: any) {
            console.error("Error fetching report:", e);
            setError(e.message || "Gagal memuat laporan. Pastikan backend sudah running di port 4000.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    function handleExport(format: "pdf" | "excel") {
        const url = exportProductReport(range, format);
        const headers = authHeaders();
        fetch(url, { headers })
            .then((r) => {
                if (!r.ok) throw new Error("Export failed");
                return r.blob();
            })
            .then((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `laporan_${range}.${format === "pdf" ? "pdf" : "xlsx"}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);
            })
            .catch((e) => console.error(e));
    }

    const totalJumlah = rows.reduce((s, r) => s + (r.jumlah || 0), 0);
    const totalPendapatan = rows.reduce((s, r) => s + (r.total_pendapatan || 0), 0);

    if (!isReady) {
        return (
            <ClientShell title="Laporan Penjualan">
                <div className="flex items-center justify-center h-48">Memverifikasi akses...</div>
            </ClientShell>
        );
    }

    if (error) {
        return (
            <ClientShell title="🧾 Laporan Penjualan">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">⚠️ Terjadi Error</p>
                    <p>{error}</p>
                    <button onClick={() => fetchData()} className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Coba Lagi</button>
                </div>
            </ClientShell>
        );
    }

    return (
        <ClientShell title="🧾 Laporan Penjualan">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setRange("daily")}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${range === "daily"
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-400"
                                }`}
                        >
                            📅 Harian
                        </button>
                        <button
                            onClick={() => setRange("monthly")}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${range === "monthly"
                                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-green-400"
                                }`}
                        >
                            📆 Bulanan
                        </button>
                        <button
                            onClick={() => setRange("yearly")}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${range === "yearly"
                                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-400"
                                }`}
                        >
                            📊 Tahunan
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br bg-white rounded-xl shadow-lg p-6 text-black text-center hover:shadow-xl transition-all">
                        <p className="text-sm font-medium opacity-90">Total Jumlah</p>
                        <p className="text-2xl font-bold mt-3">{totalJumlah}</p>
                    </div>

                    <div className="bg-gradient-to-br bg-white rounded-xl shadow-lg p-6 text-black text-center hover:shadow-xl transition-all">
                        <p className="text-sm font-medium opacity-90">Total Pendapatan</p>
                        <p className="text-2xl font-bold mt-3">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPendapatan)}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-center text-black">
                        <div className="bg-gradient-to-br bg-white rounded-xl shadow-lg p-6 text-black text-center hover:shadow-xl transition-all">
                            <p className="text-sm font-medium">Export Excel/PDF</p>
                            <button onClick={() => handleExport("pdf")} className="px-1 mx-1 py-2 rounded-lg bg-red-500 text-white font-normal hover:bg-red-600 transition-all">Export to PDF</button>
                            <button onClick={() => handleExport("excel")} className="px-1 mx-1 py-2 rounded-lg bg-green-600 text-white font-normal hover:bg-green-700 transition-all">Export to Excel</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">📋 Top Produk</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="py-2 w-12">No</th>
                                        <th className="py-2">Nama Produk</th>
                                        <th className="py-2 w-28">Jumlah</th>
                                        <th className="py-2 w-36">Total Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="py-6 text-center">Memuat...</td></tr>
                                    ) : rows.length === 0 ? (
                                        <tr><td colSpan={4} className="py-6 text-center">Tidak ada data</td></tr>
                                    ) : (
                                        rows.map((r, idx) => (
                                            <tr key={r.id} className="border-b hover:bg-slate-50">
                                                <td className="py-3">{idx + 1}.</td>
                                                <td className="py-3">{r.name}</td>
                                                <td className="py-3">{r.jumlah}</td>
                                                <td className="py-3">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.total_pendapatan)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500 hover:shadow-xl transition-shadow">
                        <h4 className="text-lg font-bold mb-6 text-slate-900">📊 Pejualan Bulanan</h4>
                        {loading ? (
                            <div className="flex items-center justify-center h-56">Memuat chart...</div>
                        ) : chartData ? (
                            <div className="h-56">
                                <Bar
                                    data={chartData}
                                    options={{
                                        indexAxis: "y" as const,
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                ticks: { callback: (val: any) => `Rp ${(val / 1000).toLocaleString('id-ID')}K` },
                                            },
                                            y: {
                                                ticks: {
                                                    autoSkip: false,
                                                    maxRotation: 0,
                                                    font: { size: 12, weight: "bold" as any },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-56"><p className="text-slate-500">Tidak ada data chart</p></div>
                        )}
                    </div>
                </div>
            </div>
        </ClientShell>
    );
}
