import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SecretCard } from "@/components/ui";
import { HERO_PHOTO, HOODS, LINES, hoodBySlug, secretsIn } from "@/lib/data";

export const dynamicParams = false; // unknown slugs are real 404s
export const generateStaticParams = () => HOODS.map((h) => ({ slug: h.slug }));

export async function generateMetadata({ params }: PageProps<"/neighborhoods/[slug]">): Promise<Metadata> {
  const h = hoodBySlug((await params).slug);
  return h ? { title: h.name, description: `Local secrets in ${h.name}, Chicago.` } : {};
}

export default async function HoodPage({ params }: PageProps<"/neighborhoods/[slug]">) {
  const hood = hoodBySlug((await params).slug);
  if (!hood) notFound();
  const secrets = secretsIn(hood.slug);
  const lines = LINES.map((l) => ({ ...l, n: secrets.filter((s) => s.line === l.slug).length })).filter((l) => l.n);
  const others = HOODS.filter((h) => h.region === hood.region && h.slug !== hood.slug).slice(0, 4);
  const facts = [
    ["Nearest L", hood.nearestL],
    ["Known for", hood.knownFor],
    ["Best time", hood.bestTime],
    ["Secrets here", `${secrets.length} across ${lines.length} lines`],
  ].filter(([, v]) => v);

  return (
    <>
      <section className="relative flex h-[380px] flex-col justify-end gap-2 px-5 pb-6 text-white lg:h-[560px] lg:gap-3 lg:px-16 lg:pb-14">
        <Image src={hood.photo ?? HERO_PHOTO} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-night/85" />
        <p className="relative text-xs font-bold tracking-[0.12em] uppercase lg:text-[13px]">
          {hood.kicker ?? hood.region} · Community area {hood.area}
        </p>
        <h1 className="relative font-display text-[96px] leading-[0.9] tracking-[-0.02em] lg:text-[180px]">{hood.name}</h1>
      </section>

      <dl className="grid border-b border-line px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-16">
        {facts.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-line py-3 sm:block sm:border-0 lg:py-6">
            <dt className="text-xs font-semibold text-muted">{k}</dt>
            <dd className="text-sm font-semibold sm:mt-1.5 lg:text-[17px]">{v}</dd>
          </div>
        ))}
      </dl>

      {hood.take && (
        <section className="flex flex-col gap-3 px-5 py-8 lg:flex-row lg:gap-20 lg:px-16 lg:py-[72px]">
          <h2 className="text-xs font-bold tracking-[0.12em] text-star uppercase lg:w-[360px] lg:font-display lg:text-[56px] lg:font-normal lg:tracking-normal lg:text-ink lg:normal-case">The local&apos;s take</h2>
          <p className="flex-1 font-display text-2xl leading-[1.3] lg:text-[32px]">{hood.take}</p>
        </section>
      )}

      <section className="px-5 pb-12 lg:px-16 lg:pb-[72px]">
        <div className="mb-6 flex gap-5 overflow-x-auto border-b border-line lg:mb-8 lg:gap-7">
          <span className="shrink-0 border-b-2 border-ink pb-3 font-bold">All {secrets.length}</span>
          {lines.map((l) => (
            <Link key={l.slug} href={`/search?hood=${hood.slug}&line=${l.slug}`} className="flex shrink-0 items-center gap-2 pb-3 font-medium text-muted hover:text-ink">
              <span className="size-2.5 rounded-full" style={{ background: l.color }} /> {l.short} {l.n}
            </Link>
          ))}
        </div>
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {secrets.map((s) => (
            <SecretCard key={s.slug} secret={s} />
          ))}
        </div>
        {!secrets.length && (
          <p className="text-muted">
            No secrets in {hood.name} yet. <Link href="/submit" className="underline">Know one?</Link>
          </p>
        )}
      </section>

      {others.length > 0 && (
        <nav className="flex flex-wrap items-center gap-4 bg-sky px-5 py-8 lg:px-16 lg:py-12">
          <span className="font-display text-[32px]">Next stop:</span>
          {others.map((h) => (
            <Link key={h.slug} href={`/neighborhoods/${h.slug}`} className="rounded-full bg-white/55 px-4 py-2.5 font-semibold hover:bg-white">
              {h.name} →
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
