"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./MapView";
import { useT } from "../lib/i18n";
import { haversineKm, localizeField } from "../lib/routes";
import { pointWgsToGcj } from "../lib/coords";
import { toggleWalked, getFootprint } from "../lib/footprint";
import { distanceAlongPath, findNextTurn } from "../lib/pathDistance";

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
// C3-1 加入:
// - "距我"和 ETA 改用沿步行轨迹的距离 (route.walkingPath), 而非直线
// - wakeLock 保持屏幕常亮, 切后台再回来自动重新申请
//
// C3-A 加入:
// - 转弯级指引: 沿轨迹扫前方第一个明显转弯 (>30°), 顶部条显示
//   "前方 80m 左转/右转/直行 N m 到达". <25m 时升级为"即将转弯"红色急迫态.
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

  // 用户到当前 stop 的距离 (米)。
  //
  // 优先用步行轨迹算 (route.walkingPath, GCJ-02): 把用户和 stop 都投影到轨迹,
  // 沿轨迹累加 — 这是真实可走的距离, 巷子/河道/铁路隔断时比直线大 1.5-2x。
  // 没有轨迹 (老路线还没生成) 才回退到直线 haversine。
  //
  // 关键: stops.coords 是 WGS-84, 浏览器 Geolocation 在中国返回 GCJ-02。
  // 直接 haversine 会有 ~400m 系统偏差, 50m 自动到达永远触发不了。
  // 这里把 stop 全部转成 GCJ 再算, 跟 walkingPath 同一坐标系。
  const userPos = geo?.position?.coords;
  const currentGcj = useMemo(
    () => pointWgsToGcj(current.coords),
    [current.coords],
  );
  // 到达判定用直线距离, 50m 以内地理上一定算到了 — 不依赖轨迹覆盖
  const distLineM = useMemo(() => {
    if (!userPos) return null;
    return haversineKm(userPos, currentGcj) * 1000;
  }, [userPos, currentGcj]);
  // 显示用步行距离: 沿轨迹算更接近实际"还要走多远"
  const distWalkM = useMemo(() => {
    if (!userPos || !route.walkingPath || route.walkingPath.length < 2) {
      return null;
    }
    return distanceAlongPath(route.walkingPath, userPos, currentGcj);
  }, [userPos, currentGcj, route.walkingPath]);
  // 转弯指引: 沿轨迹找用户前方第一个明显转弯
  const nextTurn = useMemo(() => {
    if (!userPos || !route.walkingPath || route.walkingPath.length < 3) {
      return null;
    }
    return findNextTurn(route.walkingPath, userPos, currentGcj);
  }, [userPos, currentGcj, route.walkingPath]);
  // UI 展示的距离: 优先步行距离, 没有轨迹/算不出时回退直线
  const distM = distWalkM != null ? distWalkM : distLineM;

  // 步行 ETA: 80 米/分钟 (城市步行均值, 含等红灯)
  const etaMin =
    distM != null ? Math.max(1, Math.round(distM / 80)) : null;

  // 到达判定一律用直线 — 步行距离会比直线大, 用步行判定会让真实"已到"被误判为"还差几十米"
  const arrived = distLineM != null && distLineM < ARRIVED_M;
  const arriving =
    distLineM != null && distLineM >= ARRIVED_M && distLineM < NEAR_M;

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

  // 屏幕常亮 — 进入行走模式后保持屏幕不息屏, 用户走多久看多久。
  // iOS 16.4+ / Android Chrome / 桌面 Chrome 都支持; 老 iOS Safari 不支持就静默跳过。
  // 切到后台 (visibilitychange hidden) 时锁会被系统自动 release, 切回前台需要重新 request。
  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let sentinel = null;
    let cancelled = false;

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        // 系统主动释放 (切后台/低电量) 时记录, 回前台再 acquire
        sentinel.addEventListener("release", () => {
          sentinel = null;
        });
      } catch {
        // 用户拒绝 / 浏览器策略阻止 — 静默, 不影响主流程
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible" && !sentinel) acquire();
    }

    acquire();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (sentinel) {
        sentinel.release().catch(() => {});
        sentinel = null;
      }
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

  // 转弯指引文案 + 视觉. 已经到达当前 stop 就不再显示, 没意义.
  const turnHint = useMemo(() => {
    if (arrived || !nextTurn) return null;
    const { kind, distM: turnDistM } = nextTurn;
    const fmt = fmtDist(turnDistM);
    // imminent 仅对 turn 有意义, straight 不该急迫
    const imminent = (kind === "turn-left" || kind === "turn-right") && turnDistM < 25;
    if (kind === "turn-left") {
      return {
        kind,
        imminent,
        text: imminent
          ? t("walking.turn.left.imminent")
          : t("walking.turn.left", { dist: fmt }),
      };
    }
    if (kind === "turn-right") {
      return {
        kind,
        imminent,
        text: imminent
          ? t("walking.turn.right.imminent")
          : t("walking.turn.right", { dist: fmt }),
      };
    }
    if (kind === "straight") {
      // 离 stop 太近 (< 30m) 时直接说"快到了" — 由 arriving 那一栏负责, 这里不重复
      if (turnDistM < 30) {
        return { kind, imminent: false, text: t("walking.turn.straight.short") };
      }
      return {
        kind,
        imminent: false,
        text: t("walking.turn.straight", { dist: fmt }),
      };
    }
    return null;
  }, [arrived, nextTurn, t]);

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

      {/* 转弯指引条 — 浅色 banner, 只在有 GPS + 有轨迹时出现 */}
      {turnHint && (
        <div className="shrink-0 px-3 pb-2 bg-ink-50/95">
          <div
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              turnHint.imminent
                ? "bg-brick-500 text-white"
                : "bg-ink-800 text-ink-50"
            }`}
            role="status"
            aria-live="polite"
          >
            <TurnIcon kind={turnHint.kind} className="shrink-0" />
            <span className="truncate">{turnHint.text}</span>
          </div>
        </div>
      )}

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

// 转弯方向图标 — 跟随文案变色 (默认 currentColor)
function TurnIcon({ kind, className = "" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className,
  };
  if (kind === "turn-left") {
    // 上行 → 左拐 → 上行
    return (
      <svg {...common}>
        <path d="M14 20v-7a3 3 0 0 0-3-3H6" />
        <path d="M9 7l-3 3 3 3" />
      </svg>
    );
  }
  if (kind === "turn-right") {
    return (
      <svg {...common}>
        <path d="M10 20v-7a3 3 0 0 1 3-3h5" />
        <path d="M15 7l3 3-3 3" />
      </svg>
    );
  }
  // straight: 向上箭头
  return (
    <svg {...common}>
      <path d="M12 4v16" />
      <path d="M6 10l6-6 6 6" />
    </svg>
  );
}
