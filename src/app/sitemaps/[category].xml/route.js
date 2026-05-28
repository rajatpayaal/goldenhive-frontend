import {
  buildUrl,
  fetchAllCategoryPackages,
  resolveCategoryBySlug,
  resolveSiteUrl,
} from "../../../lib/category-sitemap";
import { apiService } from "../../../services/api.service";

export const revalidate = 300;

export async function GET(request, { params }) {
  const siteUrl = resolveSiteUrl();
  const { category: categoryParam } = params || {};

  // Resolve the requested category slug against API categories.
  const categories = await apiService.getCategories();
  const category = resolveCategoryBySlug(categories || [], categoryParam);
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
