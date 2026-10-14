// BEST PRACTICE: this is the only file allowed to import from "@/data".
// CLEAN CODE: Everything else calls these helper functions.
// Later can swap with a database without changing the rest of the codebase.

import { customers } from "@/data/customers";
import type { Customer } from "@/types/profile";
import type { MatchResult } from "@/types/profile";
import {
  matchesForFemaleCustomers,
  matchesForMaleCustomers,
} from "@/data/matches";

export function listCustomers(): Customer[] {
  return customers;
}

// Returns undefined when no customer has that id.
// Function caller responsible for handling loading/error states.
export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

// hardcoded now, later this runs the matching engine
export function getMatches(customer: Customer): MatchResult[] {
  return customer.gender === "Female"
    ? matchesForFemaleCustomers
    : matchesForMaleCustomers;
}
