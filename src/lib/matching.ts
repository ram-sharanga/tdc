import type { Person, Tier } from "@/types/profile";
import { age } from "@/lib/age-helper";
import { eduLevel, fieldOf, fieldSimilarity } from "./roles";

// One scored criterion. value is 0..1, weight says how much it matters, note is human-readable.
export interface Factor {
  name: string;
  value: number;
  weight: number;
  note: string;
}
export interface Scored {
  candidate: Person;
  score: number;
  tier: Tier;
  factors: Factor[];
}

/* ---------- math helpers ---------- */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// 1.0 at `ideal`, falling in a straight line to 0 when `tol` away from it.
// This is what makes "how much younger" matter instead of a yes/no.
const closeness = (v: number, ideal: number, tol: number) =>
  clamp01(1 - Math.abs(v - ideal) / tol);
const langs = (s: string) => s.split(",").map((x) => x.trim().toLowerCase());
const shared = (a: string, b: string) =>
  langs(a).filter((l) => langs(b).includes(l)).length;
const OPEN = { Yes: 1, Maybe: 0.5, No: 0 } as const;

/* ---------- STAGE 1: hard filters (cheap, eliminate) ---------- */
type Check = (c: Person, p: Person, today: Date) => boolean;

const commonChecks: Check[] = [
  (c, p) => c.gender !== p.gender, // opposite gender
  (c, p) => c.religion === p.religion, // assumption: same religion required
  (c, p) =>
    !(
      (c.kids === "Yes" && p.kids === "No") ||
      (c.kids === "No" && p.kids === "Yes")
    ), // direct kids conflict
  (c, p) => c.city === p.city || !(c.relocate === "No" && p.relocate === "No"), // neither will move, different cities
];
// The brief's rules for male customers, isolated so a policy change touches one array.
const maleChecks: Check[] = [
  (c, p, t) => age(p.dob, t) < age(c.dob, t), // she is younger
  (c, p) => p.height < c.height, // she is shorter
  (c, p) => p.income < c.income, // she earns less
];

/* ---------- factors shared by both genders ---------- */
const kidsFactor = (c: Person, p: Person, weight: number): Factor => ({
  name: "Kids",
  weight,
  value: c.kids === p.kids ? 1 : 0.6, // Yes/No pairs were already filtered out, so a mismatch here means "Maybe" on one side
  note: c.kids === p.kids ? `Kids: both ${c.kids}` : "One is unsure about kids",
});
const relocationFactor = (c: Person, p: Person, weight: number): Factor => {
  if (c.city === p.city)
    return { name: "Relocation", weight, value: 1, note: "Same city" };
  const hi = Math.max(OPEN[c.relocate], OPEN[p.relocate]),
    lo = Math.min(OPEN[c.relocate], OPEN[p.relocate]);
  return {
    name: "Relocation",
    weight,
    value: hi * 0.6 + lo * 0.4,
    note: `Different cities, relocation ${c.relocate} / ${p.relocate}`,
  };
};
const languageFactor = (c: Person, p: Person, weight: number): Factor => {
  const n = shared(c.languages, p.languages);
  return {
    name: "Languages",
    weight,
    value: clamp01(n / 2),
    note: `${n} shared language${n === 1 ? "" : "s"}`,
  }; // two shared = full marks
};

/* ---------- STAGE 2 factors: male customer (weights sum to 1.00) ---------- */
export function maleFactors(c: Person, p: Person, t: Date): Factor[] {
  const gap = age(c.dob, t) - age(p.dob, t); // positive thanks to the hard filter
  const hgap = c.height - p.height;
  const ratio = p.income / c.income; // between 0 and 1 thanks to the hard filter
  return [
    {
      name: "Age gap",
      weight: 0.25,
      value: closeness(gap, 3, 8),
      note: `${gap} years younger`,
    },
    {
      name: "Height",
      weight: 0.15,
      value: closeness(hgap, 12, 12),
      note: `${hgap} cm shorter`,
    },
    {
      name: "Income",
      weight: 0.15,
      value: closeness(ratio, 0.75, 0.5),
      note: `Earns ${Math.round(ratio * 100)}% of his income`,
    },
    kidsFactor(c, p, 0.25),
    relocationFactor(c, p, 0.1),
    languageFactor(c, p, 0.1),
  ];
}

/* ---------- STAGE 2 factors: female customer (weights sum to 1.00) ----------
   Only true dealbreakers were filtered; age, height and profession are PREFERENCES, so they are scored. */
export function femaleFactors(c: Person, p: Person, t: Date): Factor[] {
  const older = age(p.dob, t) - age(c.dob, t);
  const taller = p.height - c.height;
  const prof = fieldSimilarity(fieldOf(c.designation), fieldOf(p.designation));
  return [
    kidsFactor(c, p, 0.25),
    relocationFactor(c, p, 0.15),
    {
      name: "Profession",
      weight: 0.15,
      value: prof,
      note:
        prof === 1
          ? "Same field"
          : prof > 0.5
            ? "Related fields"
            : "Different fields",
    },
    {
      name: "Education",
      weight: 0.1,
      value: eduLevel(c.degree) === eduLevel(p.degree) ? 1 : 0.6,
      note:
        eduLevel(c.degree) === eduLevel(p.degree)
          ? "Similar education level"
          : "Different education level",
    },
    {
      name: "Age",
      weight: 0.15,
      value: closeness(older, 3, 6),
      note: older >= 0 ? `${older} years older` : `${-older} years younger`,
    },
    {
      name: "Height",
      weight: 0.05,
      value: closeness(taller, 8, 12),
      note: taller >= 0 ? `${taller} cm taller` : `${-taller} cm shorter`,
    },
    languageFactor(c, p, 0.1),
    {
      name: "Diet",
      weight: 0.05,
      value: c.diet === p.diet ? 1 : 0.5,
      note: c.diet === p.diet ? `Both ${c.diet}` : "Different diets",
    },
  ];
}

/* ---------- combine ---------- */
const tierOf = (score: number): Tier =>
  score >= 80 ? "High" : score >= 60 ? "Good" : "Stretch";
// Weights sum to 1, so a weighted sum of 0..1 values is 0..1; times 100 gives 0..100.
const scoreOf = (f: Factor[]) =>
  Math.round(f.reduce((s, x) => s + x.value * x.weight, 0) * 100);

export function rankMatches(
  customer: Person,
  pool: Person[],
  today: Date,
  limit = 6,
): Scored[] {
  const male = customer.gender === "Male";
  const checks = male ? [...commonChecks, ...maleChecks] : commonChecks;
  const factorsFor = male ? maleFactors : femaleFactors;

  return pool
    .filter((p) => checks.every((ok) => ok(customer, p, today))) // stage 1: eliminate
    .map((p) => {
      // stage 2: score survivors
      const factors = factorsFor(customer, p, today);
      const score = scoreOf(factors);
      return { candidate: p, score, tier: tierOf(score), factors };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.candidate.id.localeCompare(b.candidate.id),
    ) // id tiebreak = deterministic output
    .slice(0, limit); // top-K
}
