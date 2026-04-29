import { getAllPackages } from "../lib/package-data";
import { apiService } from "../services/api.service";

export default async function sitemap() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.goldenhiveholidays.in";

  try {
    const [packages, categories, blogs, policies] = await Promise.all([
      getAllPackages(),
      apiService.getCategories(),
      apiService.getBlogs({ isPublished: true }),
      apiService.getPolicies({ isActive: true }),
    ]);

    const staticRoutes = [
      "",
      "/packages",
      "/blogs",
      "/policies",
      "/about-us",
      "/custom-requests",
    ];

    const staticUrls = staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "" ? 1.0 : 0.8,
    }));

    const packageUrls =
      packages?.map((pkg) => ({
        url: `${siteUrl}/packages/${pkg?.basic?.slug || pkg?._id}`,
        lastModified: new Date(pkg?.updatedAt || pkg?.createdAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.7,
      })) || [];

    const categoryUrls =
      categories?.map((category) => ({
        url: `${siteUrl}/category/${category?.slug}`,
        lastModified: new Date(
          category?.updatedAt || category?.createdAt || Date.now()
        ),
        changeFrequency: "weekly",
        priority: 0.6,
      })) || [];

    const blogUrls =
      blogs?.map((blog) => ({
        url: `${siteUrl}/blogs/${blog?.slug || blog?._id}`,
        lastModified: new Date(
          blog?.updatedAt || blog?.createdAt || Date.now()
        ),
        changeFrequency: "daily",
        priority: 0.7,
      })) || [];

    const policyUrls =
      policies?.map((policy) => ({
        url: `${siteUrl}/policies/${policy?.slug || policy?._id}`,
        lastModified: new Date(
          policy?.updatedAt || policy?.createdAt || Date.now()
        ),
        changeFrequency: "monthly",
        priority: 0.5,
      })) || [];

    return [
      ...staticUrls,
      ...packageUrls,
      ...categoryUrls,
      ...blogUrls,
      ...policyUrls,
    ];
  } catch (error) {
    console.error("Sitemap Error:", error);

    return [
      {
        url: siteUrl,
        lastModified: new Date(),
      },
    ];
  }
}