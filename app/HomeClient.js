"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RouteCard from "../components/RouteCard";
import FilterBar from "../components/FilterBar";
import { deriveIntensity } from "../lib/routes";
import { useFootprint } from "../lib/useFootprint";
import { computeStats } from "../lib/footprint";

export default function HomeClient({ newest, rest, themes, atmospheres }) {
  const [filter, setFilter] = useState({
    theme: null,
    intensity: null,
    atmosphere: null,
  });
  const [showFilter, setShowFilter] = useState(false);
  const fp = useFootprint();
  const allRoutes = [...newest, ...rest];
  const stats = computeStats(fp, allRoutes);

  const filtered = useMemo(() => {
    return rest.filter((r) => {
      if (filter.theme && r.theme !== filter.theme) return false;
      if (filter.atmosphere && r.atmosphere !== filter.atmosphere) return false;
      if (filter.intensity && deriveIntensity(r.distanceKm) !== filter.intensity)
        return false;
      return true;
    });
  }, [rest, filter]);

  const filterActive =
    filter.theme || filter.intensity || filter.atmosphere;

  return (
    <div className="space-y-5">
      {/* 上海足迹概要 */}
      <Link
        href="/footprint"
        className="block rounded-2xl bg-ink-800 text-ink-50 p-4"
      >
        <div className="text-[11px] tracking-widest text-ink-200 uppercase">
          上海足迹
        </div>
        <div className="mt-2 flex items-baseline gap-4 font-serif">
          <div>
            <div className="text-2xl font-bold">{stats.routeCount}</div>
            <div className="text-[11px] text-ink-200">条路线</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.distanceKm}</div>
            <div className="text-[11px] text-ink-200">公里</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.stopCount}</div>
            <div className="text-[11px] text-ink-200">个点位</div>
          </div>
          <div className="ml-auto text-xs text-ink-200">查看 →</div>
        </div>
      </Link>

      {/* 本周新上线 */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-lg font-semibold text-ink-800">
            本周新上线
          </h2>
          <span className="text-[11px] text-ink-400">每周 1-2 条</span>
        </div>
        <div className="space-y-3">
          {newest.map((r) => (
            <RouteCard
              key={r.id}
              route={r}
              isWalked={fp.walked.includes(r.id)}
              isWished={fp.wishlist.includes(r.id)}
            />
          ))}
        </div>
      </section>

      {/* 全部路线 */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-lg font-semibold text-ink-800">
            全部路线
          </h2>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="text-xs text-ink-400 hover:text-ink-800"
          >
            {showFilter ? "收起筛选" : "筛选"}
            {filterActive ? " ·" : ""}
          </button>
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
          {filtered.map((r) => (
            <RouteCard
              key={r.id}
              route={r}
              isWalked={fp.walked.includes(r.id)}
              isWished={fp.wishlist.includes(r.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-ink-400 py-8 text-center">
              暂无符合筛选的路线
            </div>
          )}
        </div>
      </section>

      <footer className="pt-6 pb-2 text-[11px] text-ink-400 text-center leading-relaxed">
        Citywalk 不是消费主义,所以这里没有一条路线的人均超过 300。
        <br />
        每周新增 1-2 条 · 每月至少 1 条非梧桐区路线
      </footer>
    </div>
  );
}
