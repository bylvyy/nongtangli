"use client";

import { useState } from "react";
import Link from "next/link";
import MapView from "../../../components/MapView";
import PointStop from "../../../components/PointStop";
import RouteActions from "../../../components/RouteActions";
import { deriveIntensity } from "../../../lib/routes";

export default function RouteDetailClient({ route }) {
  const [focus, setFocus] = useState(null);
  const intensity = deriveIntensity(route.distanceKm);

  return (
    <div className="space-y-5 -mt-4">
      <Link
        href="/"
        className="text-xs text-ink-400 hover:text-ink-800"
      >
        ← 返回路线列表
      </Link>

      {/* 顶部信息卡 */}
      <header
        className="rounded-2xl p-5 text-ink-50"
        style={{
          background: `linear-gradient(135deg, ${route.coverColor} 0%, #23211a 100%)`,
        }}
      >
        <h1 className="font-serif text-2xl font-bold leading-snug">
          {route.name}
        </h1>
        <p className="mt-2 text-sm text-ink-100">{route.hook}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
            {route.theme}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
            {intensity}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
            {route.atmosphere}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">
            {route.district}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-100">
          <span>{route.distanceKm} km</span>
          <span>·</span>
          <span>{Math.round(route.durationMin / 30) / 2} 小时</span>
          <span>·</span>
          <span>{route.stops.length} 个点位</span>
        </div>
      </header>

      <RouteActions routeId={route.id} />

      {/* 整体路线图 */}
      <section>
        <h2 className="font-serif text-base font-semibold text-ink-800 mb-2">
          整体路线
        </h2>
        <MapView stops={route.stops} height={300} focusIndex={focus} />
        <p className="mt-2 text-[11px] text-ink-400">
          点击下方点位的 "地图定位" 可放大单点
        </p>
      </section>

      {/* 点位序列 */}
      <section>
        <h2 className="font-serif text-base font-semibold text-ink-800 mb-3">
          点位顺序
        </h2>
        <div>
          {route.stops.map((s, i) => (
            <PointStop
              key={i}
              stop={s}
              index={i}
              total={route.stops.length}
              isFocused={focus === i}
              onLocate={(idx) => {
                setFocus(idx);
                document
                  .querySelector("section")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
