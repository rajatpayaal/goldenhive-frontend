"use server";

import { cookies } from "next/headers";
import { authCookieName } from "@/lib/backend";

export async function checkAuthTokenAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;
  return { hasToken: !!token, token: token || null };
}
