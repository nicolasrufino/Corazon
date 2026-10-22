export const SUBMIT_LINES = ["eat", "drink", "shop", "go", "save", "whats-on", "live"];

export type Submission = {
  secret: string;
  line: string;
  place: string;
  hood: string;
  how_to: string;
  name: string;
  email: string;
};

type Field = (name: string) => FormDataEntryValue | null;

const text = (get: Field, name: string, max: number) => String(get(name) ?? "").trim().slice(0, max);

// Trust boundary: everything from the submit form goes through here before it is stored.
export function validateSubmission(get: Field): { data?: Submission; error?: string } {
  if (text(get, "website", 200)) return { error: "spam" }; // honeypot field, hidden from people
  const data: Submission = {
    secret: text(get, "secret", 300),
    line: text(get, "line", 20),
    place: text(get, "place", 200),
    hood: text(get, "hood", 60),
    how_to: text(get, "how_to", 2000),
    name: text(get, "name", 80),
    email: text(get, "email", 200),
  };
  if (data.secret.length < 10) return { error: "Tell us the secret in at least a sentence." };
  if (!SUBMIT_LINES.includes(data.line)) return { error: "Pick which line it belongs to." };
  if (!data.place) return { error: "Tell us where it is." };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "That email doesn't look right." };
  if (get("visited") !== "on") return { error: "We only take secrets from people who've been in the last 3 months." };
  return { data };
}
