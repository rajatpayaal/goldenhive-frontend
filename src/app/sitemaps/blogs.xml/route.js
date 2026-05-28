import { apiService } from "../../../services/api.service";

function buildUrl(baseUrl, path) {
  return `${baseUrl}${path}`;
}

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://goldenhiveholidays.in";

  const blogs = await apiService.getBlogs({ isPublished: true });

  const urls = (blogs || []).map((blog) => {
    const slug = blog?.slug || blog?._id;
    const lastModified = blog?.updatedAt || blog?.createdAt || new Date().toISOString();
    return {
      loc: buildUrl(siteUrl, `/blogs/${slug}`),
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
