"use client";

import Link from "next/link";
import { LINES } from "@/lib/data";
import { RingDot, Wordmark } from "./ui";

// ponytail: native popover handles open/close/escape; this only closes it after a link tap
export function MobileMenu() {
  return (
    <div
      id="menu"
      popover="auto"
      className="bg-night text-paper"
      onClick={(e) => (e.target as Element).closest("a") && e.currentTarget.hidePopover()}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <Wordmark dark />
        <button popoverTarget="menu" popoverTargetAction="hide" aria-label="Close menu" className="text-3xl leading-none">
          ×
        </button>
      </div>
      <form action="/search" className="px-5 pb-5">
        <input name="q" placeholder="Search secrets" className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-paper placeholder:text-dim" />
      </form>
      <nav className="px-5">
        {[...LINES.map((l) => ({ href: `/${l.slug}`, name: l.name, color: l.color })), { href: "/neighborhoods", name: "Neighborhoods", color: "#62361B" }].map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3.5 border-b border-[#2A2D33] py-3">
            <RingDot color={l.color} size={16} />
            <span className="font-display text-[28px]">{l.name}</span>
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-2.5 p-5">
        <Link href="/map" className="rounded-full border-[1.5px] border-paper py-3.5 text-center font-semibold">Open the map</Link>
        <Link href="/submit" className="rounded-full bg-star py-3.5 text-center font-bold text-white">Submit a secret</Link>
      </div>
    </div>
  );
}
