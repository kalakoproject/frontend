// removed unused import
/* ============================================================
 *  BASE URL HELPER UNTUK MULTI-TENANT
 * ============================================================ */

/**
 * BASE URL backend multi-tenant
 * 
 * CLIENT (browser):
 *   http://{subdomain}:4000
 *
 * SERVER (SSR):
 *   memakai NEXT_PUBLIC_API_BASE
 */
export function getApiBase() {
  // === CLIENT SIDE ===
  if (typeof window !== "undefined") {
    const host = window.location.hostname.split(":")[0];
    return `http://${host}:4000`;
  }

  // === SERVER SIDE ===
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
}

/* ============================================================
 *  AUTH HEADERS
 * ============================================================ */

// ⬅️ DI SINI PERBAIKAN PENTING: tipe return dibuat Record<string, string>
export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Try to parse response as JSON, otherwise return raw text under __rawText */
async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return { __rawText: text };
  }
}

async function extractErrorMessage(res: Response, fallback = "Error") {
  const body = await parseJsonSafe(res).catch(() => ({ __rawText: "" }));
  if (body && typeof body === "object") {
    if (body.message) return String(body.message);
    if (body.error) return String(body.error);
    if (body.__rawText) return body.__rawText;
  }
  return res.statusText || fallback;
}

/* ============================================================
 *  GENERIC GET / POST / PUT / DELETE
 * ============================================================ */

export async function apiGet(url: string) {
  const base = getApiBase();
  const res = await fetch(`${base}${url}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "GET error");
    throw new Error(msg);
  }

  return parseJsonSafe(res);
}

export async function apiPost(url: string, body: any) {
  const base = getApiBase();
  const res = await fetch(`${base}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "POST error");
    throw new Error(msg);
  }

  return parseJsonSafe(res);
}

export async function apiPut(url: string, body: any) {
  const base = getApiBase();
  const res = await fetch(`${base}${url}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "PUT error");
    throw new Error(msg);
  }

  return parseJsonSafe(res);
}

export async function apiDelete(url: string) {
  const base = getApiBase();
  const res = await fetch(`${base}${url}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "DELETE error");
    throw new Error(msg);
  }

  return parseJsonSafe(res);
}

/* ============================================================
 *  AUTH APIs — OTP / SIGNUP CLIENT / LOGIN
 * ============================================================ */

/** Kirim OTP ke email */
export async function sendOtpEmail(email: string) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/auth/send-otp-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal mengirim OTP");
    throw new Error(msg || "Gagal mengirim OTP");
  }

  return true;
}

/** Signup client dengan OTP */
export async function signupClientWithOtp(payload: {
  store_name: string;
  owner_name: string;
  owner_id_number?: string;
  address?: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  otp: string;
  city?: string;
  district?: string;
  sub_district?: string;
  province?: string;
  store_photo_url?: string;
}) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/auth/client/signup-with-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal mendaftar client");
    throw new Error(msg || "Gagal mendaftar client");
  }

  return parseJsonSafe(res);
}

/** Login tenant user */
export async function login(payload: { username: string; password: string }) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Login gagal");
    throw new Error(msg || "Login gagal");
  }

  return parseJsonSafe(res);
}

/* ============================================================
 *  DASHBOARD API (Daily / Monthly / Yearly)
 * ============================================================ */

export async function getClientInfo() {
  const base = getApiBase();

  const res = await fetch(`${base}/api/dashboard/client-info`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal memuat info toko");
    throw new Error(msg || "Gagal memuat info toko");
  }

  return parseJsonSafe(res);
}

export async function getDashboardSummary(
  range: "daily" | "monthly" | "yearly"
) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/dashboard/summary?range=${range}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal memuat dashboard");
    throw new Error(msg || "Gagal memuat dashboard");
  }

  return parseJsonSafe(res);
}

/* ============================================================
 *  RETAIL STOK API
 * ============================================================ */

/** Ambil data stok retail */
export async function getRetailProducts(params: {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: number;
  status?: "banyak" | "menipis" | "habis";
}) {
  const base = getApiBase();

  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", String(params.categoryId));
  if (params.status) query.set("status", params.status);

  const res = await fetch(`${base}/api/retail/products?${query.toString()}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok)
  {
    const msg = await extractErrorMessage(res, "Gagal memuat stok retail");
    throw new Error(msg || "Gagal memuat stok retail");
  }
  return parseJsonSafe(res);
}

/** Tambah produk */
export async function addRetailProduct(payload: {
  name: string;
  selling_price: number;
  unit: string;
  stock?: number;
  category_id?: number;
  expiry_date?: string;
}) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/retail/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!res.ok)
  {
    const msg = await extractErrorMessage(res, "Gagal menambah produk");
    throw new Error(msg || "Gagal menambah produk");
  }

  return parseJsonSafe(res);
}

/** Update produk */
export async function updateRetailProduct(
  id: number,
  payload: {
    name: string;
    selling_price: number;
    unit: string;
    stock: number;
    category_id?: number;
    expiry_date?: string;
  }
) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/retail/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!res.ok)
  {
    const msg = await extractErrorMessage(res, "Gagal update produk");
    throw new Error(msg || "Gagal update produk");
  }

  return parseJsonSafe(res);
}

/** Hapus produk */
export async function deleteRetailProduct(id: number) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/retail/products/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  if (!res.ok)
  {
    const msg = await extractErrorMessage(res, "Gagal menghapus produk");
    throw new Error(msg || "Gagal menghapus produk");
  }

  return parseJsonSafe(res);
}

/* ============================================================
 *  KATEGORI PRODUK
 * ============================================================ */

export async function getRetailCategories() {
  const base = getApiBase();

  const res = await fetch(`${base}/api/retail/categories`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  if (!res.ok)
  {
    const msg = await extractErrorMessage(res, "Gagal memuat kategori");
    throw new Error(msg || "Gagal memuat kategori");
  }

  return parseJsonSafe(res);
}

/** Tambah kategori produk */
export async function addRetailCategory(payload: { name: string }) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/retail/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal menambah kategori");
    throw new Error(msg || "Gagal menambah kategori");
  }

  return parseJsonSafe(res);
}

/* ============================================================
 *  TRANSAKSI KASIR
 * ============================================================ */

export async function createTransaction(payload: {
  items: { product_id: number; quantity: number }[];
  paid_amount: number;
}) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!res.ok)
  {
    const msg = await extractErrorMessage(res, "Gagal membuat transaksi");
    throw new Error(msg || "Gagal membuat transaksi");
  }

  return parseJsonSafe(res);
}

/** Get transaction history */
export async function getTransactionHistory(params: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}) {
  const base = getApiBase();
  const query = new URLSearchParams();
  if (params.limit) query.append("limit", String(params.limit));
  if (params.offset) query.append("offset", String(params.offset));
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);

  const res = await fetch(`${base}/api/transactions?${query}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal fetch history transaksi");
    throw new Error(msg);
  }

  return parseJsonSafe(res);
}

/** Get transaction items detail */
export async function getTransactionItems(transactionId: number) {
  const base = getApiBase();

  const res = await fetch(`${base}/api/transactions/${transactionId}/items`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal fetch detail transaksi");
    throw new Error(msg);
  }

  return parseJsonSafe(res);
}

/* ============================================================
 *  LOGOUT
 * ============================================================ */
export async function logout() {
  const base = getApiBase();

  try {
    await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
    });
  } catch (e) {
    // abaikan error network
  }

  if (typeof window !== "undefined") {
    // Import di sini untuk avoid circular dependency
    const { removeToken } = await import("@/lib/auth");
    removeToken();
    // Gunakan replace agar tidak bisa kembali ke halaman sebelumnya
    window.location.replace("/login");
  }
}

/* ============================================================
 *  REPORTS API
 * ============================================================ */

export async function getProductReport(params: {
  range?: "daily" | "monthly" | "yearly";
  limit?: number;
  offset?: number;
}) {
  const base = getApiBase();
  const q = new URLSearchParams();
  if (params.range) q.set("range", params.range);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));

  const res = await fetch(`${base}/api/reports/products?${q.toString()}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal memuat laporan produk");
    throw new Error(msg || "Gagal memuat laporan produk");
  }

  return parseJsonSafe(res);
}

export function exportProductReport(range: string, format: "pdf" | "excel") {
  const base = getApiBase();
  const url = `${base}/api/reports/products/export?range=${range}&format=${format}`;
  // simply return URL for direct download in browser using authentication via cookie or token
  return url;
}

export async function getMonthlySalesData() {
  const base = getApiBase();

  const res = await fetch(`${base}/api/reports/monthly-sales`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, "Gagal memuat data penjualan bulanan");
    throw new Error(msg || "Gagal memuat data penjualan bulanan");
  }

  return parseJsonSafe(res);
}
