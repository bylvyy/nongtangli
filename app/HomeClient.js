"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RouteCard from "../components/RouteCard";
import FilterBar from "../components/FilterBar";
import { deriveIntensity, nearestStopDistanceKm } from "../lib/routes";
import { useFootprint } from "../lib/useFootprint";
import { useGeolocation } from "../lib/useGeolocation";
import { computeStats } from "../lib/footprint";
import { useT } from "../lib/i18n";

export default function HomeClient({ newest, rest, themes, atmospheres }) {
  const { t } = useT();
  const [filter, setFilter] = useState({
    theme: null,
    intensity: null,
    atmosphere: null,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("default"); // 'default' | 'distance'
  const fp = useFootprint();
  const geo = useGeolocation();
  const allRoutes = [...newest, ...rest];
  const stats = computeStats(fp, allRoutes);

  const userPoint = geo?.position?.coords;

  // 给每条路线算一次最近距离(没定位则为 null)。
  // newest 和 rest 都算 — 卡片在定位可用时一直展示「距我」, 不用先点「按距离」。
  const newestWithDistance = useMemo(() => {
    if (!userPoint) return newest.map((r) => ({ route: r, distanceKm: null }));
    return newest.map((r) => ({
      route: r,
      distanceKm: nearestStopDistanceKm(r, userPoint),
    }));
  }, [newest, userPoint]);
  const restWithDistance = useMemo(() => {
    if (!userPoint) return rest.map((r) => ({ route: r, distanceKm: null }));
    return rest.map((r) => ({
      route: r,
      distanceKm: nearestStopDistanceKm(r, userPoint),
    }));
  }, [rest, userPoint]);

  const filtered = useMemo(() => {
    let list = restWithDistance.filter(({ route: r }) => {
      if (filter.theme && r.theme !== filter.theme) return false;
      if (filter.atmosphere && r.atmosphere !== filter.atmosphere) return false;
      if (filter.intensity && deriveIntensity(r.distanceKm) !== filter.intensity)
        return false;
      return true;
    });
    if (sortBy === "distance" && userPoint) {
      list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }, [restWithDistance, filter, sortBy, userPoint]);

  const filterActive =
    filter.theme || filter.intensity || filter.atmosphere;

  function onSortDistance() {
    if (sortBy === "distance") {
      setSortBy("default");
      return;
    }
    if (geo.state === "idle") geo.start();
    setSortBy("distance");
  }

  const distanceLabel = (() => {
    if (sortBy !== "distance") return t("home.sortByDistance");
    if (geo.state === "requesting") return t("home.sortByDistance.locating");
    if (geo.state === "denied") return t("home.sortByDistance.denied");
    if (geo.state === "unsupported") return t("home.sortByDistance.unsupported");
    if (geo.state === "error") return t("home.sortByDistance.error");
    if (geo.state === "watching") return t("home.sortByDistance.active");
    return t("home.sortByDistance");
  })();

  return (
    <div className="space-y-5">
      {/* 上海足迹概要 */}
      <Link
        href="/footprint"
        className="block rounded-2xl bg-ink-800 p-5 hover:bg-ink-700 transition group shadow-sm"
      >
        <div className="flex items-baseline justify-between">
          <div className="text-xs text-ink-50/60 tracking-wide">
            {t("home.myFootprint")}
          </div>
          <div className="text-xs text-ink-50/60 group-hover:text-ink-50 transition">
            {t("nav.viewAll")}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 font-serif">
          <div>
            <div className="text-3xl font-semibold text-ink-50 leading-none tabular-nums">
              {stats.routeCount}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-50/50">
              {t("stats.routes")}
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-ink-50 leading-none tabular-nums">
              {stats.distanceKm}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-50/50">
              {t("stats.km")}
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-ink-50 leading-none tabular-nums">
              {stats.stopCount}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-50/50">
              {t("stats.stops")}
            </div>
          </div>
        </div>
      </Link>

      {/* 本周新上线 */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-lg font-semibold text-ink-800">
            {t("home.thisWeek")}
          </h2>
          <span className="text-[11px] text-ink-400">
            {t("home.thisWeek.note")}
          </span>
        </div>
        <div className="space-y-3">
          {newestWithDistance.map(({ route: r, distanceKm }) => (
            <RouteCard
              key={r.id}
              route={r}
              isWalked={fp.walked.includes(r.id)}
              isWished={fp.wishlist.includes(r.id)}
              distanceFromMe={
                typeof distanceKm === "number" ? distanceKm : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* 全部路线 */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-lg font-semibold text-ink-800">
            {t("home.allRoutes")}
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={onSortDistance}
              className={`hover:text-ink-800 transition ${
                sortBy === "distance" ? "text-brick-500 font-medium" : "text-ink-400"
              }`}
            >
              {distanceLabel}
            </button>
            <span className="text-ink-200">|</span>
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="text-ink-400 hover:text-ink-800"
            >
              {showFilter ? t("home.filter.collapse") : t("home.filter")}
              {filterActive ? " ·" : ""}
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="mb-3">
            <FilterBar
              themes={themes}
              atmospheres={atmospheres}
              active={filter}
              onChange={setFilter}
            />
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(({ route: r, distanceKm }) => (
            <RouteCard
              key={r.id}
              route={r}
              isWalked={fp.walked.includes(r.id)}
              isWished={fp.wishlist.includes(r.id)}
              distanceFromMe={
                typeof distanceKm === "number" ? distanceKm : undefined
              }
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-ink-400 py-8 text-center">
              {t("home.filter.empty")}
            </div>
          )}
        </div>
      </section>

      <footer className="pt-6 pb-2 text-[11px] text-ink-400 text-center leading-relaxed">
        {t("app.footer.principle")}
        <br />
        {t("app.footer.cadence")}
      </footer>
    </div>
  );
}
