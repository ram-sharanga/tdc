export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store", // never reuse an old GET response
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})); // Next's own error pages aren't JSON
    // A missing `error` field means a crash or a wrong URL, so show the status instead of a vague message.
    throw new Error(body.error ?? `Request failed (${res.status}) at ${url}`);
  }
  return res.json() as Promise<T>;
}
