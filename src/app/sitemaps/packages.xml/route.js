import { getAllPackages } from "../../../lib/package-data";

function buildUrl(baseUrl, path) {
  return `${baseUrl}${path}`;
}

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://goldenhiveholidays.in";

  const packages = await getAllPackages();

  const urls = (packages || []).map((pkg) => {
    const slug = pkg?.basic?.slug || pkg?._id;
    const lastModified = pkg?.updatedAt || pkg?.createdAt || new Date().toISOString();
    return {
      loc: buildUrl(siteUrl, `/packages/${slug}`),
      lastmod: new Date(lastModified).toISOString(),
    };
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (url) =>
          `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
