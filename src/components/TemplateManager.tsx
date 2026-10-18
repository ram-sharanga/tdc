"use client";
import { useRef, useState } from "react";
import type { EmailTemplate } from "@/types/profile";
import {
  PLACEHOLDERS,
  SAMPLE_VARS,
  fillTemplate,
  findUnknownPlaceholders,
} from "@/lib/templates";
import { apiFetch } from "@/lib/client-api";
import { useToast } from "./Toast";

// One object for the form. id === null means "creating a new template"; the whole draft being null means the form is closed.
type Draft = { id: string | null; name: string; subject: string; body: string };

export default function TemplateManager({
  initial,
}: {
  initial: EmailTemplate[];
}) {
  const toast = useToast();
  const [templates, setTemplates] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null); // direct access to the textarea to read the caret position

  // Derived, not stored: recomputed from the draft on every render.
  const unknown = draft
    ? findUnknownPlaceholders(`${draft.subject} ${draft.body}`)
    : [];
  const fail = (e: unknown) =>
    toast(e instanceof Error ? e.message : "Something went wrong");

  function insert(token: string) {
    const el = bodyRef.current;
    if (!el || !draft) return;
    const { selectionStart: s, selectionEnd: e } = el;
    setDraft({
      ...draft,
      body: draft.body.slice(0, s) + token + draft.body.slice(e),
    });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    }); // after React re-renders
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      const payload = JSON.stringify({
        name: draft.name,
        subject: draft.subject,
        body: draft.body,
      });
      if (draft.id) {
        const t = await apiFetch<EmailTemplate>(`/api/templates/${draft.id}`, {
          method: "PATCH",
          body: payload,
        });
        setTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      } else {
        const t = await apiFetch<EmailTemplate>("/api/templates", {
          method: "POST",
          body: payload,
        });
        setTemplates((prev) => [...prev, t]);
      }
      setDraft(null);
      toast("Template saved");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: EmailTemplate) {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try {
      await apiFetch(`/api/templates/${t.id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
      toast("Template deleted");
    } catch (e) {
      fail(e);
    }
  }

  return (
    <>
      <div className="dhead">
        <div>
          <h1>Email templates</h1>
          <p className="muted">
            Used when you send a match. Placeholders fill in automatically.
          </p>
        </div>
        <button
          className="btn primary"
          onClick={() =>
            setDraft({ id: null, name: "", subject: "", body: "" })
          }
        >
          New template
        </button>
      </div>

      {draft && (
        <section className="group" style={{ marginBottom: 20 }}>
          <h3>{draft.id ? "Edit template" : "New template"}</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              Subject
              <input
                value={draft.subject}
                onChange={(e) =>
                  setDraft({ ...draft, subject: e.target.value })
                }
              />
            </label>
            <div className="chips" aria-label="Insert placeholder">
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="chip"
                  onClick={() => insert(`{{${p}}}`)}
                >{`{{${p}}}`}</button>
              ))}
            </div>
            <label>
              Message
              <textarea
                ref={bodyRef}
                rows={8}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </label>
            {unknown.length > 0 && (
              <p className="err">
                Unknown placeholder: {unknown.map((u) => `{{${u}}}`).join(", ")}
                . It will appear as typed.
              </p>
            )}
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                Preview with sample data
              </div>
              <pre className="preview">
                {fillTemplate(draft.body, SAMPLE_VARS) || "Start typing..."}
              </pre>
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="btn" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="btn primary" onClick={save} disabled={busy}>
                {busy ? "Saving..." : "Save template"}
              </button>
            </div>
          </div>
        </section>
      )}

      {templates.length === 0 && !draft && (
        <p className="muted">
          No templates yet. The built-in default is used until you add one.
        </p>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        {templates.map((t) => (
          <div className="note" key={t.id} style={{ maxWidth: "none" }}>
            <strong>{t.name}</strong>
            <p className="muted">{t.subject}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                className="btn"
                onClick={() =>
                  setDraft({
                    id: t.id,
                    name: t.name,
                    subject: t.subject,
                    body: t.body,
                  })
                }
              >
                Edit
              </button>
              <button className="btn" onClick={() => remove(t)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
