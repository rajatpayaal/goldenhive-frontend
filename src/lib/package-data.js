import { cache } from "react";
import { apiService } from "../services/api.service";

export const getAllPackages = cache(async () => {
  return apiService.getAllPackages({ limit: 100, sort: "-createdAt" });
});

export const getPackageIdBySlug = cache(async (slugOrId) => {
  const decoded = decodeURIComponent(slugOrId || "");
  if (/^[0-9a-fA-F]{24}$/.test(decoded)) return decoded;

  const packages = await getAllPackages();
  const matched = packages.find((pkg) => pkg?.basic?.slug === decoded);
  return matched?._id || null;
});

export const getPackageBySlug = cache(async (slugOrId) => {
  const directPackage = await apiService.getPackageBySlug(slugOrId, { dynamic: false });
  if (directPackage) return directPackage;

  const resolvedId = await getPackageIdBySlug(slugOrId);
  if (!resolvedId) return null;
  return apiService.getPackageById(resolvedId);
});

export const getCategoryBySlug = cache(async (slug) => {
  const categories = await apiService.getCategories();
  const normalized = String(slug || "").toLowerCase();
  return (
    categories.find((category) => String(category?.slug || "").toLowerCase() === normalized) ||
    null
  );
});
