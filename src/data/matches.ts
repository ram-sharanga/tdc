import type { MatchResult } from "@/types/profile";

// Candidates shown to FEMALE customers (so they are men).
export const matchesForFemaleCustomers: MatchResult[] = [
  {
    id: "fm1",
    name: "Arjun Sundaram",
    age: 31,
    city: "Bengaluru",
    role: "Product Manager",
    education: "IIT Madras, B.Tech",
    height: 176,
    languages: "Tamil, English",

    score: 87,
    tier: "High",

    fit: [
      { tone: "y", text: "Wants kids: Yes" },
      { tone: "y", text: "Open to relocate" },
      { tone: "y", text: "4 years older" },
      { tone: "m", text: "Earns more" },
    ],

    breakdown: [
      { name: "Kids", value: 100 },
      { name: "Relocation", value: 90 },
      { name: "Profession", value: 78 },
      { name: "Age gap", value: 85 },
      { name: "Languages", value: 80 },
    ],

    why: "Both want children and are open to moving, and Arjun's product role pairs well with a software career. Shared Tamil makes family conversations easy.",
  },

  {
    id: "fm2",
    name: "Karthik Raman",
    age: 33,
    city: "Chennai",
    role: "Data Scientist",
    education: "NIT Trichy, M.Tech",
    height: 174,
    languages: "Tamil, English",

    score: 79,
    tier: "Good",

    fit: [
      { tone: "y", text: "Wants kids: Yes" },
      { tone: "m", text: "Relocation: Maybe" },
      { tone: "y", text: "Same city" },
      { tone: "y", text: "Same field" },
    ],

    breakdown: [
      { name: "Kids", value: 100 },
      { name: "Relocation", value: 60 },
      { name: "Profession", value: 88 },
      { name: "Age gap", value: 70 },
      { name: "Languages", value: 85 },
    ],

    why: "Same city and a closely related career. Relocation is open on both sides, so it's worth confirming plans early.",
  },

  {
    id: "fm3",
    name: "Vikram Menon",
    age: 36,
    city: "Hyderabad",
    role: "Architect",
    education: "CEPT, B.Arch",
    height: 178,
    languages: "Malayalam, English",

    score: 58,
    tier: "Stretch",

    fit: [
      { tone: "m", text: "Kids: Maybe" },
      { tone: "n", text: "Different city" },
      { tone: "m", text: "8 years older" },
    ],

    breakdown: [
      { name: "Kids", value: 55 },
      { name: "Relocation", value: 45 },
      { name: "Profession", value: 50 },
      { name: "Age gap", value: 48 },
      { name: "Languages", value: 70 },
    ],

    why: "A bigger age gap and a different city, but a shared Malayalam background. Consider only if age flexibility was mentioned in the call.",
  },
];

export const matchesForMaleCustomers: MatchResult[] = [
  {
    id: "mm1",
    name: "Divya Krishnan",
    age: 28,
    city: "Pune",
    role: "UX Designer",
    education: "NID, M.Des",
    height: 163,
    languages: "Hindi, English",

    score: 84,
    tier: "High",

    fit: [
      { tone: "y", text: "Kids: aligned" },
      { tone: "y", text: "Open to relocate" },
      { tone: "y", text: "Younger" },
      { tone: "y", text: "Earns less" },
    ],

    breakdown: [
      { name: "Kids", value: 90 },
      { name: "Relocation", value: 95 },
      { name: "Age gap", value: 85 },
      { name: "Income", value: 80 },
      { name: "Height", value: 78 },
    ],

    why: "Younger, shorter and earning slightly less, matching the preferences on file, with aligned views on children. Same city makes a first meeting easy.",
  },

  {
    id: "mm2",
    name: "Neha Joshi",
    age: 29,
    city: "Mumbai",
    role: "Doctor",
    education: "KEM, MBBS",
    height: 160,
    languages: "Marathi, Hindi",

    score: 72,
    tier: "Good",

    fit: [
      { tone: "y", text: "Wants kids: Yes" },
      { tone: "m", text: "Relocation: Maybe" },
      { tone: "y", text: "Younger" },
      { tone: "m", text: "Earns similar" },
    ],

    breakdown: [
      { name: "Kids", value: 100 },
      { name: "Relocation", value: 55 },
      { name: "Age gap", value: 80 },
      { name: "Income", value: 50 },
      { name: "Height", value: 85 },
    ],

    why: "Strong alignment on children and a comfortable age gap. Her demanding schedule and different city need a quick conversation.",
  },

  {
    id: "mm3",
    name: "Pooja Reddy",
    age: 27,
    city: "Hyderabad",
    role: "Teacher",
    education: "Osmania, M.A.",
    height: 157,
    languages: "Telugu, English",

    score: 56,
    tier: "Stretch",

    fit: [
      { tone: "m", text: "Kids: Maybe" },
      { tone: "n", text: "Not open to relocate" },
      { tone: "y", text: "Younger" },
    ],

    breakdown: [
      { name: "Kids", value: 55 },
      { name: "Relocation", value: 30 },
      { name: "Age gap", value: 90 },
      { name: "Income", value: 85 },
      { name: "Height", value: 80 },
    ],

    why: "Fits on age, height and income, but relocation is a likely sticking point.",
  },
];
