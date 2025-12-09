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
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  // Clear cookie
  document.cookie = "token=; path=/; max-age=0";
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
