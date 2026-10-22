import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { Dot, RingDot, SecretCard, Star, Tag } from "@/components/ui";
import { HERO_PHOTO, HOODS, LINES, SECRETS, hoodBySlug, secretsIn, secretsOn } from "@/lib/data";

const TRENDING = ["free museum", "pedway", "al pastor", "vintage"];

export default function Home() {
  const featured = SECRETS.filter((s) => s.featured);
  const [lead, ...side] = featured;
  const busyHoods = [...HOODS].sort((a, b) => secretsIn(b.slug).length - secretsIn(a.slug).length).slice(0, 8);

  return (
    <>
      {/* Hero: a CTA station sign over the platform */}
      <section className="relative flex min-h-[640px] flex-col justify-end gap-4 px-4 pb-6 lg:min-h-[max(640px,calc(100dvh-85px))] lg:items-center lg:gap-7 lg:px-16 lg:pb-16">
        <Image src={HERO_PHOTO} alt="An L train platform in Chicago" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/20 via-transparent to-night/95" />
        <div className="relative w-full max-w-[1120px] rounded-[10px] bg-[#0B0B0B] p-1.5 shadow-2xl">
          <div className="flex flex-col gap-4 rounded-md border-[1.5px] border-white/20 px-5 py-5 lg:gap-6 lg:px-10 lg:py-8">
            <div className="flex items-center gap-2 lg:gap-2.5">
              {LINES.map((l) => (
                <span key={l.slug} className="size-4 rounded-full lg:size-[26px]" style={{ background: l.color }} />
              ))}
              <span className="ml-2 hidden text-white/70 lg:inline">All lines · All neighborhoods</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <h1 className="text-[50px] leading-none font-bold tracking-[-0.035em] text-white lg:text-[104px]">
                Where to, <br className="lg:hidden" />
                Chicago?
              </h1>
              <span aria-hidden className="text-5xl text-white lg:text-8xl">→</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/15 pt-4 text-white">
              <p className="font-medium lg:text-xl">All of Chicago&apos;s secrets, in one place.</p>
              <p className="hidden text-white/70 lg:block">{SECRETS.length} secrets · checked by locals</p>
            </div>
          </div>
        </div>
        <div className="relative w-full max-w-[1120px]">
          <SearchBar light />
        </div>
        <div className="relative flex w-full max-w-[1120px] flex-wrap items-center gap-2.5">
          <span className="text-sm font-semibold text-white">Trending:</span>
          {TRENDING.map((t) => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/20">
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* The lines */}
      <section className="bg-night px-5 py-14 text-paper lg:px-16 lg:py-24">
        <div className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.12em] text-sky">EIGHT LINES, ONE CITY</p>
            <h2 className="font-display text-5xl lg:text-[82px]">Pick a line.</h2>
          </div>
          <p className="max-w-[380px] text-dim lg:text-[17px]">Every secret rides one of the lines, named after the L. Hop on wherever you&apos;re headed.</p>
        </div>
        <ul>
          {[...LINES.map((l) => ({ href: `/${l.slug}`, name: l.name, train: l.train, color: l.color, intro: l.intro, count: secretsOn(l.slug).length })), { href: "/neighborhoods", name: "Neighborhoods", train: "Brown", color: "#62361B", intro: "One local's guide for every community area.", count: HOODS.length }].map((l) => (
            <li key={l.href} className="border-t border-[#2A2D33]">
              <Link href={l.href} className="group flex items-center gap-4 py-[18px] lg:gap-8 lg:py-[26px]">
                <span className="flex items-center gap-3 lg:w-[140px]">
                  <RingDot color={l.color} />
                  <span className="hidden text-[13px] font-semibold text-dim lg:inline">{l.train} Line</span>
                </span>
                <span className="flex-1 lg:w-[420px] lg:flex-none">
                  <span className="block font-display text-[28px] group-hover:italic lg:text-5xl">{l.name}</span>
                  <span className="text-[13px] text-dim lg:hidden">{l.count} {l.href === "/neighborhoods" ? "neighborhoods" : "secrets"}</span>
                </span>
                <span className="hidden flex-1 text-dim lg:block">{l.intro}</span>
                <span className="hidden text-sm font-semibold lg:block">{l.count} {l.href === "/neighborhoods" ? "areas" : "secrets"}</span>
                <span aria-hidden className="text-xl transition group-hover:translate-x-1">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Fresh secrets */}
      <section className="px-5 py-14 lg:px-16 lg:py-24">
        <div className="mb-8 flex items-end justify-between lg:mb-10">
          <h2 className="font-display text-[42px] leading-none lg:text-[64px]">Fresh secrets this week.</h2>
          <Link href="/search" className="hidden font-semibold underline lg:block">See all {SECRETS.length} →</Link>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          {lead && (
            <Link href={`/secret/${lead.slug}`} className="group flex flex-1 flex-col gap-4">
              <div className="relative h-[260px] overflow-hidden rounded lg:h-[520px]">
                <Image src={lead.photo} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />
              </div>
              <Tag secret={lead} />
              <h3 className="font-display text-[30px] leading-[1.05] group-hover:underline lg:text-[40px]">{lead.title}</h3>
              <p className="text-muted lg:text-[17px]">{lead.dek}</p>
            </Link>
          )}
          <div className="flex flex-col gap-8 lg:w-[440px]">
            {side.map((s) => (
              <SecretCard key={s.slug} secret={s} small />
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="flex flex-col gap-10 bg-sky px-5 py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-16 lg:py-24">
        <div className="flex flex-1 flex-col gap-6">
          <h2 className="font-display text-[42px] leading-none lg:text-[64px]">
            {HOODS.length} neighborhoods.
            <br />
            Every one keeps secrets.
          </h2>
          <p className="max-w-[480px] lg:text-lg">A local&apos;s guide to each community area: where to eat, what to skip, and the block everyone else walks past.</p>
          <div className="flex max-w-[560px] flex-wrap gap-2.5">
            {busyHoods.map((h) => (
              <Link key={h.slug} href={`/neighborhoods/${h.slug}`} className="rounded-full bg-white/55 px-4 py-2 text-sm font-semibold hover:bg-white">
                {h.name}
              </Link>
            ))}
          </div>
          <Link href="/map" className="self-start rounded-full bg-ink px-7 py-4 font-bold text-paper hover:bg-star">Open the map</Link>
        </div>
        <Link href="/map" className="relative h-[260px] overflow-hidden rounded border-[1.5px] border-ink lg:h-[520px] lg:w-[600px]">
          <Image src={hoodBySlug("pilsen")!.photo!} alt="A Pilsen street" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
          <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded bg-paper px-3 py-2 text-[13px] font-semibold">
            <Dot color={LINES[0].color} /> Pilsen · {secretsIn("pilsen").length} secrets
          </span>
        </Link>
      </section>

      {/* Submit */}
      <section className="flex flex-col items-center gap-5 px-5 py-16 text-center lg:py-28">
        <Star className="text-4xl" />
        <h2 className="font-display text-[44px] leading-none lg:text-[84px]">Know a secret? Spill it.</h2>
        <p className="text-muted lg:text-lg">Tell us the spot, the order or the trick. We check every tip before it goes up.</p>
        <Link href="/submit" className="mt-2 w-full rounded-full bg-star px-8 py-4 font-bold text-white hover:bg-ink sm:w-auto">Submit a secret</Link>
      </section>
    </>
  );
}
