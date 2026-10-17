import { Suspense } from "react";
import { connection } from "next/server";
import { listCustomers } from "@/lib/repo";
import { requireSession } from "@/lib/session";
import { age } from "@/lib/age-helper";
import CustomerList from "@/components/CustomerList";

async function DashboardData() {
  // Part 3 removes this line: reading the session cookie becomes the request-time signal.
  // It must come BEFORE the database read. Otherwise Next could run the query at build time
  // and freeze today's data into the page.
  await connection();
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
