import { Suspense } from "react";
import { listCustomers } from "@/lib/repo";
import { requireSession } from "@/lib/session";
import { age } from "@/lib/age-helper";
import CustomerList from "@/components/CustomerList";

async function DashboardData() {
  const session = await requireSession();
  const rows = (await listCustomers(session.matchmakerId)).map((c) => ({
    ...c,
    age: age(c.dob),
  }));
  return (
    <>
      <h1>Good morning, {session.name}</h1>
      <CustomerList customers={rows} />
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="wrap">
      <Suspense fallback={<p className="muted">Loading customers...</p>}>
        <DashboardData />
      </Suspense>
    </main>
  );
}
