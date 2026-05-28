import {
  buildUrl,
  fetchAllCategoryPackages,
  getCategorySlug,
  getCachedCategories,
  resolveCategoryBySlug,
  resolveSiteUrl,
} from "../../../lib/category-sitemap";

export const revalidate = 300;

export async function generateStaticParams() {
  // Prebuild sitemap paths for all active category slugs.
  const categories = await getCachedCategories();

  return (categories || [])
    .filter((category) => category?.isActive !== false)
    .map((category) => ({ category: getCategorySlug(category) }))
    .filter((entry) => entry.category);
}

export async function GET(request, { params }) {
  const siteUrl = resolveSiteUrl();
  const { category: categoryParam } = params || {};

  // Resolve the requested category slug against API categories.
  const categories = await getCachedCategories();
  const category = resolveCategoryBySlug(categories || [], categoryParam);

  if (!category) {
    const emptyXml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return new Response(emptyXml, {
      status: 404,
      headers: { "Content-Type": "application/xml" },
    });
  }

  // Pull all packages for this category to keep the sitemap complete.
  const packages = await fetchAllCategoryPackages(category);

  const urls = (packages || []).map((pkg) => {
    const slug = pkg?.basic?.slug || pkg?._id;
    const lastModified = pkg?.updatedAt || pkg?.createdAt || new Date().toISOString();

    return {
      loc: buildUrl(siteUrl, `/packages/${slug}`),
      lastmod: new Date(lastModified).toISOString(),
    };
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
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
