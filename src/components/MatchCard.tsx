"use client";
import { useState } from "react";
import type { MatchResult, Tier } from "@/types/profile";
import ScoreRing from "./ScoreRing";

const TIER_LABEL: Record<Tier, string> = {
  High: "Strong Match",
  Good: "Promising match",
  Stretch: "Potential match",
};

export default function MatchCard({
  match,
  sent,
  onSend,
  why,
  ai,
  loading,
}: {
  match: MatchResult;
  sent: boolean;
  onSend: () => void;
  why: string;
  ai: boolean; // true when `why` came from the AI
  loading: boolean; // true while the AI request is in flight
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="match">
      <ScoreRing score={match.score} />
      <div>
        <div className="mtop">
          <h3>{match.name}</h3>
          <span className={`tier t-${match.tier}`}>
            {TIER_LABEL[match.tier]}
          </span>
        </div>

        <div className="facts">
          <span>{match.age} years</span>
          <span>{match.city}</span>
          <span>{match.role}</span>
          <span>{match.height} cm</span>
        </div>

        <div className="fit">
          {match.fit.map((f) => (
            <span key={f.text} className={f.tone}>
              {f.text}
            </span>
          ))}
        </div>

        <div className="why">
          <div className="whyhead">
            <b>Why this match</b>
            {/* Always shows where the text came from, so the AI is never a guess. */}
            <span className={`src${ai ? " ai" : ""}`}>
              {loading ? "Asking AI..." : ai ? "AI explanation" : "Built-in summary"}
            </span>
          </div>
          <p>{why}</p>
        </div>

        {open && (
          <div className="bars">
            {match.breakdown.map((b) => (
              <div className="bar" key={b.name}>
                <span>{b.name}</span>
                <i>
                  <u style={{ width: `${b.value}%` }} />
                </i>
                <span>{b.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="acts">
          <button
            className="btn"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "Hide" : "Show"} score breakdown
          </button>
          <button className="btn primary" disabled={sent} onClick={onSend}>
            {sent ? "Sent" : "Send match"}
          </button>
        </div>
      </div>
    </article>
  );
}
