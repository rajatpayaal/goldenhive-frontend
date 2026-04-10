"use server";

import { headers } from "next/headers";

function getOriginFromHeaders() {
  const hdrs = headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  if (!host) return "http://localhost";
  return `${proto}://${host}`;
}

export async function getChatbotFaqListAction({ query, isActive = true } = {}) {
  const url = new URL("/api/chatbot/faq", getOriginFromHeaders());
  if (query) url.searchParams.set("query", query);
  if (isActive != null) url.searchParams.set("isActive", String(isActive));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export async function getChatbotFaqAction(id) {
  const url = new URL(`/api/chatbot/faq/${encodeURIComponent(id)}`, getOriginFromHeaders());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}
