import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip, Dot, SecretCard } from "@/components/ui";
import { LINES, lineBySlug, monthYear, secretsOn } from "@/lib/data";

export const dynamicParams = false; // unknown slugs are real 404s
export const generateStaticParams = () => LINES.map((l) => ({ pillar: l.slug }));

export async function generateMetadata({ params }: PageProps<"/[pillar]">): Promise<Metadata> {
  const line = lineBySlug((await params).pillar);
  return line ? { title: line.name, description: line.intro } : {};
}

export default async function PillarPage({ params }: PageProps<"/[pillar]">) {
  const line = lineBySlug((await params).pillar);
  if (!line) notFound();
  const secrets = secretsOn(line.slug).sort((a, b) => b.verified.localeCompare(a.verified));
  const hoods = new Set(secrets.map((s) => s.hood)).size;
  const latest = secrets[0]?.verified;

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-line px-5 pt-7 pb-6 lg:gap-6 lg:px-16 lg:pt-[72px] lg:pb-12">
        <p className="hidden gap-2 text-sm text-muted lg:flex">
          <Link href="/" className="hover:text-ink">Home</Link> / <span className="font-semibold text-ink">{line.name}</span>
        </p>
        <span className="flex items-center gap-2.5 self-start rounded-full py-1.5 pr-3.5 pl-1.5 text-sm font-semibold" style={{ background: `${line.color}26` }}>
          <Dot color={line.color} size={20} /> {line.train} Line
        </span>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display text-[64px] leading-[0.95] tracking-[-0.02em] lg:text-[160px]">{line.name}.</h1>
          <dl className="hidden gap-10 pb-5 lg:flex">
            {[[secrets.length, "secrets"], [hoods, "neighborhoods"], [latest ? monthYear(latest) : "—", "last verified"]].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-[46px] leading-none">{v}</dd>
                <dd className="text-[13px] text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="max-w-[640px] leading-relaxed text-muted lg:text-[19px]">{line.intro}</p>
      </header>

      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 lg:px-16 lg:py-5">
        <div className="flex gap-2 overflow-x-auto">
          <Chip href={`/${line.slug}`} active>All</Chip>
          {line.tags.map((t) => (
            <Chip key={t} href={`/search?line=${line.slug}&q=${encodeURIComponent(t)}`}>{t}</Chip>
          ))}
        </div>
        <Link href="/map" className="hidden shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper lg:block">Map view</Link>
      </div>

      <section className="grid gap-9 px-5 py-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 lg:px-16 lg:py-12">
        {secrets.map((s) => (
          <SecretCard key={s.slug} secret={s} />
        ))}
        {!secrets.length && <p className="text-muted">No secrets on this line yet. <Link href="/submit" className="underline">Know one?</Link></p>}
      </section>
    </>
  );
}
