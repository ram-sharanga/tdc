"use client";
import { useState, type ReactNode } from "react";
import {
  STAGES,
  type Stage,
  type CustomerRow,
  type Note,
} from "@/types/profile";
import { useToast } from "@/components/Toast";
import Stepper from "@/components/Stepper";
import NotesPanel from "@/components/NotesPanel";
import type { MatchResult } from "@/types/profile";
import MatchCard from "@/components/MatchCard";
import SendMatchModal from "@/components/SendMatchModal";
import { apiFetch } from "@/lib/client-api";

type Tab = "profile" | "matches" | "notes";

export default function CustomerView({
  customer,
  profile,
  matches,
  initialNotes,
  initialSentIds,
}: {
  customer: CustomerRow;
  profile: ReactNode;
  matches: MatchResult[];
  initialNotes: Note[];
  initialSentIds: string[];
}) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("profile");
  const [stage, setStage] = useState<Stage>(customer.stage); // initial value comes from the server
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [sent, setSent] = useState<Set<string>>(new Set(initialSentIds));
  const [sending, setSending] = useState<MatchResult | null>(null); // which match's modal is open, or none

  const fail = (e: unknown) =>
    toast(e instanceof Error ? e.message : "Something went wrong");

  async function changeStage(next: Stage) {
    try {
      await apiFetch(`/api/customers/${customer.id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage: next }),
      });
      setStage(next);
      toast(`Stage updated to ${next}`);
    } catch (e) {
      fail(e);
    }
  }

  async function addNote(text: string): Promise<boolean> {
    try {
      const note = await apiFetch<Note>(`/api/customers/${customer.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setNotes((prev) => [note, ...prev]);
      toast("Note saved");
      return true;
    } catch (e) {
      fail(e);
      return false;
    }
  }

  async function confirmSend(
    match: MatchResult,
    email: { subject: string; body: string },
  ) {
    try {
      const res = await apiFetch<{ stage: Stage }>(
        `/api/customers/${customer.id}/sent-matches`,
        {
          method: "POST",
          body: JSON.stringify({ matchId: match.id, ...email }),
        },
      );
      setSent((prev) => new Set(prev).add(match.id));
      setStage(res.stage);
      setSending(null);
      toast(`Match sent to ${customer.first}`);
    } catch (e) {
      fail(e);
    }
  }

  const tabs: [Tab, string][] = [
    ["profile", "Profile"],
    ["matches", `Matches (${matches.length})`],
    ["notes", `Notes (${notes.length})`],
  ];

  return (
    <>
      <div className="dhead">
        <div className="who">
          <span className="av">
            {customer.first[0]}
            {customer.last[0]}
          </span>
          <div>
            <h1>
              {customer.first} {customer.last}
            </h1>
            <span className="muted">
              {customer.age} years old in {customer.city}
            </span>
          </div>
        </div>
        <label style={{ minWidth: 210 }}>
          Journey stage
          <select
            value={stage}
            onChange={(e) => changeStage(e.target.value as Stage)}
          >
            {STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <Stepper current={stage} />

      <div className="tabs" role="tablist">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className="tab"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && profile}
      {tab === "matches" &&
        matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            sent={sent.has(m.id)}
            onSend={() => setSending(m)}
          />
        ))}

      {sending && (
        <SendMatchModal
          key={sending.id}
          customer={customer}
          match={sending}
          onClose={() => setSending(null)}
          onConfirm={(email) => confirmSend(sending, email)}
        />
      )}
      {tab === "notes" && <NotesPanel notes={notes} onAdd={addNote} />}
    </>
  );
}
