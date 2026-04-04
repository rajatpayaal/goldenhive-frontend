"use server";

import { cookies } from "next/headers";
import { BACKEND_API_BASE, authCookieName, extractToken } from "../lib/backend";

async function postJson(path, body) {
  const res = await fetch(`${BACKEND_API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { ok: res.ok, status: res.status, data: json };
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export async function registerUserAction(payload) {
  return postJson("/auth/register", payload);
}

export async function verifyOtpAction(payload) {
  const result = await postJson("/auth/verify-otp", payload);
  if (result.ok) {
    const token = extractToken(result.data);
    if (token) {
      const store = await cookies();
      store.set(authCookieName, token, cookieOptions());
    }
  }
  return result;
}

export async function resendOtpAction(payload) {
  return postJson("/auth/resend-otp", payload);
}

export async function loginAction(payload) {
  const result = await postJson("/auth/login", payload);
  if (result.ok) {
    const token = extractToken(result.data);
    if (token) {
      const store = await cookies();
      store.set(authCookieName, token, cookieOptions());
    }
  }
  return result;
}

export async function forgotPasswordAction(payload) {
  return postJson("/auth/forgot-password", payload);
}

export async function resetPasswordAction(payload) {
  return postJson("/auth/reset-password", payload);
}

export async function logoutAction() {
  const store = await cookies();
  store.set(authCookieName, "", { ...cookieOptions(), maxAge: 0 });
  return { ok: true };
}

