import "server-only";
import { chat, extractJson } from "./ai";
import { getCachedExplanations, saveExplanations } from "./repo";
import type { Customer, MatchResult } from "@/types/profile";

const SYSTEM = `You help a human matchmaker at an Indian matchmaking service.
For each candidate you receive a compatibility summary: an overall level and the level of each factor (strong, okay or weak), plus short highlights.
For each candidate write 1 or 2 warm, plain-English sentences (at most 45 words) explaining why they could suit the client, and mention one thing worth checking if any factor is weak.
Rules: use ONLY the facts provided. Do not invent details. Do not mention numbers or scores. No emojis.
Respond with JSON only: an object mapping each candidate id to its explanation string.`;

const level = (v: number) => (v >= 75 ? "strong" : v >= 40 ? "okay" : "weak"); // numbers become words so the model doesn't recite them
// A fingerprint of the result. If the score or any factor changes, the cached text is stale.
const sigOf = (m: MatchResult) =>
  `${m.score}:${m.breakdown.map((b) => b.value).join(",")}`;

// Returns { matchId: aiText } for every match it could explain. Missing ids mean "keep the built-in text".
export type Explained = { items: Record<string, string>; reason?: string };

export async function explainMatches(
  customer: Customer,
  matches: MatchResult[],
): Promise<Explained> {
  const cached = await getCachedExplanations(customer.id);
  const out: Record<string, string> = {};
  const todo: MatchResult[] = [];

  for (const m of matches) {
    const hit = cached[m.id];
    if (hit && hit.sig === sigOf(m))
      out[m.id] = hit.text; // cache hit: free and instant
    else todo.push(m);
  }
  if (todo.length === 0) return { items: out };

  // ONE call for all missing matches: fewer requests means fewer rate-limit problems.
  const payload = {
    client_first: customer.first,
    candidates: todo.map((m) => ({
      id: m.id,
      first_name: m.name.split(" ")[0],
      overall: level(m.score),
      factors: m.breakdown.map((b) => ({
        name: b.name,
        level: level(b.value),
      })),
      highlights: m.fit.map((f) => f.text),
    })),
  };
  const result = await chat(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: JSON.stringify(payload) },
    ],
    { json: true, maxTokens: 250 * todo.length + 600, temperature: 0.4 },
  );
  if (!result.ok) return { items: out, reason: result.reason };
  const parsed = extractJson(result.text);

  const fresh: Record<string, { sig: string; text: string }> = {};
  for (const m of todo) {
    const t = parsed?.[m.id];
    // Validate every output: right type, sane length. Anything else is discarded.
    if (
      typeof t === "string" &&
      t.trim().length >= 20 &&
      t.trim().length <= 400
    ) {
      out[m.id] = t.trim();
      fresh[m.id] = { sig: sigOf(m), text: t.trim() };
    }
  }
  if (Object.keys(fresh).length > 0) await saveExplanations(customer.id, fresh);
  const missed = todo.length - Object.keys(fresh).length;
  return {
    items: out,
    reason: missed > 0 ? `AI reply was unusable for ${missed} match${missed === 1 ? "" : "es"}` : undefined,
  };
}
