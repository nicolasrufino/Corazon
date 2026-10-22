import type { Secret } from "./data";

export type Filters = { q: string; lines: string[]; prices: number[]; hoods: string[]; late: boolean };

type Params = Record<string, string | string[] | undefined>;
const all = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function parseFilters(p: Params): Filters {
  return {
    q: String(all(p.q)[0] ?? "").trim().slice(0, 100),
    lines: all(p.line),
    prices: all(p.price).map(Number).filter((n) => n >= 1 && n <= 3),
    hoods: all(p.hood),
    late: all(p.late)[0] === "1",
  };
}

// ponytail: substring match over a few fields; swap for Postgres full-text once content outgrows the file
export function search(secrets: Secret[], f: Filters, hoodName: (slug: string) => string = (s) => s) {
  const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  return secrets.filter((s) => {
    if (f.lines.length && !f.lines.includes(s.line)) return false;
    if (f.prices.length && !f.prices.includes(s.price)) return false;
    if (f.hoods.length && !f.hoods.includes(s.hood)) return false;
    if (f.late && !s.late) return false;
    const hay = [s.title, s.dek, s.tags.join(" "), hoodName(s.hood), ...s.body].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
