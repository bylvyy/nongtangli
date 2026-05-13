"use client";

import Link from "next/link";
import RouteCover from "./RouteCover";
import {
  deriveIntensity,
  localizeAtmosphere,
  localizeField,
  localizeIntensity,
  localizeTheme,
} from "../lib/routes";
import { useT } from "../lib/i18n";

export default function RouteCard({ route, isWalked, isWished, distanceFromMe }) {
  const { t, lang } = useT();
  const intensity = deriveIntensity(route.distanceKm);
  const name = localizeField(route, "name", lang);
  const hook = localizeField(route, "hook", lang);
  return (
    <Link
      href={`/route/${route.id}`}
      className="block rounded-2xl border border-ink-100 bg-white hover:border-ink-200 transition overflow-hidden shadow-sm"
    >
      <RouteCover route={route} className="h-44">
        <div className="absolute inset-0 p-3 flex flex-col justify-between text-ink-50">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 backdrop-blur">
              {localizeTheme(route.theme, lang)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 backdrop-blur">
              {localizeIntensity(intensity, lang)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 backdrop-blur">
              {localizeAtmosphere(route.atmosphere, lang)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] opacity-95">
            <span>{route.distanceKm} km</span>
            <span>·</span>
            <span>
              {t("card.hours", { n: Math.round(route.durationMin / 30) / 2 })}
            </span>
            <span>·</span>
            <span>
              {route.stops.length} {t("stats.stops")}
            </span>
            {typeof distanceFromMe === "number" && (
              <>
                <span>·</span>
                <span>
                  {t("card.distFromMe", { dist: formatKm(distanceFromMe) })}
                </span>
              </>
            )}
          </div>
        </div>
      </RouteCover>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-base font-semibold text-ink-800 leading-snug">
            {name}
          </h3>
          <div className="flex gap-1 shrink-0">
            {isWished && (
              <span className="text-xs text-brick-500">{t("card.wished")}</span>
            )}
            {isWalked && (
              <span className="text-xs text-moss-600">{t("card.walked")}</span>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-ink-600">{hook}</p>
      </div>
    </Link>
  );
}

function formatKm(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
