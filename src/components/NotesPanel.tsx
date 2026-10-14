"use client";
import { useState } from "react";
import type { Note } from "@/types/profile";

export default function NotesPanel({
  notes,
  onAdd,
}: {
  notes: Note[];
  onAdd: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function save() {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
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
          <button className="btn primary" onClick={save}>
            Save note
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
          <small>{n.at}</small>
          <p>{n.text}</p>
        </div>
      ))}
    </>
  );
}
