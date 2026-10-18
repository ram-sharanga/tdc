import type { FitChip, MatchResult } from "@/types/profile";
import type { Scored } from "./matching";
import { age } from "@/lib/age-helper";

const tone = (v: number): FitChip["tone"] =>
  v >= 0.75 ? "y" : v >= 0.4 ? "m" : "n";

// Deterministic explanation: always available, so the UI never shows an empty "why" box.
// It also serves as the fallback when the AI is unavailable.
function builtInWhy(s: Scored): string {
  const ranked = [...s.factors].sort(
    (a, b) => b.value * b.weight - a.value * a.weight,
  );
  const best = ranked
    .slice(0, 2)
    .map((f) => `${f.name.toLowerCase()} (${f.note.toLowerCase()})`);
  const weak = s.factors
    .filter((f) => f.value < 0.5)
    .map((f) => f.name.toLowerCase());
  return (
    `Strongest fits: ${best.join(", ")}.` +
    (weak.length ? ` Worth checking: ${weak.join(", ")}.` : "")
  );
}

export function toMatchResult(s: Scored, today: Date): MatchResult {
  const p = s.candidate;
  return {
    id: p.id,
    name: `${p.first} ${p.last}`,
    age: age(p.dob, today),
    city: p.city,
    role: p.designation,
    education: `${p.college}, ${p.degree}`,
    height: p.height,
    languages: p.languages,
    score: s.score,
    tier: s.tier,
    // The four heaviest criteria become the chips; colour comes from how well each matched.
    fit: [...s.factors]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 4)
      .map((f) => ({ tone: tone(f.value), text: f.note })),
    breakdown: s.factors.map((f) => ({
      name: f.name,
      value: Math.round(f.value * 100),
    })),
    why: builtInWhy(s),
  };
}
