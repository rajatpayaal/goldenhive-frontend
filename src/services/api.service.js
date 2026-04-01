const API_BASE = "https://goldenhive-backend-g1xv.onrender.com/api";

export const apiService = {
  async getHomeBanners() {
    try {
      const res = await fetch(`${API_BASE}/banners?active=true`, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
  },

  async getHomeActivities() {
    try {
      const res = await fetch(`${API_BASE}/activities-v2?status=ACTIVE`, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  async getHomePackages() {
    try {
      const res = await fetch(`${API_BASE}/packages-v2`, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  },

  async getPackageById(id) {
    try {
      const res = await fetch(`${API_BASE}/packages-v2/${id}`, { next: { revalidate: 3600 } });
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

  async registerUser(userData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const json = await res.json();
      return { ok: res.ok, data: json };
    } catch (error) {
      console.error(`Error registering user:`, error);
      return { ok: false, error: error.message };
    }
  }
};
