import { getAllPackages } from "../lib/package-data";
import { apiService } from "../services/api.service";

export default async function sitemap() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://goldenhive-frontend.vercel.app";

  const [packages, categories, blogs, policies] = await Promise.all([
    getAllPackages(),
    apiService.getCategories(),
    apiService.getBlogs({ isPublished: true }),
    apiService.getPolicies({ isActive: true }),
  ]);

  const staticRoutes = ["", "/packages", "/blogs", "/policies", "/about-us", "/custom-requests"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...packages.map((pkg) => ({
      url: `${siteUrl}/packages/${pkg?.basic?.slug || pkg?._id}`,
      lastModified: new Date(pkg?.updatedAt || pkg?.createdAt || Date.now()),
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/category/${category?.slug}`,
      lastModified: new Date(category?.updatedAt || category?.createdAt || Date.now()),
    })),
    ...blogs.map((blog) => ({
      url: `${siteUrl}/blogs/${blog?.slug || blog?._id}`,
      lastModified: new Date(blog?.updatedAt || blog?.createdAt || Date.now()),
    })),
    ...policies.map((policy) => ({
      url: `${siteUrl}/policies/${policy?.slug || policy?._id}`,
      lastModified: new Date(policy?.updatedAt || policy?.createdAt || Date.now()),
    })),
  ];
}
