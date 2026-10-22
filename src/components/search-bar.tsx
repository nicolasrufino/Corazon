import { HOODS } from "@/lib/data";

// Plain GET form: works without JS and gives every search a shareable URL.
export function SearchBar({ q = "", hood = "", light = false }: { q?: string; hood?: string; light?: boolean }) {
  return (
    <form action="/search" role="search" className={`flex w-full items-center gap-2 rounded-full p-2 ${light ? "bg-paper" : "border-[1.5px] border-ink bg-white"}`}>
      <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">Search</span>
        <input name="q" defaultValue={q} placeholder="Tacos after midnight, vintage, free museum days…" className="w-full min-w-0 bg-transparent py-2 text-[17px] outline-none placeholder:text-muted" />
      </label>
      <select name="hood" defaultValue={hood} aria-label="Neighborhood" className="hidden border-l border-line bg-transparent px-4 py-2 font-medium outline-none md:block">
        <option value="">All neighborhoods</option>
        {HOODS.map((h) => (
          <option key={h.slug} value={h.slug}>{h.name}</option>
        ))}
      </select>
      <button className="shrink-0 rounded-full bg-star px-6 py-3.5 font-bold text-white hover:bg-ink">Find it</button>
    </form>
  );
}
