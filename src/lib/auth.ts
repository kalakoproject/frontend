/**
 * Auth utilities untuk check token dan validasi
 */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  
  // Set ke cookie juga untuk middleware
  // Cookie harus share ke semua subdomain .kalako.local
  const hostname = window.location.hostname;
  
  // Tentukan domain untuk cookie
  let cookieDomain = "";
  if (hostname.includes("kalako.local")) {
    // Set domain ke .kalako.local agar accessible di semua subdomain
    // kalako.local, toko-maju.kalako.local, dll
    cookieDomain = ".kalako.local";
  } else if (hostname === "localhost" || hostname.startsWith("localhost:")) {
    // Untuk localhost, jangan set domain (same-origin only)
    cookieDomain = "";
  }
  
  const expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 hari
  
  const domainPart = cookieDomain ? `; domain=${cookieDomain}` : "";
  const cookieString = `token=${token}; path=/${domainPart}; expires=${expiresDate.toUTCString()}`;
  document.cookie = cookieString;
  
  console.log("[AUTH] Token saved to localStorage and cookie");
  console.log("[AUTH] Cookie domain:", cookieDomain || "none (same-origin)");
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  
  // Clear cookie dengan domain yang sama
  const hostname = window.location.hostname;
  let cookieDomain = "";
  
  if (hostname.includes("kalako.local")) {
    cookieDomain = ".kalako.local";
  }
  
  const domainPart = cookieDomain ? `; domain=${cookieDomain}` : "";
  document.cookie = `token=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to parse JWT:", err);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function getUserFromToken(): any {
  const token = getToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    removeToken();
    return null;
  }
  return parseJwt(token);
}
