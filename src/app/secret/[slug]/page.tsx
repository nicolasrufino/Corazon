import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SecretCard } from "@/components/ui";
import { SECRETS, hoodBySlug, lineBySlug, secretBySlug } from "@/lib/data";

export const dynamicParams = false; // unknown slugs are real 404s
export const generateStaticParams = () => SECRETS.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: PageProps<"/secret/[slug]">): Promise<Metadata> {
  const s = secretBySlug((await params).slug);
  return s ? { title: s.title, description: s.dek, openGraph: { images: [s.photo] } } : {};
}

const day = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function SecretPage({ params }: PageProps<"/secret/[slug]">) {
  const s = secretBySlug((await params).slug);
  if (!s) notFound();
  const line = lineBySlug(s.line)!;
  const hood = hoodBySlug(s.hood)!;
  const nearby = SECRETS.filter((x) => x.slug !== s.slug && (x.hood === s.hood || x.line === s.line)).slice(0, 3);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
  const facts = [
    ["Address", s.address],
    ["Hours", s.hours],
    ["Cost", s.cost],
    ["Nearest L", s.nearestL],
  ];

  return (
    <>
      <header className="flex flex-col gap-4 px-5 pt-6 lg:gap-5 lg:px-16 lg:pt-14">
        <p className="hidden gap-2 text-sm text-muted lg:flex">
          <Link href="/" className="hover:text-ink">Home</Link> / <Link href={`/${line.slug}`} className="hover:text-ink">{line.name}</Link> /
          <Link href={`/neighborhoods/${hood.slug}`} className="font-semibold text-ink">{hood.name}</Link>
        </p>
        <p className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="size-3.5 rounded-full" style={{ background: line.color }} />
          {line.train} Line · {line.name} · {hood.name}
        </p>
        <h1 className="max-w-[1100px] font-display text-[40px] leading-[1.02] tracking-[-0.02em] lg:text-[88px] lg:leading-none">{s.title}</h1>
        <p className="text-muted lg:text-xl">{s.dek}</p>
      </header>

      <div className="relative mt-6 h-[300px] lg:mx-16 lg:mt-10 lg:h-[620px] lg:overflow-hidden lg:rounded">
        <Image src={s.photo} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="flex flex-col gap-10 px-5 py-8 lg:flex-row lg:gap-20 lg:px-16 lg:py-14">
        <article className="flex flex-1 flex-col gap-7">
          <p className="text-[13px] font-bold tracking-[0.12em] text-star">THE SECRET</p>
          <p className="font-display text-2xl leading-[1.35] lg:text-[32px]">{s.body[0]}</p>
          {s.body.slice(1).map((p) => (
            <p key={p} className="text-[17px] leading-[1.65] lg:text-lg">{p}</p>
          ))}
          <section className="flex flex-col gap-4 rounded-md border border-line bg-white p-5 lg:p-8">
            <h2 className="font-display text-[30px] lg:text-[36px]">How to do it</h2>
            <ol className="flex flex-col gap-3.5">
              {s.howTo.map((step, i) => (
                <li key={step} className="flex items-start gap-4 lg:text-[17px]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: line.color }}>{i + 1}</span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </section>
          {s.tip && (
            <aside className="rounded-md bg-sky/40 px-6 py-5">
              <p className="font-bold">Insider tip</p>
              <p className="mt-1 leading-relaxed">{s.tip}</p>
            </aside>
          )}
        </article>

        <aside className="self-start overflow-hidden rounded-md border-[1.5px] border-ink lg:sticky lg:top-24 lg:w-[400px]">
          <dl className="px-6 py-2">
            {facts.map(([k, v]) => (
              <div key={k} className="border-b border-line py-4 last:border-0">
                <dt className="text-xs font-semibold text-muted">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 px-6 pb-6">
            <a href={directions} target="_blank" rel="noopener noreferrer" className="rounded-full bg-star py-3.5 text-center font-bold text-white hover:bg-ink">
              Get directions
            </a>
            <p className="text-center text-[13px] text-muted">
              Verified {day(s.verified)} · <Link href="/submit" className="underline">Something changed?</Link>
            </p>
          </div>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="bg-sand px-5 py-10 lg:px-16 lg:py-[72px]">
          <h2 className="mb-6 font-display text-[34px] lg:mb-8 lg:text-[56px]">More secrets near {hood.name}</h2>
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {nearby.map((x) => (
              <SecretCard key={x.slug} secret={x} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
