import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFilters, search } from "./search.ts";
import { validateSubmission } from "./validate.ts";

const s = (o: object) => ({ title: "", dek: "", body: [], tags: [], hood: "loop", line: "eat", price: 1, ...o }) as never;
const secrets = [
  s({ title: "Al pastor after midnight", tags: ["tacos"], hood: "pilsen", late: true }),
  s({ title: "Free museum passes", line: "save", tags: ["free"] }),
  s({ title: "Tasting menu", price: 2, hood: "pilsen" }),
];

test("search matches every word, case-insensitive, across hood names", () => {
  assert.equal(search(secrets, parseFilters({ q: "PASTOR" })).length, 1);
  assert.equal(search(secrets, parseFilters({ q: "museum free" })).length, 1);
  assert.equal(search(secrets, parseFilters({ q: "pilsen" }), (h) => h).length, 2);
});

test("filters combine with AND", () => {
  assert.equal(search(secrets, parseFilters({ hood: "pilsen", price: "2" })).length, 1);
  assert.equal(search(secrets, parseFilters({ line: ["eat", "save"], late: "1" })).length, 1);
  assert.deepEqual(parseFilters({ price: ["9", "1"] }).prices, [1]);
});

const form = (o: Record<string, string>) => (k: string) => o[k] ?? null;
const ok = { secret: "The trompo only turns after midnight", line: "eat", place: "26th St", visited: "on" };

test("validation accepts a good submission and rejects bad ones", () => {
  assert.ok(validateSubmission(form(ok)).data);
  assert.ok(validateSubmission(form({ ...ok, line: "nope" })).error);
  assert.ok(validateSubmission(form({ ...ok, email: "not-an-email" })).error);
  assert.ok(validateSubmission(form({ ...ok, visited: "" })).error);
  assert.equal(validateSubmission(form({ ...ok, website: "spam.biz" })).error, "spam");
  assert.equal(validateSubmission(form({ ...ok, secret: "x".repeat(999) })).data?.secret.length, 300);
});
