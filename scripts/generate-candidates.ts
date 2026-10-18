import { writeFileSync } from "node:fs";
import { ROLES } from "../src/lib/roles";

// Seeded random generator: same seed, same "random" data on every run, so your tests are reproducible.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T>(a: readonly T[]): T => a[Math.floor(rand() * a.length)];
const between = (lo: number, hi: number) =>
  lo + Math.floor(rand() * (hi - lo + 1));
// Weighted pick: [value, weight] pairs. Higher weight = more likely.
function pickW<T>(items: readonly (readonly [T, number])[]): T {
  let r = rand() * items.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of items) {
    r -= w;
    if (r <= 0) return v;
  }
  return items[0][0];
}
// Box-Muller: turns uniform randomness into a bell curve (realistic heights).
const normal = (mean: number, sd: number) =>
  mean +
  sd * Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const clamp = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, x));

const MALE = [
  "Arjun",
  "Karthik",
  "Vikram",
  "Rahul",
  "Suresh",
  "Aditya",
  "Imran",
  "Rohan",
  "Naveen",
  "Siddharth",
  "Manoj",
  "Varun",
  "Faisal",
  "Harish",
  "Deepak",
  "Anand",
  "Gokul",
  "Nikhil",
];
const FEMALE = [
  "Divya",
  "Neha",
  "Pooja",
  "Lakshmi",
  "Sneha",
  "Kavya",
  "Fatima",
  "Aishwarya",
  "Meena",
  "Anjali",
  "Swathi",
  "Nandini",
  "Zainab",
  "Harini",
  "Priyanka",
  "Shruti",
  "Ritu",
  "Janani",
];
const LAST = [
  "Krishnan",
  "Raman",
  "Menon",
  "Reddy",
  "Sharma",
  "Iyer",
  "Nair",
  "Pillai",
  "Khan",
  "Joshi",
  "Patel",
  "Das",
  "Gupta",
  "Murthy",
  "Rao",
  "Kumar",
  "Singh",
  "Thomas",
];
const CITIES = [
  { city: "Chennai", tongue: "Tamil" },
  { city: "Bengaluru", tongue: "Kannada" },
  { city: "Hyderabad", tongue: "Telugu" },
  { city: "Pune", tongue: "Marathi" },
  { city: "Mumbai", tongue: "Marathi" },
  { city: "Kochi", tongue: "Malayalam" },
  { city: "Coimbatore", tongue: "Tamil" },
  { city: "Delhi", tongue: "Hindi" },
  { city: "Kolkata", tongue: "Bengali" },
  { city: "Ahmedabad", tongue: "Gujarati" },
];
const COLLEGES = [
  "IIT Madras",
  "NIT Trichy",
  "Anna University",
  "VIT Vellore",
  "BITS Pilani",
  "SRM University",
  "PSG Tech",
  "Christ University",
  "Osmania University",
  "Delhi University",
  "Jadavpur University",
  "NIT Calicut",
];
const DEGREES = [
  "B.Tech",
  "B.E.",
  "B.Com",
  "B.Sc",
  "MBA",
  "M.Tech",
  "M.Sc",
  "B.Des",
  "M.A.",
];
const COMPANIES = [
  "Zoho",
  "TCS",
  "Infosys",
  "Wipro",
  "Deloitte",
  "Freshworks",
  "Flipkart",
  "L&T",
  "Apollo Hospitals",
  "HDFC Bank",
  "Self-employed",
  "State Government",
];
const CASTES: Record<string, string[]> = {
  Hindu: [
    "Nair",
    "Iyer",
    "Pillai",
    "Reddy",
    "Mudaliar",
    "Gounder",
    "Kshatriya",
    "Brahmin",
    "Naidu",
  ],
  Muslim: ["Sheikh", "Syed", "Pathan"],
  Christian: ["Syrian Christian", "Latin Catholic"],
  Sikh: ["Jat Sikh"],
  Jain: ["Jain"],
};

let counter = 0;
function person(gender: "Male" | "Female") {
  counter += 1;
  const first = pick(gender === "Male" ? MALE : FEMALE),
    last = pick(LAST);
  const ageYears = between(23, 38);
  const where = pick(CITIES);
  const role = pick(ROLES);
  const religion = pickW([
    ["Hindu", 66],
    ["Muslim", 15],
    ["Christian", 12],
    ["Sikh", 4],
    ["Jain", 3],
  ] as const);
  const degree =
    role.title === "Doctor"
      ? "MBBS"
      : role.title === "Chartered Accountant"
        ? "CA"
        : pick(DEGREES);
  // Income grows with age and role; the noise keeps two people of the same age from being identical.
  const income = Math.max(
    3,
    Math.round((role.base + (ageYears - 23) * 0.9 + between(-2, 4)) * 10) / 10,
  );
  const languages = [
    where.tongue,
    "English",
    ...(rand() < 0.5 ? ["Hindi"] : []),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ");
  const id = `p${String(counter).padStart(3, "0")}`;
  return {
    id,
    first,
    last,
    gender,
    dob: `${2026 - ageYears}-${String(between(1, 12)).padStart(2, "0")}-${String(between(1, 28)).padStart(2, "0")}`,
    city: where.city,
    country: "India",
    maritalStatus: pickW([
      ["Never Married", 85],
      ["Divorced", 12],
      ["Widowed", 3],
    ] as const),
    email: `${first}.${last}${counter}@example.com`.toLowerCase(),
    phone: `+91 9${between(1000, 9999)} ${between(10000, 99999)}`,
    height: Math.round(
      clamp(gender === "Male" ? normal(173, 6) : normal(160, 5), 145, 195),
    ),
    college: pick(COLLEGES),
    degree,
    income,
    company: pick(COMPANIES),
    designation: role.title,
    languages,
    siblings: between(0, 3),
    religion,
    caste: pick(CASTES[religion]),
    kids: pickW([
      ["Yes", 45],
      ["Maybe", 35],
      ["No", 20],
    ] as const),
    relocate: pickW([
      ["Yes", 35],
      ["Maybe", 40],
      ["No", 25],
    ] as const),
    pets: pickW([
      ["Yes", 40],
      ["Maybe", 30],
      ["No", 30],
    ] as const),
    diet: pickW([
      ["Vegetarian", 40],
      ["Non-Vegetarian", 45],
      ["Eggetarian", 10],
      ["Vegan", 5],
    ] as const),
    family: pickW([
      ["Nuclear", 60],
      ["Joint", 40],
    ] as const),
  };
}

const pool = [
  ...Array.from({ length: 150 }, () => person("Male")),
  ...Array.from({ length: 150 }, () => person("Female")),
];
writeFileSync("src/data/candidates.json", JSON.stringify(pool, null, 1));
console.log(`Wrote ${pool.length} candidates`);
