import {
  buildUrl,
  getCategorySlug,
  getCachedCategories,
  resolveSiteUrl,
} from "../../../lib/category-sitemap";

export const revalidate = 300;

export async function GET() {
  const siteUrl = resolveSiteUrl();
  const categories = await getCachedCategories();

  // Include the primary sitemaps that are already published.
  const baseSitemaps = [
    "/sitemap.xml",
    "/sitemaps/packages.xml",
    "/sitemaps/blogs.xml",
    "/sitemaps/categories.xml",
    "/sitemaps/campaigns.xml",
  ];

  const baseEntries = baseSitemaps.map((path) => ({
    loc: buildUrl(siteUrl, path),
    lastmod: new Date().toISOString(),
  }));

  // Add one sitemap per category using SEO-friendly slugs.
  const categoryEntries = (categories || [])
    .filter((category) => category?.isActive !== false)
    .map((category) => {
      const slug = getCategorySlug(category);
      if (!slug) return null;

      const lastModified = category?.updatedAt || category?.createdAt || new Date().toISOString();
      return {
        loc: buildUrl(siteUrl, `/sitemaps/${slug}.xml`),
        lastmod: new Date(lastModified).toISOString(),
      };
    })
    .filter(Boolean);

  const entries = [...baseEntries, ...categoryEntries];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (item) =>
          `  <sitemap>\n    <loc>${item.loc}</loc>\n    <lastmod>${item.lastmod}</lastmod>\n  </sitemap>`
      )
      .join("\n") +
    `\n</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
