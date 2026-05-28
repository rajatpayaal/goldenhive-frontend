import { cache } from "react";
import { apiService } from "../services/api.service";

const DEFAULT_SITE_URL = "https://goldenhiveholidays.in";

export const getCachedCategories = cache(async () => {
  return apiService.getCategories();
});

export function resolveSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    DEFAULT_SITE_URL
  );
}

export function buildUrl(baseUrl, path) {
  return `${baseUrl}${path}`;
}

export function slugifyCategoryTitle(value) {
  if (!value) return "";
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getCategorySlug(category) {
  if (!category) return "";
  // Prefer stored slug; otherwise derive from category title.
  const directSlug = String(category?.slug || "").trim();
  if (directSlug) return directSlug.toLowerCase();

  return "";
}

export function resolveCategoryBySlug(categories, targetSlug) {
  const normalizedTarget = String(targetSlug || "").toLowerCase();
  if (!normalizedTarget) return null;

  return (
    categories.find((category) =>
      String(category?.slug || "").toLowerCase() === normalizedTarget
    ) ||
    null
  );
}

export function getPackageCategorySlug(pkg) {
  if (!pkg) return "";
  return String(
    pkg?.categoryId?.slug ||
      pkg?.category?.slug ||
      pkg?.categorySlug ||
      ""
  )
    .trim()
    .toLowerCase();
}

export function getPackageCategoryId(pkg) {
  if (!pkg) return "";
  return String(pkg?.categoryId?._id || pkg?.categoryId || "")
    .trim()
    .toLowerCase();
}

export async function fetchAllCategoryPackages(category) {
  if (!category) return [];

  const categorySlug = getCategorySlug(category);
  if (!categorySlug) return [];

  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const items = [];

  while (page <= totalPages) {
    const response = await apiService.getPackages({
      categoryId: category?._id,
      page,
      limit,
      sort: "-updatedAt",
    });

    items.push(...(response?.items || []));
    totalPages = Number(response?.totalPages || 1);
    page += 1;
  }

  // Enforce strict slug match; fall back to categoryId when slug is missing.
  const categoryId = String(category?._id || "").trim().toLowerCase();

  return items.filter((pkg) => {
    const pkgSlug = getPackageCategorySlug(pkg);
    if (pkgSlug) return pkgSlug === categorySlug;

    const pkgCategoryId = getPackageCategoryId(pkg);
    return Boolean(categoryId && pkgCategoryId && pkgCategoryId === categoryId);
  });
}
