const API_BASE ="https://api.goldenhiveholidays.in/api"; 

export const BACKEND_API_BASE = API_BASE;

export const authCookieName = "gh_token";

export function extractToken(payload) {
  if (!payload) return null;
  // Try a few common shapes:
  // - { data: "TOKEN" }
  // - { data: { token: "TOKEN" } }
  // - { token: "TOKEN" }
  const token =
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.token ||
    payload?.accessToken ||
    (typeof payload?.data === "string" ? payload.data : null);
  return typeof token === "string" && token.length > 0 ? token : null;
}

