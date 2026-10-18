export type Field =
  | "tech"
  | "engineering"
  | "business"
  | "finance"
  | "health"
  | "education"
  | "design"
  | "other";

export const ROLES: { title: string; field: Field; base: number }[] = [
  { title: "Software Engineer", field: "tech", base: 12 },
  { title: "Senior Software Engineer", field: "tech", base: 22 },
  { title: "Data Analyst", field: "tech", base: 9 },
  { title: "Data Scientist", field: "tech", base: 20 },
  { title: "Product Manager", field: "tech", base: 26 },
  { title: "Tech Lead", field: "tech", base: 32 },
  { title: "Mechanical Engineer", field: "engineering", base: 10 },
  { title: "Civil Engineer", field: "engineering", base: 9 },
  { title: "Senior Engineer", field: "engineering", base: 18 },
  { title: "Consultant", field: "business", base: 18 },
  { title: "Project Manager", field: "business", base: 24 },
  { title: "Marketing Manager", field: "business", base: 16 },
  { title: "Chartered Accountant", field: "finance", base: 18 },
  { title: "Financial Analyst", field: "finance", base: 12 },
  { title: "Doctor", field: "health", base: 20 },
  { title: "Dentist", field: "health", base: 14 },
  { title: "Teacher", field: "education", base: 6 },
  { title: "Lecturer", field: "education", base: 8 },
  { title: "UX Designer", field: "design", base: 13 },
  { title: "Architect", field: "design", base: 15 },
];

export const fieldOf = (title: string): Field =>
  ROLES.find((r) => r.title === title)?.field ?? "other";

const RELATED = new Set([
  "tech|engineering",
  "business|finance",
  "design|engineering",
  "business|tech",
]);

export function fieldSimilarity(a: Field, b: Field): number {
  if (a === b && a !== "other") return 1;
  return RELATED.has(`${a}|${b}`) || RELATED.has(`${b}|${a}`) ? 0.6 : 0.3;
}

export const eduLevel = (degree: string): 1 | 2 =>
  /^(M\.|MBA|MBBS|MD|PhD)/i.test(degree) ? 2 : 1;
