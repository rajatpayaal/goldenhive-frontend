"use server";

import { cookies } from "next/headers";
import { BACKEND_API_BASE, authCookieName } from "@/lib/backend";

async function fetchWithToken(path, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return { ok: false, status: 401, data: null, error: "Not authenticated" };
  }

  const response = await fetch(`${BACKEND_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

async function fetchWithTokenFormData(path, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return { ok: false, status: 401, data: null, error: "Not authenticated" };
  }

  // When sending FormData with fetch, we must not explicitly set Content-Type
  // so the browser can automatically set it with the proper boundary.
  const headers = {
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };
  
  // Ensure we don't accidentally pass Content-Type
  delete headers["Content-Type"];

  const response = await fetch(`${BACKEND_API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

export async function createBlogAction(formData) {
  return fetchWithTokenFormData("/blogs", {
    method: "POST",
    body: formData,
  });
}

export async function getMyBlogsAction() {
  return fetchWithToken("/blogs/my", {
    method: "GET",
  });
}

export async function getBlogByIdAction(id) {
  return fetchWithToken(`/blogs/${id}`, {
    method: "GET",
  });
}

export async function updateBlogAction(id, formData) {
  return fetchWithTokenFormData(`/blogs/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteBlogAction(id) {
  return fetchWithToken(`/blogs/${id}`, {
    method: "DELETE",
  });
}

export async function getActiveBlogCategoriesAction() {
  return fetchWithToken("/blog-categories?isActive=true", {
    method: "GET",
  });
}
