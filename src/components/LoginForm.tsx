"use client";
import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      router.replace("/dashboard");
      router.refresh(); // re-run server components since cookie exists
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{ width: "100%", maxWidth: 360, display: "grid", gap: 14 }}
    >
      <h2>Welcome back</h2>
      <label>
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <div className="err" role="alert">
        {error}
      </div>
      <button className="btn primary" disabled={busy}>
        {busy ? "Signing in..." : "Sign in"}
      </button>
      <div className="demo">
        Demo login: <b>asha</b> / <b>Match@123</b>
      </div>
    </form>
  );
}
