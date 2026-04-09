import { cookies } from "next/headers";
import { BACKEND_API_BASE, authCookieName } from "@/lib/backend";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(authCookieName)?.value || null;
}

async function fetchWithToken(path, options = {}) {
  const token = await getAuthToken();

  if (!token) {
    return { ok: false, status: 401, data: null, error: "Not authenticated" };
  }

  const response = await fetch(`${BACKEND_API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

export async function getMyNotifications({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return fetchWithToken(`/notifications/my?${params.toString()}`, {
    method: "GET",
  });
}

export async function getUnreadNotificationsCount() {
  return fetchWithToken("/notifications/unread-count", {
    method: "GET",
  });
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) {
    return { ok: false, status: 400, data: null, error: "Missing notification id" };
  }

  return fetchWithToken(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return fetchWithToken("/notifications/read-all", {
    method: "PATCH",
  });
}

