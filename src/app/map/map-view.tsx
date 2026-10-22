"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Image from "next/image";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

export type Pin = { slug: string; title: string; line: string; lineName: string; color: string; hood: string; photo: string; lat: number; lng: number };
type LineOpt = { slug: string; short: string; color: string };

// ponytail: free OpenFreeMap tiles, no API key; swap the style URL if we ever need our own
const STYLE = "https://tiles.openfreemap.org/styles/positron";
// The bundler can't resolve MapLibre's worker, so it's served from /public (copied by predev/prebuild).
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

export function MapView({ pins, lines }: { pins: Pin[]; lines: LineOpt[] }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new Map<string, maplibregl.Marker>());
  const [on, setOn] = useState(() => new Set(lines.map((l) => l.slug)));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const m = new maplibregl.Map({ container: box.current!, style: STYLE, center: [-87.67, 41.89], zoom: 11 });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.addControl(new maplibregl.GeolocateControl({}), "top-right");
    for (const p of pins) {
      const el = document.createElement("button");
      el.setAttribute("aria-label", p.title);
      el.style.cssText = `width:22px;height:22px;border-radius:999px;background:${p.color};border:3px solid #fff;box-shadow:0 1px 4px #0004;cursor:pointer`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelected(p.slug);
      });
      markers.current.set(p.slug, new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(m));
    }
    m.on("click", () => setSelected(null));
    map.current = m;
    return () => m.remove();
  }, [pins]);

  useEffect(() => {
    for (const p of pins) {
      const el = markers.current.get(p.slug)?.getElement();
      if (!el) continue;
      el.style.display = on.has(p.line) ? "" : "none";
      el.style.width = el.style.height = p.slug === selected ? "34px" : "22px";
    }
    const p = pins.find((x) => x.slug === selected);
    if (p) map.current?.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.current.getZoom(), 13) });
  }, [on, selected, pins]);

  const visible = pins.filter((p) => on.has(p.line));
  const sel = pins.find((p) => p.slug === selected);
  const toggle = (slug: string) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  return (
    <div className="flex h-[calc(100dvh-61px)] lg:h-[calc(100dvh-85px)]">
      <aside className="hidden w-[460px] shrink-0 flex-col border-r border-line lg:flex">
        <div className="flex flex-col gap-3.5 border-b border-line p-6">
          <Filters lines={lines} on={on} toggle={toggle} />
          <p className="text-[13px] font-semibold text-muted">{visible.length} secrets on the map</p>
        </div>
        <ul className="overflow-y-auto">
          {visible.map((p) => (
            <li key={p.slug}>
              <button
                onClick={() => setSelected(p.slug)}
                className="flex w-full items-center gap-4 border-b border-line px-6 py-4 text-left hover:bg-white"
                style={p.slug === selected ? { background: "#fff", boxShadow: `inset 4px 0 0 ${p.color}` } : undefined}
              >
                <span className="relative size-[84px] shrink-0 overflow-hidden rounded">
                  <Image src={p.photo} alt="" fill sizes="84px" className="object-cover" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <span className="size-2 rounded-full" style={{ background: p.color }} /> {p.lineName} · {p.hood}
                  </span>
                  <span className="font-display text-[21px] leading-[1.15]">{p.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="relative flex-1">
        <div ref={box} className="h-full w-full" />
        <div className="absolute top-4 left-4 lg:hidden">
          <Filters lines={lines} on={on} toggle={toggle} floating />
        </div>
        {sel && (
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-paper p-5 shadow-[0_-6px_24px_#0003] lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-[340px] lg:rounded-lg lg:p-0 lg:overflow-hidden">
            <div className="relative hidden h-[150px] lg:block">
              <Image src={sel.photo} alt="" fill sizes="340px" className="object-cover" />
            </div>
            <div className="flex flex-col gap-2 lg:p-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="size-2 rounded-full" style={{ background: sel.color }} /> {sel.lineName} · {sel.hood}
              </span>
              <p className="font-display text-[22px] leading-[1.1]">{sel.title}</p>
              <Link href={`/secret/${sel.slug}`} className="mt-1 rounded-full bg-star py-3 text-center font-bold text-white lg:bg-transparent lg:p-0 lg:text-left lg:text-sm lg:text-star">
                Read the secret →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Filters({ lines, on, toggle, floating }: { lines: LineOpt[]; on: Set<string>; toggle: (s: string) => void; floating?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {lines.map((l) => (
        <button
          key={l.slug}
          onClick={() => toggle(l.slug)}
          aria-pressed={on.has(l.slug)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${on.has(l.slug) ? "border-ink bg-white" : "border-line text-muted"} ${floating ? "shadow-md" : ""}`}
        >
          <span className="size-2 rounded-full" style={{ background: l.color }} /> {l.short}
        </button>
      ))}
    </div>
  );
}
