"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./MapView";
import { useT } from "../lib/i18n";
import { haversineKm, localizeField } from "../lib/routes";
import { toggleWalked, getFootprint } from "../lib/footprint";

// 行走模式 — 全屏覆盖整个 PWA, 用户开始走以后看到的"操作面板"。
//
// 设计要点 (参考之前讨论, 不在这里调原生导航 — 那会破坏 citywalk 体验,
// 用户出去就看不到 stop 内容了):
// - 全屏 fixed, 层级压住 NavTabs / GlobalHeader
// - 上方: 退出 + 进度点 (1/N)
// - 中部: 地图, follow=true 默认跟随蓝点, focusIndex 跟当前 stop 走
// - 底部: stop 卡 — 序号 + 名字 + 距我多少米 + story (可滚动看完)
// - 切 stop 用上一站 / 下一站 + 左右 swipe
//
// C2 加入:
// - 自动到达判定 (< 50m): 一次性 toast + "已到达"标识 + "下一站"按钮高亮
// - "快到了" (< 200m) 文案
// - 横滑卡片切 stop
// - 走到最后一站并到达 → 弹"记录路线?"对话框 (走过/暂不)
//
// C3 还会加: wakeLock, "用高德继续"逃生
const ARRIVED_M = 50;
const NEAR_M = 200;

export default function WalkingMode({ route, geo, heading, onExit }) {
  const { t, lang } = useT();
  const [currentIdx, setCurrentIdx] = useState(0);
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

  const arrived = distM != null && distM < ARRIVED_M;
  const arriving = distM != null && distM >= ARRIVED_M && distM < NEAR_M;

  // 已经到过的 stops — 一旦到达就记下, 即使后续 GPS 飘走也不再回退提示
  const [arrivedSet, setArrivedSet] = useState(() => new Set());
  // 走完弹窗
  const [completeOpen, setCompleteOpen] = useState(false);
  // 完成对话框只弹一次, 用户"暂不"后这次行走不再弹
  const [completeShown, setCompleteShown] = useState(false);
  // 一次性到达 toast — 同一 stop 不重复
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  // 到达检测 — 当前 stop 进入 50m 范围, 触发一次提示
  useEffect(() => {
    if (!arrived) return;
    if (arrivedSet.has(currentIdx)) return;
    setArrivedSet((s) => new Set(s).add(currentIdx));
    showToast(t("walking.toast.arrived", { name: stopName }));
    // 最后一站到达 → 弹完成对话框 (只弹一次)
    if (currentIdx === total - 1 && !completeShown) {
      setCompleteShown(true);
      setCompleteOpen(true);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [arrived, currentIdx, total, stopName, completeShown, t]);

  // 卸载时清 timer
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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
      if (e.key === "Escape") {
        if (completeOpen) setCompleteOpen(false);
        else onExit?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, completeOpen]);

  // 横向滑动切 stop — 在底部 stop 卡上 touchstart/touchend
  // 需求阈值 60px, 防止下拉滚 story 时误触
  const touchRef = useRef({ x: 0, y: 0, active: false });
  function onTouchStart(e) {
    const t0 = e.touches[0];
    touchRef.current = { x: t0.clientX, y: t0.clientY, active: true };
  }
  function onTouchEnd(e) {
    const tr = touchRef.current;
    if (!tr.active) return;
    touchRef.current.active = false;
    const t1 = e.changedTouches[0];
    const dx = t1.clientX - tr.x;
    const dy = t1.clientY - tr.y;
    if (Math.abs(dx) < 60) return;
    if (Math.abs(dy) > Math.abs(dx)) return; // 主要是竖向滑动 → 让 story 滚
    if (dx < 0) goNextWithLook();
    else goPrevWithLook();
  }

  function onConfirmComplete() {
    // toggleWalked 是幂等 toggle — 但只有未标记时才加, 防止重复点击
    const state = getFootprint();
    if (!state.walked.includes(route.id)) {
      toggleWalked(route.id);
    }
    setCompleteOpen(false);
    onExit?.();
  }

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;
  const nextLabel = arrived ? t("walking.next.arrived") : t("walking.next");

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
                arrivedSet.has(i)
                  ? "bg-brick-500"
                  : i === currentIdx
                  ? "bg-brick-500/60"
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

      {/* 到达 toast — 浮在地图上方 */}
      {toast && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-[1100]">
          <div className="px-4 py-2.5 rounded-full bg-brick-500 text-white text-sm font-medium shadow-lg max-w-[80vw] text-center">
            {toast}
          </div>
        </div>
      )}

      {/* 底部 stop 卡 — 固定高度区, story 内部滚动 */}
      <div
        className="shrink-0 bg-white border-t border-ink-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="px-4 pt-3 pb-4 max-h-[40vh] flex flex-col gap-2">
          {/* 标题行 */}
          <div className="flex items-baseline gap-2">
            <span
              className={`shrink-0 w-6 h-6 rounded-full text-white text-xs font-semibold flex items-center justify-center ${
                arrivedSet.has(currentIdx) || arrived
                  ? "bg-brick-500"
                  : "bg-brick-500/70"
              }`}
            >
              {currentIdx + 1}
            </span>
            <h3 className="font-serif text-lg font-semibold text-ink-800 leading-snug truncate">
              {stopName}
            </h3>
          </div>

          {/* 距离 + ETA — 到达后变文字, 接近时换"快到了" */}
          <div className="flex items-center gap-3 text-xs">
            {arrived ? (
              <span className="text-brick-500 font-semibold">
                {t("walking.stop.arrived")}
              </span>
            ) : arriving ? (
              <>
                <span className="text-brick-500 font-medium">
                  {t("walking.stop.arriving")}
                </span>
                <span className="text-ink-400">·</span>
                <span className="text-ink-400">
                  {t("walking.stop.distance", { dist: fmtDist(distM) })}
                </span>
              </>
            ) : (
              <>
                <span className="text-ink-400">
                  {t("walking.stop.distance", { dist: fmtDist(distM) })}
                </span>
                {etaMin != null && (
                  <>
                    <span className="text-ink-400">·</span>
                    <span className="text-ink-400">
                      {t("walking.stop.eta", { min: etaMin })}
                    </span>
                  </>
                )}
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
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                arrived && !isLast
                  ? "bg-brick-500 text-white"
                  : "bg-ink-800 text-ink-50 disabled:bg-ink-200 disabled:text-ink-400"
              }`}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>

      {/* 完成对话框 — 走到最后一站且到达后弹一次 */}
      {completeOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/50 flex items-end sm:items-center justify-center px-4 pb-6">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl">
            <h2 className="font-serif text-lg font-semibold text-ink-800">
              {t("walking.complete.title")}
            </h2>
            <p className="mt-1.5 text-sm text-ink-600">
              {t("walking.complete.subtitle")}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCompleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-800"
              >
                {t("walking.complete.skip")}
              </button>
              <button
                onClick={onConfirmComplete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brick-500 text-white"
              >
                {t("walking.complete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
