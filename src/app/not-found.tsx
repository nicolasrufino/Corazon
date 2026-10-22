import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-20 lg:gap-8 lg:py-32">
      <div className="w-full max-w-[820px] rounded-[10px] bg-[#0B0B0B] p-1.5">
        <div className="flex flex-col gap-3 rounded-md border-[1.5px] border-white/20 px-5 py-6 lg:gap-4 lg:px-9 lg:py-7">
          <div className="flex gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="size-3.5 rounded-full bg-white/15 lg:size-5" />
            ))}
          </div>
          <h1 className="text-[40px] leading-none font-bold tracking-[-0.03em] text-white lg:text-7xl">
            404 <br className="lg:hidden" />
            <span className="hidden lg:inline">· </span>Wrong stop.
          </h1>
          <p className="text-white/70 lg:text-xl">This page isn&apos;t on any line.</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className="rounded-full bg-star px-7 py-4 text-center font-bold text-white">Take me home</Link>
        <Link href="/map" className="rounded-full border-[1.5px] border-ink px-7 py-4 text-center font-semibold">Open the map</Link>
      </div>
    </section>
  );
}
