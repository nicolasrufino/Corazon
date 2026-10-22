"use client";

import { useActionState } from "react";
import { HOODS, LINES } from "@/lib/data";
import { submitSecret, type SubmitState } from "./actions";

const input = "w-full rounded-md border-[1.5px] border-line bg-white px-4 py-3.5 outline-none focus:border-ink";
const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <span className="mb-2.5 flex justify-between font-semibold">
    {children}
    {hint && <span className="text-[13px] font-normal text-muted">{hint}</span>}
  </span>
);

export function SubmitForm() {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitSecret, {});
  const v = state.values ?? {};

  return (
    // key resets defaultValues to what was just sent, so an error never wipes the form
    <form key={JSON.stringify(v)} action={action} className="flex flex-col gap-7">
      <label>
        <Label hint="Required">What&apos;s the secret?</Label>
        <input name="secret" required minLength={10} maxLength={300} defaultValue={v.secret} placeholder="e.g. The taquería on 26th only makes al pastor after midnight" className={input} />
      </label>

      <fieldset>
        <legend className="w-full"><Label hint="Required">Which line?</Label></legend>
        <div className="flex flex-wrap gap-2">
          {LINES.map((l) => (
            <label key={l.slug} className="cursor-pointer">
              <input type="radio" name="line" value={l.slug} required defaultChecked={v.line === l.slug} className="peer sr-only" />
              <span className="flex items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 py-2.5 text-sm font-semibold peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2">
                <span className="size-2.5 rounded-full" style={{ background: l.color }} /> {l.short}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-7 sm:flex-row sm:gap-4">
        <label className="flex-1">
          <Label>Where is it?</Label>
          <input name="place" required maxLength={200} defaultValue={v.place} placeholder="Address or place name" className={input} />
        </label>
        <label className="flex-1">
          <Label>Neighborhood</Label>
          <select name="hood" defaultValue={v.hood ?? ""} className={input}>
            <option value="">Pick one</option>
            {HOODS.map((h) => (
              <option key={h.slug} value={h.slug}>{h.name}</option>
            ))}
            <option value="other">Somewhere else</option>
          </select>
        </label>
      </div>

      <label>
        <Label>How do people do it?</Label>
        <textarea name="how_to" rows={4} maxLength={2000} defaultValue={v.how_to} placeholder="When to go, what to order, what to say, how much it costs…" className={input} />
      </label>

      <div className="flex flex-col gap-7 sm:flex-row sm:gap-4">
        <label className="flex-1">
          <Label hint="Optional">Your name</Label>
          <input name="name" maxLength={80} defaultValue={v.name} placeholder="For the credit" className={input} />
        </label>
        <label className="flex-1">
          <Label hint="Optional">Email</Label>
          <input name="email" type="email" maxLength={200} defaultValue={v.email} placeholder="Only to ask follow-ups" className={input} />
        </label>
      </div>

      {/* honeypot: hidden from people, bots fill it in */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" name="visited" required defaultChecked={v.visited === "on"} className="size-5 accent-ink" />
        I&apos;ve been here in the last 3 months
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-star/10 px-4 py-3 font-medium text-star">{state.error}</p>
      )}

      <button disabled={pending} className="self-start rounded-full bg-star px-9 py-4 font-bold text-white hover:bg-ink disabled:opacity-60">
        {pending ? "Sending…" : "Send my secret →"}
      </button>
    </form>
  );
}
