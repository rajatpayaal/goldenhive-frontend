import { BACKEND_API_BASE } from "@/lib/backend";

const API_BASE = BACKEND_API_BASE;

const buildUrl = (path, query = {}) => {
  const url = new URL(`${API_BASE}${path}`);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  url.search = params.toString();
  return url.toString();
};

export const apiService = {
  async createSupportTicket(payload) {
    try {
      const res = await fetch(`${API_BASE}/support`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, data: json };
    } catch (error) {
      console.error("Error creating support ticket:", error);
      return { ok: false, status: 0, data: null, error: "Network error" };
    }
  },

  async getHomeBanners() {
    try {
      const res = await fetch(`${API_BASE}/banners/active`, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      const banners = json.data || [];
      return banners.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    } catch (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
  },

  async getFooter({ isActive = true } = {}) {
    try {
      const url = buildUrl("/footer", { isActive });
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      const items = json.data || [];
      return items[0] || null;
    } catch (error) {
      console.error("Error fetching footer:", error);
      return null;
    }
  },

  async getAboutUs() {
    try {
      const res = await fetch(`${API_BASE}/about-us`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error("Error fetching about-us:", error);
      return null;
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      const categories = json.data || [];
      return categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  async getPackages({ categoryId, categoryName, destination, status, search, page = 1, limit = 10, sort = "-createdAt" } = {}) {
    try {
      const url = buildUrl("/packages", { categoryId, categoryName, destination, status, search, page, limit, sort });
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return { items: [], total: 0, page, limit, totalPages: 0 };
      const json = await res.json();
      const data = json?.data || {};
      return {
        items: data.items || [],
        total: data.total ?? 0,
        page: data.page ?? page,
        limit: data.limit ?? limit,
        totalPages: data.totalPages ?? 0,
      };
    } catch (error) {
      console.error("Error fetching packages:", error);
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async getAllPackages({ page = 1, limit = 100, sort = "-createdAt" } = {}) {
    try {
      const firstPage = await this.getPackages({ page, limit, sort });
      const items = [...(firstPage.items || [])];
      const totalPages = Number(firstPage.totalPages || 0);

      if (totalPages <= 1) {
        return items;
      }

      const remaining = [];
      for (let currentPage = page + 1; currentPage <= totalPages; currentPage += 1) {
        remaining.push(this.getPackages({ page: currentPage, limit, sort }));
      }

      const responses = await Promise.all(remaining);
      responses.forEach((response) => {
        items.push(...(response.items || []));
      });

      return items;
    } catch (error) {
      console.error("Error fetching all packages:", error);
      return [];
    }
  },

  async getPackageSuggestions({ excludeId, limit = 6, sort = "-createdAt" } = {}) {
    try {
      const url = buildUrl("/suggestions/packages", { excludeId, limit, sort });
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (error) {
      console.error("Error fetching package suggestions:", error);
      return [];
    }
  },
  

  async getPackageById(id) {
    try {
      const res = await fetch(`${API_BASE}/packages/${id}`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching package ${id}:`, error);
      return null;
    }
  },

  async getPackageBySlug(slug, { dynamic = true } = {}) {
    try {
      const decodedSlug = decodeURIComponent(slug || "");
      if (!decodedSlug) return null;

      const res = await fetch(`${API_BASE}/packages/slug/${decodedSlug}`, dynamic ? { cache: "no-store" } : { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching package slug ${slug}:`, error);
      return null;
    }
  },

  async getActivityById(id) {
    try {
      const res = await fetch(`${API_BASE}/activities-v2/${id}`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      return null;
    }
  },

  async getBlogs({ isPublished = true } = {}) {
    try {
      const url = buildUrl("/blogs", { isPublished });
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return [];
    }
  },

  async getBlogById(id) {
    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      return null;
    }
  },

  async getPolicies({ isActive = true } = {}) {
    try {
      const url = buildUrl("/policies", { isActive });
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching policies:", error);
      return [];
    }
  },

  async getPolicyById(id) {
    try {
      const res = await fetch(`${API_BASE}/policies/${id}`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching policy ${id}:`, error);
      return null;
    }
  },

  // Auth flows use Server Actions (see `src/actions/auth.actions.js`) so that
  // HttpOnly cookies can be set from the server.
};
