"use client";
import { useEffect, useState } from "react";
import type { Customer, EmailTemplate, MatchResult } from "@/types/profile";
import { draftEmail } from "@/lib/draft-email";
import { DEFAULT_TEMPLATE } from "@/lib/templates";

interface Props {
  customer: Customer;
  match: MatchResult;
  templates: EmailTemplate[];
  matchmakerName: string;
  onClose: () => void;
  onConfirm: (email: { subject: string; body: string }) => Promise<void>;
}

export default function SendMatchModal({
  customer,
  match,
  templates,
  matchmakerName,
  onClose,
  onConfirm,
}: Props) {
  const options = [DEFAULT_TEMPLATE, ...templates];
  const [templateId, setTemplateId] = useState(options[0].id);
  const first = draftEmail(customer, match, options[0], matchmakerName);
  const [subject, setSubject] = useState(first.subject);
  const [body, setBody] = useState(first.body);
  const [busy, setBusy] = useState(false);

  function pickTemplate(id: string) {
    const t = options.find((x) => x.id === id);
    if (!t) return; // can't happen with our own dropdown, but keeps TypeScript honest
    const d = draftEmail(customer, match, t, matchmakerName);
    setTemplateId(id);
    setSubject(d.subject);
    setBody(d.body);
  }

  async function confirm() {
    setBusy(true);
    await onConfirm({ subject, body });
    setBusy(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Send ${match.name} to ${customer.first}`}
      >
        <h2>
          Send {match.name} to {customer.first}
        </h2>

        <label>
          Template
          <select
            value={templateId}
            onChange={(e) => pickTemplate(e.target.value)}
            disabled={busy}
          >
            {options.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <p className="muted" style={{ fontSize: 13 }}>
          Switching templates replaces your edits.
        </p>

        <label>
          To
          <input value={customer.email} readOnly />
        </label>
        <label>
          Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label>
          Message
          <textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            autoFocus
          />
        </label>

        <div className="sum">
          <strong>{match.name}</strong>
          <br />
          {match.age} years, {match.city}
          <br />
          {match.role}, {match.education}
          <br />
          {match.height} cm, speaks {match.languages}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn primary" onClick={confirm} disabled={busy}>
            {busy ? "Sending..." : "Send match"}
          </button>
        </div>
      </div>
    </div>
  );
}
