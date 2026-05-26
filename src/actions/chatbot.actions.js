"use server";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000"
  );
}

export async function getChatbotFaqListAction({ query, isActive = true } = {}) {
  const url = new URL("/api/chatbot/faq", getBaseUrl());
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
  const url = new URL(`/api/chatbot/faq/${encodeURIComponent(id)}`, getBaseUrl());

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
