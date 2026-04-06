"use server";

import { cookies } from "next/headers";
import { BACKEND_API_BASE, authCookieName } from "@/lib/backend";

async function fetchWithToken(path, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return { ok: false, status: 401, data: null, error: "Not authenticated" };
  }

  const response = await fetch(`${BACKEND_API_BASE}${path}`, {
    ...options,
    headers: {
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

export async function createCustomRequestAction(payload) {
  return fetchWithToken("/custom-requests", {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function getMyCustomRequestsAction() {
  return fetchWithToken("/custom-requests/my", {
    method: "GET",
  });
}

export async function getCustomRequestByIdAction(id) {
  if (!id) return { ok: false, status: 400, data: null, error: "Missing id" };
  return fetchWithToken(`/custom-requests/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function updateCustomRequestAction(id, payload) {
  if (!id) return { ok: false, status: 400, data: null, error: "Missing id" };
  return fetchWithToken(`/custom-requests/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload ?? {}),
  });
}

