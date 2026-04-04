import { cookies } from "next/headers";
import { authCookieName, BACKEND_API_BASE } from "@/lib/backend";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName)?.value;

    if (!token) {
      return new Response(JSON.stringify({ data: null, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Call backend to get current user
    const response = await fetch(`${BACKEND_API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ data: null, error: "Failed to fetch user" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return new Response(JSON.stringify({ data: null, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
