import type { Metadata } from "next";
import { LINES, SECRETS, hoodBySlug, lineBySlug } from "@/lib/data";
import { MapView, type Pin } from "./map-view";

export const metadata: Metadata = { title: "Map", description: "Every Chicago secret, pinned." };

export default function MapPage() {
  const pins: Pin[] = SECRETS.map((s) => {
    const line = lineBySlug(s.line)!;
    return { slug: s.slug, title: s.title, line: s.line, lineName: line.short, color: line.color, hood: hoodBySlug(s.hood)?.name ?? "", photo: s.photo, lat: s.lat, lng: s.lng };
  });
  return <MapView pins={pins} lines={LINES.map(({ slug, short, color }) => ({ slug, short, color }))} />;
}
