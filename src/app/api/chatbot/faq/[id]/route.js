import { BACKEND_API_BASE } from "@/lib/backend";

export async function GET(_request, { params }) {
  try {
    const id = params?.id;
    if (!id) {
      return new Response(JSON.stringify({ data: null, error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${BACKEND_API_BASE}/chatbot/faq/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    return new Response(JSON.stringify(payload ?? { data: null, error: "Invalid response" }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ data: null, error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

