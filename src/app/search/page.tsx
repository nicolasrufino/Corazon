import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "@/components/search-bar";
import { Star, Tag } from "@/components/ui";
import { HOODS, LINES, SECRETS, hoodBySlug } from "@/lib/data";
import { parseFilters, search, type Filters } from "@/lib/search";

export const metadata: Metadata = { title: "Search" };

const SUGGEST = ["tacos", "free", "Pilsen", "late night"];

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<div className="px-5 py-12 text-muted lg:px-16">Searching…</div>}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const f = parseFilters(await searchParams);
  const results = search(SECRETS, f, (slug) => hoodBySlug(slug)?.name ?? slug);
  const label = f.q ? ` for “${f.q}”` : "";

  return (
    <>
      <div className="flex flex-col gap-5 border-b border-line px-5 py-4 lg:px-16 lg:pt-12 lg:pb-8">
        <SearchBar q={f.q} hood={f.hoods[0]} />
        <h1 className="font-display text-[30px] lg:text-[46px]">
          {results.length} {results.length === 1 ? "secret" : "secrets"}
          {label}
        </h1>
      </div>

      {results.length === 0 ? (
        <Empty q={f.q} />
      ) : (
        <div className="flex flex-col gap-8 px-5 py-6 lg:flex-row lg:gap-14 lg:px-16 lg:pt-10 lg:pb-24">
          <FilterPanel f={f} />
          <ul className="flex-1">
            {results.map((s) => (
              <li key={s.slug} className="border-t border-line">
                <Link href={`/secret/${s.slug}`} className="group flex gap-4 py-4 lg:gap-7 lg:py-7">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded lg:h-40 lg:w-60">
                    <Image src={s.photo} alt="" fill sizes="240px" className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1.5 lg:gap-2.5">
                    <Tag secret={s} />
                    <h2 className="font-display text-[21px] leading-[1.1] group-hover:underline lg:text-[34px]">{s.title}</h2>
                    <p className="hidden text-muted lg:block">{s.dek}</p>
                    <p className="text-xs font-semibold lg:text-[13px]">
                      {"$".repeat(s.price)} · {s.hours}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// GET form: filters live in the URL, so results are linkable and work without JS.
function FilterPanel({ f }: { f: Filters }) {
  const box = (name: string, value: string, checked: boolean, label: React.ReactNode) => (
    <label key={value} className="flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="size-[18px] accent-ink" />
      {label}
    </label>
  );
  const group = (title: string, children: React.ReactNode) => (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-xs font-bold tracking-[0.1em] text-muted uppercase">{title}</legend>
      {children}
    </fieldset>
  );

  return (
    <details className="group lg:w-[260px] lg:shrink-0">
      <summary className="mb-4 inline-flex cursor-pointer list-none rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper lg:hidden">
        Filters
      </summary>
      <form action="/search" className="hidden flex-col gap-8 group-open:flex lg:flex">
        {f.q && <input type="hidden" name="q" value={f.q} />}
        {group("Lines", LINES.map((l) => box("line", l.slug, f.lines.includes(l.slug), <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: l.color }} />{l.name}</span>)))}
        {group("Price", [["1", "$ · under $15"], ["2", "$$ · $15–40"], ["3", "$$$ · $40+"]].map(([v, l]) => box("price", v, f.prices.includes(Number(v)), l)))}
        {group("Neighborhood", HOODS.filter((h) => SECRETS.some((s) => s.hood === h.slug)).map((h) => box("hood", h.slug, f.hoods.includes(h.slug), h.name)))}
        <label className="flex cursor-pointer items-center justify-between border-t border-line pt-4 font-semibold">
          Open after midnight
          <input type="checkbox" name="late" value="1" defaultChecked={f.late} className="size-5 accent-[#009B3A]" />
        </label>
        <div className="flex gap-3">
          <button className="flex-1 rounded-full bg-ink py-3 font-semibold text-paper">Apply</button>
          <Link href={f.q ? `/search?q=${encodeURIComponent(f.q)}` : "/search"} className="rounded-full border border-line px-4 py-3 text-sm">Clear</Link>
        </div>
      </form>
    </details>
  );
}

function Empty({ q }: { q: string }) {
  return (
    <section className="flex flex-col items-center gap-4 px-5 py-14 text-center lg:gap-6 lg:py-24">
      <Star className="text-4xl" />
      <h2 className="font-display text-[40px] leading-none lg:text-7xl">No secret for that. Yet.</h2>
      <p className="text-muted lg:text-lg">Either nobody&apos;s found it, or it&apos;s still a secret. Try one of these instead:</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {SUGGEST.map((s) => (
          <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="rounded-full border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-paper">{s}</Link>
        ))}
      </div>
      {q && <p className="mt-6 font-semibold">Know a great {q}?</p>}
      <Link href="/submit" className="w-full rounded-full bg-star px-7 py-4 font-bold text-white sm:w-auto">Submit it as a secret</Link>
    </section>
  );
}
