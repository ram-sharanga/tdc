import "server-only"; // the key must never reach the browser

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Either the model's text, or a short human-readable reason it failed.
// The reason never contains the API key, so it is safe to show in the UI.
export type ChatResult = { ok: true; text: string } | { ok: false; reason: string };

const REASONS: Record<number, string> = {
  401: "API key rejected (401)",
  403: "API key rejected (403)",
  404: "model name or base URL not found (404)",
  429: "rate limited (429), wait a minute",
};

export async function chat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {},
): Promise<ChatResult> {
  // trim() guards against a stray space or newline pasted into an env var.
  const base = process.env.AI_BASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();

  if (!base || !key || !model) {
    const missing = [!base && "AI_BASE_URL", !key && "AI_API_KEY", !model && "AI_MODEL"]
      .filter(Boolean)
      .join(", ");
    return { ok: false, reason: `not configured (missing ${missing})` };
  }

  // Common mistake: pasting the full endpoint as the base URL. Accept both.
  const url = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;

  const reasoning = model.includes("gpt-oss"); // models that think before answering

  const post = (jsonMode: boolean) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.4,
        // max_tokens is a CAP, not a target, so generous headroom costs nothing.
        // Reasoning models spend part of it on hidden "thinking"; if the thinking uses it all, the answer is empty.
        max_tokens: (opts.maxTokens ?? 400) + (reasoning ? 2500 : 0),
        ...(reasoning ? { reasoning_effort: "low" } : {}),
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(12000), // never let a slow provider hang the request
      cache: "no-store",
    });

  try {
    let res = await post(!!opts.json);
    // Some models reject JSON mode with a 400. Retry once as plain text; extractJson copes with it.
    if (res.status === 400 && opts.json) res = await post(false);

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error("[ai] provider error", res.status, detail); // full detail goes to the server log only
      return { ok: false, reason: REASONS[res.status] ?? `provider error (${res.status})` };
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const text = choice?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      console.error("[ai] empty reply", JSON.stringify(data).slice(0, 600)); // full shape goes to the server log
      const finish = choice?.finish_reason ? ` (finish_reason: ${choice.finish_reason})` : "";
      return { ok: false, reason: `empty reply from the model${finish}` };
    }
    return { ok: true, text: text.trim() };
  } catch (e) {
    console.error("[ai] call failed", e);
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return { ok: false, reason: timedOut ? "timed out" : "network error reaching the provider" };
  }
}

// Models sometimes wrap JSON in prose or code fences. Take the outermost {...} and parse it.
export function extractJson(text: string | null): Record<string, unknown> | null {
  if (!text) return null;
  const start = text.indexOf("{"),
    end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1));
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
