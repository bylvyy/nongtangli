"use client";

import Link from "next/link";
import RouteCard from "../../components/RouteCard";
import { useFootprint } from "../../lib/useFootprint";
import { computeStats, computeBadges } from "../../lib/footprint";
import { useT } from "../../lib/i18n";
import { localizeDistrict } from "../../lib/routes";

export default function FootprintClient({ routes }) {
  const { t, lang } = useT();
  const fp = useFootprint();
  const stats = computeStats(fp, routes);
  const badges = computeBadges(fp, routes);

  const walkedRoutes = routes.filter((r) => fp.walked.includes(r.id));
  const wishedRoutes = routes.filter((r) => fp.wishlist.includes(r.id));
  const isEmpty = stats.routeCount === 0 && wishedRoutes.length === 0;

  // 下一个解锁条件提示
  const nextBadge = (() => {
    if (stats.routeCount < 5)
      return t("footprint.next.5", { n: 5 - stats.routeCount });
    if (stats.routeCount < 10)
      return t("footprint.next.10", { n: 10 - stats.routeCount });
    return null;
  })();

  // 进度条:朝下一个里程碑的百分比
  const progressTo = stats.routeCount < 5 ? 5 : 10;
  const progressPct = Math.min(100, (stats.routeCount / progressTo) * 100);

  function localizeBadge(b) {
    if (b.id === "wanderer") {
      return { title: t("badge.wanderer"), desc: t("badge.wanderer.desc") };
    }
    if (b.id === "deep-walker") {
      return {
        title: t("badge.deepWalker"),
        desc: t("badge.deepWalker.desc"),
      };
    }
    if (b.id.startsWith("district-")) {
      const district = b.id.slice("district-".length);
      const localized = localizeDistrict(district, lang);
      // 从 desc 里抽走到的路线数(原 desc: "走完 XX 全部 N 条路线")
      const m = b.desc.match(/(\d+)/);
      const n = m ? Number(m[1]) : 0;
      return {
        title: t("badge.districtRegular", { district: localized }),
        desc: t("badge.districtRegular.desc", { district: localized, n }),
      };
    }
    return { title: b.title, desc: b.desc };
  }

  return (
    <div className="space-y-7">
      {/* Hero 数据区 — 深色卡片,做成有体量感的"主角" */}
      <section className="rounded-2xl bg-ink-800 p-5 shadow-sm">
        <p className="text-xs text-ink-50/60 leading-relaxed tracking-wide">
          {t("footprint.subtitle")}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 font-serif">
          <Stat value={stats.routeCount} label={t("stats.routes")} />
          <Stat value={stats.distanceKm} label={t("stats.km")} />
          <Stat value={stats.stopCount} label={t("stats.stops")} />
        </div>

        {/* 进度条 + 下一个解锁 */}
        {nextBadge && (
          <div className="mt-5">
            <div className="h-1.5 rounded-full bg-ink-50/10 overflow-hidden">
              <div
                className="h-full bg-brick-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-50/60">{nextBadge}</p>
          </div>
        )}
      </section>

      {/* 空态:整页只显示一段引导,避免一堆空板块堆叠 */}
      {isEmpty ? (
        <div className="rounded-2xl bg-white border border-dashed border-ink-200 p-8 text-center">
          <div className="font-serif text-base text-ink-800">
            {t("footprint.empty.title")}
          </div>
          <p className="mt-2 text-sm text-ink-400 leading-relaxed">
            {t("footprint.empty.body.before")}
            <Link href="/" className="text-brick-500 hover:underline">
              {t("footprint.empty.body.linkText")}
            </Link>
            {t("footprint.empty.body.after")}
          </p>
        </div>
      ) : (
        <>
          {/* 徽章 */}
          {badges.length > 0 && (
            <section>
              <SectionHeader
                title={t("footprint.section.badges")}
                count={badges.length}
              />
              <div className="grid grid-cols-2 gap-2.5">
                {badges.map((b) => {
                  const loc = localizeBadge(b);
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-brick-500/30 bg-brick-500/5 p-3"
                    >
                      <div className="font-serif text-sm font-semibold text-brick-600">
                        {loc.title}
                      </div>
                      <div className="mt-1 text-[11px] text-ink-400 leading-relaxed">
                        {loc.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 想去清单 */}
          {wishedRoutes.length > 0 && (
            <section>
              <SectionHeader
                title={t("footprint.section.wishlist")}
                count={wishedRoutes.length}
              />
              <div className="space-y-3">
                {wishedRoutes.map((r) => (
                  <RouteCard
                    key={r.id}
                    route={r}
                    isWalked={fp.walked.includes(r.id)}
                    isWished
                  />
                ))}
              </div>
            </section>
          )}

          {/* 已走过 */}
          {walkedRoutes.length > 0 && (
            <section>
              <SectionHeader
                title={t("footprint.section.walked")}
                count={walkedRoutes.length}
              />
              <div className="space-y-3">
                {walkedRoutes.map((r) => (
                  <RouteCard
                    key={r.id}
                    route={r}
                    isWalked
                    isWished={fp.wishlist.includes(r.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 引导:已用过但还没走完 */}
          {walkedRoutes.length === 0 && wishedRoutes.length > 0 && (
            <p className="text-xs text-ink-400 leading-relaxed text-center pt-2">
              {t("footprint.guide.markAfterWalk")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-3xl font-semibold text-ink-50 leading-none tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-ink-50/50">{label}</div>
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h2 className="font-serif text-base font-semibold text-ink-800">
        {title}
      </h2>
      <span className="text-[11px] text-ink-400">· {count}</span>
    </div>
  );
}
