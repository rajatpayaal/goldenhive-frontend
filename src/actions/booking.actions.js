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
      "Authorization": `Bearer ${token}`,
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

export async function createBookingAction(bookingData) {
  return fetchWithToken("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

export async function getMyBookingsAction() {
  return fetchWithToken("/bookings/my", {
    method: "GET",
  });
}
