"use client";
import { useState } from "react";
import { formatWhen } from "@/lib/format";
import type { Note } from "@/types/profile";

export default function NotesPanel({
  notes,
  onAdd,
}: {
  notes: Note[];
  onAdd: (text: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const text = draft.trim();
    if (!text || saving) return;
    setSaving(true);
    const ok = await onAdd(text);
    setSaving(false);
    if (ok) setDraft("");
  }

  return (
    <>
      <div className="notebox">
        <label>
          Add a note
          <textarea
            rows={3}
            placeholder="What came up in the call?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </label>
        <div>
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save note"}
          </button>
        </div>
      </div>

      {notes.length === 0 && (
        <p className="muted">
          No notes yet. Add the first one after your next call.
        </p>
      )}
      {notes.map((n) => (
        <div className="note" key={n.id}>
          <small>{formatWhen(n.createdAt)}</small>
          <p>{n.text}</p>
        </div>
      ))}
    </>
  );
}
