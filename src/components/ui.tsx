import Image from "next/image";
import Link from "next/link";
import { LINES, hoodBySlug, lineBySlug, monthYear, type Secret } from "@/lib/data";

export const Star = ({ className = "" }: { className?: string }) => (
  <span aria-hidden className={`text-star ${className}`}>✶</span>
);

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Corazón home">
      <Star className="text-2xl" />
      <span className={`font-display text-[28px] leading-none ${dark ? "text-paper" : "text-ink"}`}>Corazón</span>
    </Link>
  );
}

export const Dot = ({ color, size = 10 }: { color: string; size?: number }) => (
  <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ background: color, width: size, height: size }} />
);

export const RingDot = ({ color, size = 22 }: { color: string; size?: number }) => (
  <span aria-hidden className="inline-block shrink-0 rounded-full bg-night" style={{ border: `${Math.round(size / 4)}px solid ${color}`, width: size, height: size }} />
);

export function Tag({ secret, withHood = true }: { secret: Secret; withHood?: boolean }) {
  const line = lineBySlug(secret.line)!;
  return (
    <span className="flex items-center gap-2 text-[13px] font-semibold text-muted">
      <Dot color={line.color} />
      {line.name}
      {withHood && ` · ${hoodBySlug(secret.hood)?.name}`}
    </span>
  );
}

export function SecretCard({ secret, small = false }: { secret: Secret; small?: boolean }) {
  return (
    <Link href={`/secret/${secret.slug}`} className="group flex flex-col gap-3">
      <div className={`relative overflow-hidden rounded bg-line ${small ? "h-[210px]" : "h-[240px]"}`}>
        <Image src={secret.photo} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <Tag secret={secret} />
      <h3 className="font-display text-[26px] leading-[1.1] group-hover:underline decoration-1 underline-offset-4">{secret.title}</h3>
      <p className="text-[13px] text-muted">
        {"$".repeat(secret.price)} · Verified {monthYear(secret.verified)}
      </p>
    </Link>
  );
}

export function Chip({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
    >
      {children}
    </Link>
  );
}

export const linesWithCounts = (count: (slug: string) => number) => LINES.map((l) => ({ ...l, count: count(l.slug) }));
