"use server";

import { redirect } from "next/navigation";
import { validateSubmission } from "@/lib/validate";

export type SubmitState = { error?: string; values?: Record<string, string> };

export async function submitSecret(_: SubmitState, form: FormData): Promise<SubmitState> {
  const values = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const { data, error } = validateSubmission((k) => form.get(k));
  if (error === "spam") redirect("/submit/thanks"); // don't tell bots they were caught
  if (!data) return { error, values };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: "Submissions aren't connected yet. Please try again soon.", values };

  // Server-only insert with the service key; the browser never talks to Supabase.
  const res = await fetch(`${url}/rest/v1/submissions`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error("submission insert failed", res.status, await res.text());
    return { error: "Something went wrong saving your secret. Please try again.", values };
  }
  redirect("/submit/thanks");
}
