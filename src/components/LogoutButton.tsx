"use client";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return (
    <button className="btn" onClick={logout}>
      Log out
    </button>
  );
}
