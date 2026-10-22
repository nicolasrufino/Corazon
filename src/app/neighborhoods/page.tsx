import type { Metadata } from "next";
import Link from "next/link";
import { HOODS, secretsIn, type Hood } from "@/lib/data";

export const metadata: Metadata = { title: "Neighborhoods", description: "A local's guide to every Chicago community area." };

const REGIONS: Hood["region"][] = ["North Side", "Northwest", "West", "Central", "South", "Southwest", "Far South"];

export default function NeighborhoodsPage() {
  const regions = REGIONS.map((r) => ({ r, hoods: HOODS.filter((h) => h.region === r).sort((a, b) => a.name.localeCompare(b.name)) })).filter((g) => g.hoods.length);
  const slug = (r: string) => r.toLowerCase().replace(/\s+/g, "-");

  return (
    <>
      <header className="flex flex-col gap-3 px-5 pt-7 lg:gap-4 lg:px-16 lg:pt-[72px]">
        <h1 className="font-display text-[52px] leading-[0.95] tracking-[-0.02em] lg:text-[130px]">{HOODS.length} neighborhoods.</h1>
        <p className="text-muted lg:text-[19px]">One local&apos;s guide to every community area in the city.</p>
      </header>
      {/* ponytail: region chips are in-page anchors, no filtering state needed */}
      <nav className="sticky top-[61px] z-10 flex gap-2 overflow-x-auto bg-paper px-5 py-5 lg:top-[85px] lg:px-16">
        {regions.map(({ r }) => (
          <a key={r} href={`#${slug(r)}`} className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink">{r}</a>
        ))}
      </nav>
      <div className="grid gap-x-12 gap-y-10 px-5 pb-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-16 lg:pb-24">
        {regions.map(({ r, hoods }) => (
          <section key={r} id={slug(r)} className="scroll-mt-40">
            <h2 className="text-xs font-bold tracking-[0.1em] text-star uppercase">{r}</h2>
            <ul>
              {hoods.map((h) => (
                <li key={h.slug}>
                  <Link href={`/neighborhoods/${h.slug}`} className="group flex items-center justify-between border-b border-line py-4">
                    <span className="font-display text-[26px] group-hover:italic">{h.name}</span>
                    <span className="text-[13px] text-muted">{secretsIn(h.slug).length} secrets</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
