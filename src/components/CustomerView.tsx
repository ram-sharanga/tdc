"use client";
import { useState, type ReactNode } from "react";
import { STAGES, type Stage, type CustomerRow, type Note } from "@/types/profile";
import { useToast } from "./Toast";
import Stepper from "./Stepper";
import NotesPanel from "./NotesPanel";

type Tab = "profile" | "matches" | "notes";

export default function CustomerView({ customer, profile }: { customer: CustomerRow; profile: ReactNode }) {
    const toast = useToast();
    const [tab, setTab] = useState<Tab>("profile");
    const [stage, setStage] = useState<Stage>(customer.stage); // initial value comes from the server
    const [notes, setNotes] = useState<Note[]>([]);

    function changeStage(next: Stage) {
        setStage(next);
        toast(`Stage updated to ${next}`);
    }

    function addNote(text: string) {
        setNotes((prev) => [
            {
                id: crypto.randomUUID(),
                at: new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }),
                text,
            },
            ...prev,
        ]);
        toast("Note saved");
    }

    const tabs: [Tab, string][] = [
        ["profile", "Profile"],
        ["matches", "Matches"],
        ["notes", `Notes (${notes.length})`],
    ];

    return (
        <>
            <div className="dhead">
                <div className="who">
                    <span className="av">{customer.first[0]}{customer.last[0]}</span>
                    <div>
                        <h1>{customer.first} {customer.last}</h1>
                        <span className="muted">{customer.age} years old in {customer.city}</span>
                    </div>
                </div>
                <label style={{ minWidth: 210 }}>
                    Journey stage
                    {/* Controlled select: value comes from state, onChange updates it */}
                    <select value={stage} onChange={(e) => changeStage(e.target.value as Stage)}>
                        {STAGES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                </label>
            </div>

            <Stepper current={stage} />

            <div className="tabs" role="tablist">
                {tabs.map(([key, label]) => (
                    <button key={key} className="tab" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === "profile" && profile}
            {tab === "matches" && <p className="muted">Matches arrive in step 7.</p>}
            {tab === "notes" && <NotesPanel notes={notes} onAdd={addNote} />}
        </>
    );
}