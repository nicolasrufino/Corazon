import Link from "next/link";
import { LINES } from "@/lib/data";
import { MobileMenu } from "./menu";
import { Wordmark } from "./ui";

const NAV = [
  ...LINES.filter((l) => l.slug !== "live").map((l) => ({ href: `/${l.slug}`, label: l.short })),
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/map", label: "Map" },
];

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4 lg:px-16 lg:py-[22px]">
        <Wordmark />
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="font-medium hover:text-star">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Search">
            <SearchIcon />
          </Link>
          <Link href="/submit" className="hidden rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-star lg:inline-block">
            Submit a secret
          </Link>
          <button popoverTarget="menu" aria-label="Open menu" className="lg:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}

export function Footer() {
  const cols = [
    ["Lines", LINES.slice(0, 4).map((l) => [l.name, `/${l.slug}`])],
    ["More", [...LINES.slice(4).map((l) => [l.name, `/${l.slug}`]), ["Neighborhoods", "/neighborhoods"]]],
    ["Corazón", [["Submit a secret", "/submit"], ["Map", "/map"], ["Search", "/search"]]],
  ] as const;
  return (
    <footer className="mt-auto bg-night px-5 pb-10 pt-12 text-paper lg:px-16 lg:pt-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-3.5">
          <Wordmark dark />
          <p className="text-sm leading-relaxed text-dim">
            Where to, Chicago?
            <br />
            All of Chicago&apos;s secrets, in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 lg:flex lg:gap-0">
          {cols.map(([head, links]) => (
            <div key={head} className="flex flex-col gap-3 lg:w-[200px]">
              <p className="text-xs font-bold tracking-[0.1em] text-sky uppercase">{head}</p>
              {links.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm hover:text-sky">{label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-2 border-t border-[#2A2D33] pt-6 text-[13px] text-dim lg:flex-row lg:justify-between">
        <p>© 2026 Corazón · Made in Chicago</p>
        <p>Every secret checked within the last 90 days</p>
      </div>
    </footer>
  );
}
