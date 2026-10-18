import { Suspense } from "react";
import TopBar from "@/components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* TopBar reads the session cookie (dynamic), so it needs its own Suspense boundary. */}
      <Suspense
        fallback={
          <header className="top">
            <div className="logo">The Date Crew</div>
          </header>
        }
      >
        <TopBar />
      </Suspense>
      {children}
    </>
  );
}
