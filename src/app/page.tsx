import { Suspense } from "react";
import { listCustomers } from "@/lib/repo";
import CustomerAge from "@/app/CustomerAge";

export default function Home() {
  const customers = listCustomers();

  return (
    <main className="wrap">
      <h1>Customers</h1>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            {c.first} {c.last},
            {" "}
            <Suspense fallback={<span>...</span>}>
              <CustomerAge dob={c.dob} />
            </Suspense>,
            {" "}
            {c.city}
          </li>
        ))}
      </ul>
    </main>
  );
}