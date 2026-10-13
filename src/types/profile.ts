// const ensures no future reassignment, meaning binding cannot be modified
// as const ensures the array is readonly, meaning no modifications can be made to the array itself
export const STATUSES = [
    "Onboarded",
    "Verified",
    "Profile Shared",
    "Meeting Scheduled",
    "Feedback",
    "Closed",
] as const;

// typeof elements at different indices of STATUSES
// effectively Status = "Onboarded" | "Verified" | "Profile Shared" | "Meeting Scheduled" | "Feedback" | "Closed" 
export type Status = (typeof STATUSES)[number];

export type YesNoMaybe = "Yes" | "No" | "Maybe";

export interface Customer {
    id: string;
    first: string;
    last: string;
    gender: "Male" | "Female";
    dob: string;
    city: string;
    country: string;
    marital: "Never Married" | "Divorced" | "Widowed";
    status: Status;
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