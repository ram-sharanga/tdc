"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  STAGES,
  type Stage,
  type CustomerRow,
  type Note,
} from "@/types/profile";
import { useToast } from "@/components/Toast";
import Stepper from "@/components/Stepper";
import NotesPanel from "@/components/NotesPanel";
import type { EmailTemplate, MatchResult } from "@/types/profile";
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
  templates,
  matchmakerName,
}: {
  customer: CustomerRow;
  profile: ReactNode;
  matches: MatchResult[];
  initialNotes: Note[];
  initialSentIds: string[];
  templates: EmailTemplate[];
  matchmakerName: string;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("profile");
  const [stage, setStage] = useState<Stage>(customer.stage); // initial value comes from the server
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [sent, setSent] = useState<Set<string>>(new Set(initialSentIds));
  const [sending, setSending] = useState<MatchResult | null>(null); // which match's modal is open, or none
  const [aiWhy, setAiWhy] = useState<Record<string, string>>({});
  const [explained, setExplained] = useState(false); // true once the AI request has finished (success or not)
  const [aiNote, setAiNote] = useState(""); // why the AI text is missing, when it is
  const [savingStage, setSavingStage] = useState(false);
  const requested = useRef(false);
  const loadingAi = tab === "matches" && !explained; // derived, not stored

  const fail = (e: unknown) =>
    toast(e instanceof Error ? e.message : "Something went wrong");

  useEffect(() => {
    if (tab !== "matches" || requested.current) return;
    requested.current = true;
    apiFetch<{ items: Record<string, string>; reason?: string }>(
      `/api/customers/${customer.id}/explanations`,
      { method: "POST" },
    )
      .then((r) => {
        setAiWhy(r.items);
        setAiNote(r.reason ?? "");
      })
      .catch((e) => setAiNote(e instanceof Error ? e.message : "request failed"))
      .finally(() => setExplained(true)); // built-in text stays when the AI is unavailable
  }, [tab, customer.id]);

  async function changeStage(next: Stage) {
    if (savingStage) return; // ignore clicks while a save is still in flight
    const previous = stage;
    setStage(next); // optimistic: the screen updates immediately
    setSavingStage(true);
    try {
      await apiFetch(`/api/customers/${customer.id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage: next }),
      });
      toast(`Stage updated to ${next}`);
    } catch (e) {
      setStage(previous); // the server said no, so put the old value back
      fail(e);
    } finally {
      setSavingStage(false);
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
            disabled={savingStage}
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
      {tab === "matches" && explained && aiNote && (
        <p className="ainote" style={{ marginBottom: 12 }}>
          AI explanations unavailable: {aiNote}. Showing the built-in summary.
        </p>
      )}
      {tab === "matches" &&
        matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            why={aiWhy[m.id] ?? m.why}
            ai={m.id in aiWhy}
            loading={loadingAi}
            sent={sent.has(m.id)}
            onSend={() => setSending(m)}
          />
        ))}

      {sending && (
        <SendMatchModal
          key={sending.id}
          customer={customer}
          match={sending}
          templates={templates}
          matchmakerName={matchmakerName}
          onClose={() => setSending(null)}
          onConfirm={(email) => confirmSend(sending, email)}
        />
      )}
      {tab === "notes" && <NotesPanel notes={notes} onAdd={addNote} />}
    </>
  );
}
