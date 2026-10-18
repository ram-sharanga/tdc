import type { EmailTemplate } from "@/types/profile";

export const PLACEHOLDERS = [
  "customer_first",
  "candidate_name",
  "candidate_age",
  "candidate_city",
  "candidate_role",
  "why",
  "matchmaker_name",
] as const;
export type Placeholder = (typeof PLACEHOLDERS)[number];
export type TemplateVars = Record<Placeholder, string>; // forces a value for every placeholder

const isKnown = (k: string): k is Placeholder =>
  (PLACEHOLDERS as readonly string[]).includes(k);
const TOKEN = /\{\{\s*(\w+)\s*\}\}/g; // matches {{ name }} with optional spaces

// Replace known tokens; leave unknown ones untouched so typos stay visible instead of vanishing.
export function fillTemplate(text: string, vars: TemplateVars): string {
  return text.replace(TOKEN, (whole, key: string) =>
    isKnown(key) ? vars[key] : whole,
  );
}

export function findUnknownPlaceholders(text: string): string[] {
  const keys = [...text.matchAll(TOKEN)].map((m) => m[1]);
  return [...new Set(keys.filter((k) => !isKnown(k)))];
}

export const SAMPLE_VARS: TemplateVars = {
  customer_first: "Priya",
  candidate_name: "Arjun Sundaram",
  candidate_age: "31",
  candidate_city: "Bengaluru",
  candidate_role: "Product Manager",
  why: "Both want children and are open to moving.",
  matchmaker_name: "Asha",
};

export const DEFAULT_TEMPLATE: EmailTemplate = {
  id: "default",
  name: "Default",
  subject: "A match I think you'll like, {{customer_first}}",
  body:
    "Hi {{customer_first}}, I came across someone I think you'd enjoy meeting. " +
    "{{candidate_name}} is a {{candidate_role}} based in {{candidate_city}}. {{why}} " +
    "I've put a short profile below. Tell me what you think and I'll set up an introduction.\n\n{{matchmaker_name}}",
};
