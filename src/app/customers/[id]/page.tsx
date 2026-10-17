import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  getCustomer,
  getMatches,
  listNotes,
  listSentMatchIds,
} from "@/lib/repo";
import { age } from "@/lib/age-helper";
import InfoGroup from "@/components/InfoGroup";
import CustomerView from "@/components/CustomerView";
import { requireSession } from "@/lib/session";

async function CustomerData({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;

  const c = await getCustomer(id, session.matchmakerId);
  if (!c) notFound();

  const [notes, sentIds] = await Promise.all([
    listNotes(c.id),
    listSentMatchIds(c.id),
  ]);

  const profile = (
    <div className="groups">
      <InfoGroup
        title="Basics"
        pairs={[
          ["Gender", c.gender],
          ["Date of birth", c.dob],
          ["Age", age(c.dob)],
          ["Height", `${c.height} cm`],
          ["Marital status", c.maritalStatus],
          ["Location", `${c.city}, ${c.country}`],
        ]}
      />
      <InfoGroup
        title="Education and Career"
        pairs={[
          ["College", c.college],
          ["Degree", c.degree],
          ["Company", c.company],
          ["Designation", c.designation],
          ["Income", `${c.income.toLocaleString()} LPA`],
        ]}
      />
      <InfoGroup
        title="Family and Background"
        pairs={[
          ["Religion", c.religion],
          ["Caste", c.caste],
          ["Languages", c.languages],
          ["Siblings", c.siblings],
          ["Family type", c.family],
        ]}
      />
      <InfoGroup
        title="Values and Lifestyle"
        pairs={[
          ["Want kids", c.kids],
          ["Open to relocate", c.relocate],
          ["Open to pets", c.pets],
          ["Diet", c.diet],
        ]}
      />
      <InfoGroup
        title="Contact"
        pairs={[
          ["Email", c.email],
          ["Phone", c.phone],
        ]}
      />
    </div>
  );

  return (
    <CustomerView
      customer={{ ...c, age: age(c.dob) }}
      profile={profile}
      matches={getMatches(c)}
      initialNotes={notes}
      initialSentIds={sentIds}
    />
  );
}

export default function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="wrap">
      <Link href="/dashboard" className="back">
        {"<"} Back to customers
      </Link>

      <Suspense fallback={<p className="muted">Loading customer...</p>}>
        <CustomerData params={params} />
      </Suspense>
    </main>
  );
}
