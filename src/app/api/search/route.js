import { BACKEND_API_BASE } from "@/lib/backend";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = String(rawQuery).trim();

    if (query.length < 3) {
      return new Response(
        JSON.stringify({
          data: { packages: [], blogs: [], categories: [], policies: [], count: 0 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const upstreamUrl = new URL(`${BACKEND_API_BASE}/search`);
    upstreamUrl.searchParams.set("q", query);

    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "application/json";
    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        data: { packages: [], blogs: [], categories: [], policies: [], count: 0 },
        error: error?.message || "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
