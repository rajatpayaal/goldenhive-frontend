import { BACKEND_API_BASE } from "@/lib/backend";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    const isActive = url.searchParams.get("isActive");

    const upstreamUrl = new URL(`${BACKEND_API_BASE}/chatbot/faq`);
    if (query) upstreamUrl.searchParams.set("query", query);
    if (isActive != null) upstreamUrl.searchParams.set("isActive", isActive);

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    return new Response(JSON.stringify(payload ?? { data: [], error: "Invalid response" }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ data: [], error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

