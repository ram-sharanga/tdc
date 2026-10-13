import { Suspense } from "react";
import { connection } from "next/server";
import { age } from "@/lib/age-helper";
import { listCustomers } from "@/lib/repo";
import CustomerList from "@/components/CustomerList";

async function DashboardData() {
    await connection();
    const rows = listCustomers().map((c) => ({
        ...c,
        age: age(c.dob),
    }));
    return <CustomerList customers={rows} />;
}

export default function DashboardPage() {
    return (
        <main className="wrap">
            <h1>Good morning, Asha</h1>
            <Suspense fallback={<p className="muted">Loading customers...</p>}>
                <DashboardData />
            </Suspense>
        </main>
    );
}
