"use client";

import Cookies from "js-cookie";
import { authApi, userApi } from "./api";
import type { User, TokenResponse } from "@/types";

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}

export function setTokens(tokens: TokenResponse): void {
  Cookies.set("access_token", tokens.access_token, { expires: 1, sameSite: "strict" });
  Cookies.set("refresh_token", tokens.refresh_token, { expires: 30, sameSite: "strict" });
}

export function clearTokens(): void {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}

export function isAuthenticated(): boolean {
  return !!Cookies.get("access_token");
}

export async function login(email: string, password: string): Promise<User> {
  const res = await authApi.login({ email, password });
  setTokens(res.data);
  const userRes = await userApi.me();
  return userRes.data;
}

export async function register(
  email: string,
  password: string,
  full_name: string
): Promise<{ email: string }> {
  const res = await authApi.register({ email, password, full_name });
  return res.data;
}

export function logout(): void {
  clearTokens();
  window.location.href = "/login?logged_out=true";
}
