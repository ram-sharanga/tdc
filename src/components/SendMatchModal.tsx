"use client";
import { useEffect, useState } from "react";
import type { Customer, MatchResult } from "@/types/profile";
import { draftEmail } from "@/lib/draft-email";

export default function SendMatchModal({
  customer,
  match,
  onClose,
  onConfirm,
}: {
  customer: Customer;
  match: MatchResult;
  onClose: () => void;
  onConfirm: (email: { subject: string; body: string }) => Promise<void>;
}) {
  const [email, setEmail] = useState(() => draftEmail(customer, match));
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await onConfirm({ subject, body });
    setBusy(false);
  }

  const { subject, body } = email;

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
          To
          <input value={customer.email} readOnly />
        </label>
        <label>
          Subject
          <input
            value={subject}
            onChange={(e) =>
              setEmail((prev) => ({ ...prev, subject: e.target.value }))
            }
          />
        </label>
        <label>
          Message
          <textarea
            rows={6}
            value={body}
            onChange={(e) =>
              setEmail((prev) => ({ ...prev, body: e.target.value }))
            }
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
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy} onClick={confirm}>
            {busy ? "Sending..." : "Send match"}
          </button>
        </div>
      </div>
    </div>
  );
}
