"use server";

import { redirect } from "next/navigation";
import { setSessionCookie } from "@/lib/auth/session";
import { timingSafeEqual } from "@/lib/auth/token";

export type LoginState = {
  error?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "").trim();
  // Only allow same-origin relative paths (block open redirects).
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return {
      error: "APP_PASSWORD is not configured on the server.",
    };
  }

  if (!timingSafeEqual(password, expected)) {
    return { error: "Incorrect password." };
  }

  await setSessionCookie();
  redirect(next);
}
