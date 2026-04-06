import { cookies } from "next/headers";
import { authCookieName, BACKEND_API_BASE } from "@/lib/backend";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName)?.value;

    if (!token) {
      return new Response(JSON.stringify({ data: { count: 0 }, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${BACKEND_API_BASE}/cart/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      return new Response(JSON.stringify({ data: { count: 0 }, error: payload?.error || "Failed to fetch cart" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const items = payload?.data?.packageId || [];
    const count = Array.isArray(items) ? items.length : 0;

    return new Response(JSON.stringify({ data: { count } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ data: { count: 0 }, error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

