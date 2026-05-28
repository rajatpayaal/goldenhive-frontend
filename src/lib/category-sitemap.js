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

function collectDescendantCategoryIds(categories, rootId) {
  const normalizedRoot = String(rootId || "").trim().toLowerCase();
  if (!normalizedRoot) return [];

  const idSet = new Set([normalizedRoot]);
  let changed = true;

  while (changed) {
    changed = false;
    categories.forEach((category) => {
      const parentId = String(category?.parentId || "").trim().toLowerCase();
      const categoryId = String(category?._id || "").trim().toLowerCase();

      if (parentId && idSet.has(parentId) && categoryId && !idSet.has(categoryId)) {
        idSet.add(categoryId);
        changed = true;
      }
    });
  }

  return Array.from(idSet);
}

export async function fetchAllCategoryPackages(category) {
  if (!category) {
    return { items: [], meta: { reason: "missing-category" } };
  }

  const categorySlug = getCategorySlug(category);
  if (!categorySlug) {
    return { items: [], meta: { reason: "missing-category-slug" } };
  }

  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const items = [];
  let fallbackUsed = false;

  const categories = await getCachedCategories();
  const allowedCategoryIds = collectDescendantCategoryIds(
    categories || [],
    category?._id
  );
  const allowedCategorySlugs = new Set(
    (categories || [])
      .filter((cat) =>
        allowedCategoryIds.includes(String(cat?._id || "").trim().toLowerCase())
      )
      .map((cat) => getCategorySlug(cat))
      .filter(Boolean)
  );

  while (page <= totalPages) {
    const response = await apiService.getPackages({
      categoryId: category?._id,
      categoryName: category?.name || category?.title || category?.slug,
      categorySlug,
      page,
      limit,
      sort: "-updatedAt",
    });

    items.push(...(response?.items || []));
    totalPages = Number(response?.totalPages || 1);
    page += 1;
  }

  if (items.length === 0) {
    // Fallback: some API variants ignore categoryId on list endpoints.
    const allPackages = await apiService.getAllPackages({ limit: 200, sort: "-updatedAt" });
    items.push(...(allPackages || []));
    fallbackUsed = true;
  }

  // Enforce strict slug match; fall back to categoryId when slug is missing.
  const categoryId = String(category?._id || "").trim().toLowerCase();

  const filtered = items.filter((pkg) => {
    const pkgSlug = getPackageCategorySlug(pkg);
    if (pkgSlug) return allowedCategorySlugs.has(pkgSlug);

    const pkgCategoryId = getPackageCategoryId(pkg);
    return Boolean(
      pkgCategoryId &&
        (allowedCategoryIds.includes(pkgCategoryId) ||
          (categoryId && pkgCategoryId === categoryId))
    );
  });

  return {
    items: filtered,
    meta: {
      categorySlug,
      categoryId,
      allowedCategoryIdsCount: allowedCategoryIds.length,
      allowedCategorySlugsCount: allowedCategorySlugs.size,
      fetchedCount: items.length,
      filteredCount: filtered.length,
      fallbackUsed,
    },
  };
}
