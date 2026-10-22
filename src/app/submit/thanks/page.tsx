import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Thanks" };

const STEPS = [
  ["Received", "Today"],
  ["We check it out", "Within 2 weeks"],
  ["It goes live", "With your name on it"],
];

export default function ThanksPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center lg:gap-6 lg:py-28">
      <span className="grid size-[72px] place-items-center rounded-full bg-[#009B3A] text-4xl text-white lg:size-[88px]">✓</span>
      <h1 className="font-display text-[40px] leading-[1.02] lg:text-7xl">Got it. Your secret&apos;s in the queue.</h1>
      <p className="max-w-[560px] text-muted lg:text-lg">We check every tip in person. If it makes the cut, we&apos;ll email you the day it goes live.</p>
      <ol className="my-6 hidden w-full max-w-[960px] lg:flex">
        {STEPS.map(([h, s], i) => (
          <li key={h} className="flex flex-1 flex-col items-center gap-2.5">
            <span className={`size-6 rounded-full border-[3px] ${i ? "border-muted" : "border-[#009B3A] bg-[#009B3A]"}`} />
            <span className="text-[17px] font-semibold">{h}</span>
            <span className="text-sm text-muted">{s}</span>
          </li>
        ))}
      </ol>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/submit" className="rounded-full bg-ink px-7 py-4 font-bold text-paper">Submit another</Link>
        <Link href="/" className="rounded-full border-[1.5px] border-ink px-7 py-4 font-semibold">Back to the secrets</Link>
      </div>
    </section>
  );
}
