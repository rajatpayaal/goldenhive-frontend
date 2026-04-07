const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.GOLDENHIVE_API_BASE ||
  "https://goldenhive-backend-g1xv.onrender.com/api";

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

  async getPackages({ categoryName, destination, status, search, page = 1, limit = 10, sort = "-createdAt" } = {}) {
    try {
      const url = buildUrl("/packages", { categoryName, destination, status, search, page, limit, sort });
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
