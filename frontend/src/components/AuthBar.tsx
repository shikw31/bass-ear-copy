import { useState } from "react";
import type { Session } from "../domain/types";
import { login, logout } from "../api/authClient";

interface Props {
  session: Session | null;
  onSessionChange: (session: Session | null) => void;
  onError: (message: string) => void;
}

export function AuthBar({ session, onSessionChange, onError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const newSession = await login({ email, password });
      onSessionChange(newSession);
    } catch {
      onError("ログインに失敗しました");
    }
  }

  async function handleLogout() {
    await logout();
    onSessionChange(null);
  }

  if (session) {
    return (
      <div data-testid="auth-bar">
        <span data-testid="auth-bar-user-label">ログイン中</span>
        <button type="button" data-testid="auth-bar-logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div data-testid="auth-bar">
      <input
        type="email"
        placeholder="メールアドレス"
        data-testid="auth-bar-email-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        data-testid="auth-bar-password-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" data-testid="auth-bar-login-button" onClick={handleLogin}>
        ログイン
      </button>
    </div>
  );
}
