"use client";

import { useState } from "react";
import Link from "next/link";
import { STAGES, type Stage, type CustomerRow } from "@/types/profile";
import StagePill from "@/components/StagePill";

export default function CustomerList({
  customers,
}: {
  customers: CustomerRow[];
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Stage | "All">("All");

  const rows = customers.filter(
    (c) =>
      (filter === "All" || c.stage === filter) &&
      `${c.first} ${c.last} ${c.city}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <div className="stats">
        {STAGES.map((s) => (
          <StagePill key={s} stage={s} />
        ))}
      </div>

      <div className="tools">
        <input
          placeholder="Search by name or city"
          aria-label="Search customers"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="chips">
          {(["All", ...STAGES] as const).map((s) => (
            <button
              key={s}
              className="chip"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="list">
        <div className="row head">
          <span>Name</span>
          <span>Age</span>
          <span>City</span>
          <span>Marital status</span>
          <span>Status</span>
        </div>

        {rows.length === 0 && (
          <div className="empty">
            <h3>No customers match</h3>
            <p className="muted">Clear the search or pick another status.</p>
          </div>
        )}

        {rows.map((c) => (
          <Link key={c.id} href={`/customers/${c.id}`} className="row">
            <span className="who">
              <span className="av">
                {c.first[0]}
                {c.last[0]}
              </span>
              {c.first} {c.last}
            </span>
            <span>{c.age}</span>
            <span>{c.city}</span>
            <span>{c.maritalStatus}</span>
            <span>
              <StagePill stage={c.stage} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
