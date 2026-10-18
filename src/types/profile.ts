// const ensures no future reassignment, meaning binding cannot be modified
// as const ensures the array is readonly, meaning no modifications can be made to the array itself
export const STAGES = [
  "Onboarded",
  "Verified",
  "Profile Shared",
  "Meeting Scheduled",
  "Feedback",
  "Closed",
] as const;

// typeof elements at different indices of STAGES
// effectively Stage = "Onboarded" | "Verified" | "Profile Shared" | "Meeting Scheduled" | "Feedback" | "Closed"
export type Stage = (typeof STAGES)[number];

export type YesNoMaybe = "Yes" | "No" | "Maybe";

export interface Customer {
  id: string;
  first: string;
  last: string;
  gender: "Male" | "Female";
  dob: string;
  city: string;
  country: string;
  maritalStatus: "Never Married" | "Divorced" | "Widowed";
  stage: Stage;
  email: string;
  phone: string;
  height: number; // cm
  college: string;
  degree: string;
  income: number; // LPA
  company: string;
  designation: string;
  languages: string;
  siblings: number;
  religion: string;
  caste: string;
  kids: YesNoMaybe;
  relocate: YesNoMaybe;
  pets: YesNoMaybe;
  diet: string;
  family: string;
  matchmakerId: string;
}

export type CustomerRow = Customer & { age: number };

export type CustomerSeed = Omit<Customer, "matchmakerId">;

export interface Note {
  id: string;
  createdAt: string;
  text: string;
}

export type Tier = "High" | "Good" | "Stretch";

export interface FitChip {
  tone: "y" | "m" | "n";
  text: string;
}

export interface BreakdownItem {
  name: string;
  value: number;
}

export interface MatchResult {
  id: string; // unique per match; used for "sent" tracking
  name: string;
  age: number;
  city: string;
  role: string;
  education: string;
  height: number; // cm
  languages: string;
  score: number; // 0-100
  tier: Tier;
  fit: FitChip[];
  breakdown: BreakdownItem[];
  why: string; // natural-language explanation
}

export interface Matchmaker {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}
