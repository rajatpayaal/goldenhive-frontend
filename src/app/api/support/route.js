import { cookies } from "next/headers";
import { authCookieName, BACKEND_API_BASE } from "@/lib/backend";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName)?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Not authenticated", data: null }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const payload = await request.json();

    const response = await fetch(`${BACKEND_API_BASE}/support`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
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

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data?.message || data?.error || "Failed to create support ticket",
          data,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error", data: null }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
