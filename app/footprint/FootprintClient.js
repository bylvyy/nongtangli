"use client";

import Link from "next/link";
import RouteCard from "../../components/RouteCard";
import { useFootprint } from "../../lib/useFootprint";
import { computeStats, computeBadges } from "../../lib/footprint";

export default function FootprintClient({ routes }) {
  const fp = useFootprint();
  const stats = computeStats(fp, routes);
  const badges = computeBadges(fp, routes);

  const walkedRoutes = routes.filter((r) => fp.walked.includes(r.id));
  const wishedRoutes = routes.filter((r) => fp.wishlist.includes(r.id));

  // 下一个解锁条件提示
  const nextBadge = (() => {
    if (stats.routeCount < 5)
      return `走完 5 条解锁「上海漫游者」(还差 ${5 - stats.routeCount} 条)`;
    if (stats.routeCount < 10)
      return `走完 10 条解锁「深度漫游者」(还差 ${10 - stats.routeCount} 条)`;
    return null;
  })();

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-400">
        每次打开都能看到自己走到了哪里。
      </p>

      {/* 统计卡 */}
      <div className="rounded-2xl bg-ink-800 text-ink-50 p-5">
        <div className="grid grid-cols-3 gap-4 font-serif">
          <div>
            <div className="text-3xl font-bold">{stats.routeCount}</div>
            <div className="text-xs text-ink-200 mt-1">路线</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.distanceKm}</div>
            <div className="text-xs text-ink-200 mt-1">公里</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.stopCount}</div>
            <div className="text-xs text-ink-200 mt-1">地点</div>
          </div>
        </div>
        {nextBadge && (
          <div className="mt-4 pt-4 border-t border-ink-600 text-xs text-ink-200">
            {nextBadge}
          </div>
        )}
      </div>

      {/* 徽章 */}
      <section>
        <h2 className="font-serif text-base font-semibold text-ink-800 mb-2">
          徽章 {badges.length > 0 && `· ${badges.length}`}
        </h2>
        {badges.length === 0 ? (
          <div className="rounded-xl bg-ink-50 border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
            暂未解锁。走完 5 条路线开启第一枚徽章。
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {badges.map((b) => (
              <div
                key={b.id}
                className="px-3 py-2 rounded-xl bg-brick-500 text-ink-50"
              >
                <div className="font-serif font-semibold text-sm">{b.title}</div>
                <div className="text-[11px] opacity-90">{b.desc}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 想去清单 */}
      <section>
        <h2 className="font-serif text-base font-semibold text-ink-800 mb-2">
          想去清单 {wishedRoutes.length > 0 && `· ${wishedRoutes.length}`}
        </h2>
        {wishedRoutes.length === 0 ? (
          <div className="text-sm text-ink-400 py-4">
            还没有收藏的路线。
            <Link href="/" className="underline ml-1">
              去看看
            </Link>
          </div>
        ) : (
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
        )}
      </section>

      {/* 已走过 */}
      <section>
        <h2 className="font-serif text-base font-semibold text-ink-800 mb-2">
          已走过 {walkedRoutes.length > 0 && `· ${walkedRoutes.length}`}
        </h2>
        {walkedRoutes.length === 0 ? (
          <div className="text-sm text-ink-400 py-4">
            走完一条后回来打勾,可以累积里程和徽章。
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
