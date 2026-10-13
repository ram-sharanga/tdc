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
}

// A Customer plus its computed age. The server computes age and passes this
// shape to the client, so the browser never needs the current date.
export type CustomerRow = Customer & { age: number };