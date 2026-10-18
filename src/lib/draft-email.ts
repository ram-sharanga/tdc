import type { Customer, EmailTemplate, MatchResult } from "@/types/profile";
import { fillTemplate, type TemplateVars } from "./templates";

export function draftEmail(
  customer: Customer,
  match: MatchResult,
  template: EmailTemplate,
  matchmakerName: string,
) {
  const vars: TemplateVars = {
    customer_first: customer.first,
    candidate_name: match.name,
    candidate_age: String(match.age),
    candidate_city: match.city,
    candidate_role: match.role,
    why: match.why,
    matchmaker_name: matchmakerName,
  };
  return {
    subject: fillTemplate(template.subject, vars),
    body: fillTemplate(template.body, vars),
  };
}
