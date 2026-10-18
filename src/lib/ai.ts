import "server-only"; // the key must never reach the browser

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Calls any OpenAI-compatible "chat completions" endpoint.
// Returns null on ANY failure (not configured, rate limit, timeout, bad response),
// so callers fall back to the built-in behaviour instead of breaking the page.
export async function chat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  const base = process.env.AI_BASE_URL,
    key = process.env.AI_API_KEY,
    model = process.env.AI_MODEL;
  if (!base || !key || !model) return null;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.4, // low = consistent, high = more varied wording
        max_tokens: opts.maxTokens ?? 400, // hard cap on output length, which also caps cost
        // Asks the provider for JSON output. If a provider rejects this field, remove it:
        // extractJson below copes with plain text too.
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(8000), // never let a slow provider hang the request
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("AI request failed", res.status);
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text.trim() : null;
  } catch (e) {
    console.error("AI call error", e);
    return null;
  }
}

// Models sometimes wrap JSON in prose or code fences. Take the outermost {...} and parse it.
export function extractJson(
  text: string | null,
): Record<string, unknown> | null {
  if (!text) return null;
  const start = text.indexOf("{"),
    end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1));
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
