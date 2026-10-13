import type { Session } from "../domain/types";

// AuthClient (see component-methods.md / Application Design). Session state is carried by an
// httpOnly/Secure/SameSite cookie the backend sets — this client never reads or stores a token
// itself (SECURITY-12). `credentials: "include"` is what lets the browser send/receive that cookie.

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL ?? "";

export interface Credentials {
  email: string;
  password: string;
}

export async function login(credentials: Credentials): Promise<Session> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error("ログインに失敗しました");
  }
  return (await response.json()) as Session;
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function getCurrentSession(): Promise<Session | null> {
  const response = await fetch(`${BASE_URL}/auth/session`, { credentials: "include" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("ログイン状態の確認に失敗しました");
  }
  return (await response.json()) as Session;
}
