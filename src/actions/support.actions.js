"use server";

import { BACKEND_API_BASE } from "@/lib/backend";

export async function createSupportTicketAction(payload) {
  const response = await fetch(`${BACKEND_API_BASE}/support`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload ?? {}),
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

