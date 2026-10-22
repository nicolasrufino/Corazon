import type { Metadata } from "next";
import { Star } from "@/components/ui";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Submit a secret" };

const RULES = [
  ["Not on page one of Google", "Or it adds the detail Google misses."],
  ["Someone can go do it this week", "Where, when, how much."],
  ["You've been in the last 3 months", "Places change. We check anyway."],
];

export default function SubmitPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      <aside className="flex flex-col gap-4 bg-night px-5 py-8 text-paper lg:w-[560px] lg:gap-7 lg:px-16 lg:py-20">
        <Star className="hidden text-4xl lg:block" />
        <h1 className="font-display text-[44px] leading-none lg:text-[88px] lg:leading-[0.95]">
          Know a secret? <br className="hidden lg:block" />
          Spill it.
        </h1>
        <p className="text-dim lg:text-lg">We check every tip before it goes up. If yours makes it, we&apos;ll let you know.</p>
        <div className="hidden flex-col gap-5 border-t border-[#2A2D33] pt-7 lg:flex">
          <p className="text-xs font-bold tracking-[0.1em] text-sky">WHAT MAKES A SECRET</p>
          {RULES.map(([h, b], i) => (
            <div key={h} className="flex gap-4">
              <span className="font-display text-4xl text-star">{i + 1}</span>
              <div>
                <p className="text-[17px] font-semibold">{h}</p>
                <p className="text-dim">{b}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 px-5 py-8 lg:px-24 lg:py-20">
        <SubmitForm />
      </div>
    </div>
  );
}
