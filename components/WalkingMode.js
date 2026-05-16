"use client";

import { useEffect, useMemo, useState } from "react";
import MapView from "./MapView";
import { useT } from "../lib/i18n";
import { haversineKm, localizeField } from "../lib/routes";

// 行走模式 — 全屏覆盖整个 PWA, 用户开始走以后看到的"操作面板"。
//
// 设计要点 (参考之前讨论, 不在这里调原生导航 — 那会破坏 citywalk 体验,
// 用户出去就看不到 stop 内容了):
// - 全屏 fixed, 层级压住 NavTabs / GlobalHeader
// - 上方: 退出 + 进度点 (1/N)
// - 中部: 地图, follow=true 默认跟随蓝点, focusIndex 跟当前 stop 走
// - 底部: stop 卡 — 序号 + 名字 + 距我多少米 + story (可滚动看完)
// - 切 stop 用上一站 / 下一站 (后续 C2 加自动到达 + 滑动)
//
// C1 阶段先把骨架走通, 以下功能延后到 C2/C3:
// - 自动到达 toast (< 50m)
// - 走完弹"完成"对话框
// - 屏幕常亮 wakeLock
// - 卡片向上拖拽展开
// - "用高德继续" 逃生按钮
export default function WalkingMode({ route, geo, heading, onExit }) {
  const { t, lang } = useT();
  const [currentIdx, setCurrentIdx] = useState(0);
  // 行走模式默认 follow, 但用户拖动地图后我们让它自然失焦; 这里我们
  // 把 follow 锁成 true — 详情页 LocateButton 那套交互暂时不用.
  // 如果用户主动拖地图, leaflet 自己会停止 follow 视觉效果; 下次切 stop
  // 又会 setView 一次, 体验上没毛病。
  const [follow, setFollow] = useState(true);

  const stops = route.stops;
  const total = stops.length;
  const current = stops[currentIdx];

  const stopName = localizeField(current, "name", lang);
  const stopStory = localizeField(current, "story", lang);

  // 用户到当前 stop 的直线距离 (米) — 不是步行距离, 但够用作"快到了"的提示
  const userPos = geo?.position?.coords;
  const distM = useMemo(() => {
    if (!userPos) return null;
    return haversineKm(userPos, current.coords) * 1000;
  }, [userPos, current.coords]);

  // 简单步行 ETA: 80 米/分钟 (城市步行均值, 含等红灯)
  const etaMin =
    distM != null ? Math.max(1, Math.round(distM / 80)) : null;

  function fmtDist(meters) {
    if (meters == null) return "—";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  function goPrev() {
    setCurrentIdx((i) => Math.max(0, i - 1));
  }
  function goNext() {
    setCurrentIdx((i) => Math.min(total - 1, i + 1));
  }
  // 切 stop 时重新打开 follow → setView 会落到下一个 stop 附近,
  // 但 follow=true 又会优先飘到用户位置。这里我们让"下一站"按钮临时关 follow,
  // 让地图先飞到 stop, 用户 5s 后再点定位按钮回到自己位置 — 简单可控。
  function goNextWithLook() {
    setFollow(false);
    goNext();
  }
  function goPrevWithLook() {
    setFollow(false);
    goPrev();
  }

  // ESC 退出 — 桌面调试方便, 移动端无影响
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onExit?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-ink-50 flex flex-col"
      style={{ position: "fixed" }}
      role="dialog"
      aria-modal="true"
    >
      {/* 顶栏 — 退出 + 进度 */}
      <div className="shrink-0 flex items-center gap-3 px-3 pt-3 pb-2 bg-ink-50/95">
        <button
          onClick={onExit}
          aria-label={t("walking.exit")}
          className="w-10 h-10 rounded-full bg-white border border-ink-200 shadow-sm flex items-center justify-center text-ink-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 6l12 12" />
            <path d="M18 6l-12 12" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-1.5">
          {stops.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFollow(false);
                setCurrentIdx(i);
              }}
              aria-label={`Stop ${i + 1}`}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentIdx
                  ? "bg-brick-500"
                  : i === currentIdx
                  ? "bg-brick-500"
                  : "bg-ink-200"
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-ink-400 tabular-nums shrink-0 w-10 text-right">
          {currentIdx + 1} / {total}
        </div>
      </div>

      {/* 地图 — flex-1, 自动占满剩余空间 */}
      <div className="flex-1 relative">
        <MapView
          stops={stops}
          walkingPath={route.walkingPath}
          focusIndex={currentIdx}
          geo={geo}
          heading={heading}
          follow={follow && geo.state === "watching"}
          setFollow={setFollow}
        />
      </div>

      {/* 底部 stop 卡 — 固定高度区, story 内部滚动 */}
      <div className="shrink-0 bg-white border-t border-ink-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="px-4 pt-3 pb-4 max-h-[40vh] flex flex-col gap-2">
          {/* 标题行 */}
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 w-6 h-6 rounded-full bg-brick-500 text-white text-xs font-semibold flex items-center justify-center">
              {currentIdx + 1}
            </span>
            <h3 className="font-serif text-lg font-semibold text-ink-800 leading-snug truncate">
              {stopName}
            </h3>
          </div>

          {/* 距离 + ETA */}
          <div className="flex items-center gap-3 text-xs text-ink-400">
            <span>{t("walking.stop.distance", { dist: fmtDist(distM) })}</span>
            {etaMin != null && (
              <>
                <span>·</span>
                <span>{t("walking.stop.eta", { min: etaMin })}</span>
              </>
            )}
          </div>

          {/* 故事 — 内部滚动, 长文也能看完 */}
          <div className="overflow-y-auto text-sm leading-relaxed text-ink-600 -mx-1 px-1">
            {stopStory}
          </div>

          {/* 上下站 */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={goPrevWithLook}
              disabled={isFirst}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-800 disabled:text-ink-300 disabled:border-ink-100 transition"
            >
              {t("walking.prev")}
            </button>
            <button
              onClick={goNextWithLook}
              disabled={isLast}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-ink-800 text-ink-50 disabled:bg-ink-200 disabled:text-ink-400 transition"
            >
              {t("walking.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
