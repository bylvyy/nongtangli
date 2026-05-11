import Link from "next/link";
import { deriveIntensity } from "../lib/routes";

export default function RouteCard({ route, isWalked, isWished }) {
  const intensity = deriveIntensity(route.distanceKm);
  return (
    <Link
      href={`/route/${route.id}`}
      className="block rounded-2xl border border-ink-100 bg-white hover:border-ink-200 transition overflow-hidden"
    >
      <div
        className="h-24 relative"
        style={{
          background: `linear-gradient(135deg, ${route.coverColor} 0%, #23211a 100%)`,
        }}
      >
        <div className="absolute inset-0 p-3 flex flex-col justify-between text-ink-50">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
              {route.theme}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
              {intensity}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
              {route.atmosphere}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] opacity-90">
            <span>{route.distanceKm} km</span>
            <span>·</span>
            <span>{Math.round(route.durationMin / 30) / 2} 小时</span>
            <span>·</span>
            <span>{route.stops.length} 个点位</span>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-base font-semibold text-ink-800 leading-snug">
            {route.name}
          </h3>
          <div className="flex gap-1 shrink-0">
            {isWished && <span className="text-xs text-brick-500">·想去</span>}
            {isWalked && <span className="text-xs text-moss-600">·已走</span>}
          </div>
        </div>
        <p className="mt-1 text-sm text-ink-600">{route.hook}</p>
      </div>
    </Link>
  );
}
