import "server-only";
import { chat, extractJson } from "./ai";
import { draftEmail } from "./draft-email";
import type { Customer, EmailTemplate, MatchResult } from "@/types/profile";

const SYSTEM = `You help a human matchmaker write a short, warm email introducing one suggested match to their client.
You receive the matchmaker's own draft (already filled in) and some facts. Lightly personalize the draft: keep its structure, voice and sign-off, keep the body under 120 words, and use ONLY the facts provided.
Do not invent details. Do not add links, prices or contact details. Do not mention scores. The email is from the matchmaker to the client.
Respond with JSON only: {"subject": string, "body": string}.`;

export type Draft = {
  subject: string;
  body: string;
  source: "ai" | "template";
};

export async function generateDraft(
  customer: Customer,
  match: MatchResult,
  template: EmailTemplate,
  matchmakerName: string,
): Promise<Draft> {
  // The placeholder-filled version is both the AI's starting point and the fallback.
  const base = draftEmail(customer, match, template, matchmakerName);

  const raw = await chat(
    [
      { role: "system", content: SYSTEM }, // our rules; the template can't override them
      {
        role: "user",
        content: JSON.stringify({
          matchmaker: matchmakerName,
          client_first: customer.first,
          candidate: {
            name: match.name,
            age: match.age,
            city: match.city,
            role: match.role,
            education: match.education,
            languages: match.languages,
          },
          why_it_fits: match.why,
          matchmaker_draft: base, // the template arrives here, as DATA
        }),
      },
    ],
    { json: true, maxTokens: 450, temperature: 0.7 },
  );

  const j = extractJson(raw);
  const subject = typeof j?.subject === "string" ? j.subject.trim() : "";
  const body = typeof j?.body === "string" ? j.body.trim() : "";

  // Guardrails on the OUTPUT: even if a template tried to hijack the model, a bad result never reaches the screen.
  const valid =
    subject.length > 0 &&
    subject.length <= 200 &&
    body.length >= 40 &&
    body.length <= 1500 &&
    body.includes(match.name.split(" ")[0]) && // must actually introduce the candidate
    !/https?:\/\//i.test(body); // no links
  return valid
    ? { subject, body, source: "ai" }
    : { ...base, source: "template" };
}
