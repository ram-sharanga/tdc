// TopBar.tsx
import { requireSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function TopBar() {
  const session = await requireSession();
  return (
    <header className="top">
      <div className="logo">The Date Crew</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="muted">{session.name}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
