import type { Customer, MatchResult } from "@/types/profile";

// hardcoded now, later this calls the AI (asynchronously)
export function draftEmail(
  customer: Customer,
  match: MatchResult,
): { subject: string; body: string } {
  return {
    subject: `A match I think you'll like, ${customer.first}`,
    body:
      `Hi ${customer.first}, I came across someone I think you'd enjoy meeting. ` +
      `${match.name} is a ${match.role} based in ${match.city}. ${match.why} ` +
      `I've put a short profile below. Tell me what you think and I'll set up an introduction.`,
  };
}
