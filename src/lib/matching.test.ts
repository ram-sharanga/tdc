import { test } from "node:test";
import assert from "node:assert/strict";
import candidates from "../data/candidates.json";
import { customers } from "../data/customers";
import { rankMatches, maleFactors, femaleFactors } from "./matching";
import { age } from "@/lib/age-helper";
import type { Person } from "@/types/profile";

const TODAY = new Date("2026-10-18"); // fixed date: tests never depend on the real clock
const pool = candidates as unknown as Person[];
const asPerson = (c: (typeof customers)[number]): Person => c;
const male = asPerson(customers.find((c) => c.gender === "Male")!);
const female = asPerson(customers.find((c) => c.gender === "Female")!);

test("male customer: matches are younger, shorter and earn less", () => {
  const res = rankMatches(male, pool, TODAY, 1000);
  assert.ok(res.length > 0);
  for (const r of res) {
    assert.ok(age(r.candidate.dob, TODAY) < age(male.dob, TODAY));
    assert.ok(r.candidate.height < male.height);
    assert.ok(r.candidate.income < male.income);
  }
});

test("never returns the same gender; scores in range and sorted", () => {
  for (const c of [male, female]) {
    const res = rankMatches(c, pool, TODAY, 1000);
    assert.ok(res.every((r) => r.candidate.gender !== c.gender));
    assert.ok(res.every((r) => r.score >= 0 && r.score <= 100));
    assert.deepEqual(
      res.map((r) => r.score),
      res.map((r) => r.score).sort((a, b) => b - a),
    );
  }
});

test("weights sum to 1 for both factor sets", () => {
  const sum = (f: { weight: number }[]) =>
    Math.round(f.reduce((s, x) => s + x.weight, 0) * 1000) / 1000;
  assert.equal(
    sum(maleFactors(male, pool.find((p) => p.gender === "Female")!, TODAY)),
    1,
  );
  assert.equal(
    sum(femaleFactors(female, pool.find((p) => p.gender === "Male")!, TODAY)),
    1,
  );
});

test("pure: same input, same output; the pool is not mutated", () => {
  const before = JSON.stringify(pool);
  assert.deepEqual(
    rankMatches(female, pool, TODAY),
    rankMatches(female, pool, TODAY),
  );
  assert.equal(JSON.stringify(pool), before);
});
