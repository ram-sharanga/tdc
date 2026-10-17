// Fixed time zone so the server render and the browser render produce the same text.
// Without it, a server in UTC and a browser in IST disagree and React reports a hydration mismatch.
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}
