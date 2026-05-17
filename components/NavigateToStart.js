"use client";

import { useState } from "react";
import { useT } from "../lib/i18n";

// "导航到起点" — 让用户挑用什么地图打开 + app 没装时自动降级到网页版。
//
// 设计原则:
// 1. **用户做决策前不要自动跳转** — sheet 上没有倒计时, 用户点哪个跳哪个
// 2. **用户做决策后, deeplink 失败要静默 fallback 到网页**
//    - 旧版会让 deeplink 失败用户看到空白页, 还要回 sheet 再点一次"高德网页版"
//    - 现在用户点"高德" → 1.5s 内 app 拉起就走 app, 拉不起来直接跳高德网页, 用户无感知
// 3. **每个平台只保留 2 行** (系统默认 + 高德), 因为高德行已自带 web fallback,
//    单独的"高德网页版"行没意义
//
// 平台决定第一行: iOS = Apple Maps (always installed), Android = Google Maps,
// 桌面没系统地图 → Google Maps web. 第二行永远是高德 (app 优先, 没装走网页版).
//
// 坐标系: 数据库里 stops.coords 是 WGS-84, 所有目标 URL 全部直接传 WGS 即可.
// - Apple Maps: 中国区自动转 GCJ, 不能预先转, 否则双重偏移 ~400m
// - Google Maps: 不做中国偏移 (Google 在中国大陆地图整体偏 ~500m, 这是 Google 的事)
// - 高德 app: dev=1 告诉它"我传的是 WGS", 由高德服务端转 GCJ
// - 高德 web: coordinate=wgs84 同上
// 任何一处漏写 dev=1 或 coordinate=wgs84 都会出现 ~400m 偏移, 改的时候特别注意.

function buildLinks(stop) {
  const [lat, lng] = stop.coords; // WGS-84
  const rawName = stop.name || "起点";
  const name = encodeURIComponent(rawName);

  return {
    appleMaps: `maps://?daddr=${lat},${lng}&dirflg=w&q=${name}`,
    googleMapsWeb: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
    amapAppIOS: `iosamap://path?sourceApplication=nongtangli&dname=${name}&dlat=${lat}&dlon=${lng}&dev=1&t=2`,
    amapAppAndroid: `androidamap://route/plan/?dname=${name}&dlat=${lat}&dlon=${lng}&dev=1&t=2`,
    amapWeb: `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=walk&coordinate=wgs84`,
  };
}

function detectPlatform() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

// 通用 deeplink fallback 模式:
// - 立刻发起 deeplink 跳转
// - 1.5s 内如果页面被切到后台 (visibilitychange hidden / blur / pagehide)
//   → 说明 app 拉起成功, 取消 fallback
// - 否则 1.5s 后页面还在前台 → app 没装, 跳 webFallback
//
// 1500ms 是经验值: 慢一点的 Android 设备拉起原生 app 大概 800-1200ms.
// 调短会误伤 (app 实际打开了但还没完成切换), 调长用户等太久.
function openWithFallback(deeplink, webFallback) {
  let cancelled = false;
  function cancel() {
    cancelled = true;
    cleanup();
  }
  function cleanup() {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("blur", cancel);
    window.removeEventListener("pagehide", cancel);
  }
  function onVis() {
    if (document.hidden) cancel();
  }
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("blur", cancel);
  window.addEventListener("pagehide", cancel);

  // 1.5s 后还在前台 → app 没装
  setTimeout(() => {
    cleanup();
    if (!cancelled && !document.hidden) {
      window.location.href = webFallback;
    }
  }, 1500);

  // 发起 deeplink — 用 location.href 而非 window.open, 避免新 tab 残留
  window.location.href = deeplink;
}

export default function NavigateToStart({ route }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const start = route?.stops?.[0];
  if (!start) return null;

  const links = buildLinks(start);
  const platform = detectPlatform();

  // 每个 option:
  // { key, label, sublabel, action: () => void }
  // action 内部决定怎么跳 (单纯 web / app+fallback / 新 tab)
  const options = [];
  if (platform === "ios") {
    options.push({
      key: "apple",
      label: t("nav.option.appleMaps.label"),
      sublabel: t("nav.option.appleMaps.sub"),
      action: () => {
        // Apple Maps 是 iOS 内置 app, 一定能拉起, 不需要 fallback
        window.location.href = links.appleMaps;
      },
    });
    options.push({
      key: "amap",
      label: t("nav.option.amapApp.label"),
      sublabel: t("nav.option.amapApp.sub"),
      action: () => openWithFallback(links.amapAppIOS, links.amapWeb),
    });
  } else if (platform === "android") {
    options.push({
      key: "google",
      label: t("nav.option.googleMaps.label"),
      sublabel: t("nav.option.googleMaps.sub"),
      action: () => {
        // Android 上 https://www.google.com/maps/... 是 app link,
        // 装了 Google Maps app 会自动用 app 打开; 没装就开浏览器.
        // 系统级 fallback, 不需要 JS 手动处理.
        window.location.href = links.googleMapsWeb;
      },
    });
    options.push({
      key: "amap",
      label: t("nav.option.amapApp.label"),
      sublabel: t("nav.option.amapApp.sub"),
      action: () => openWithFallback(links.amapAppAndroid, links.amapWeb),
    });
  } else {
    // 桌面: 没原生 app, 都是 web. 新 tab 打开, 用户回得来.
    options.push({
      key: "google",
      label: t("nav.option.googleMaps.label"),
      sublabel: t("nav.option.googleMaps.sub"),
      action: () => {
        window.open(links.googleMapsWeb, "_blank", "noopener,noreferrer");
      },
    });
    options.push({
      key: "amap-web",
      label: t("nav.option.amapWeb.label"),
      sublabel: t("nav.option.amapWeb.sub"),
      action: () => {
        window.open(links.amapWeb, "_blank", "noopener,noreferrer");
      },
    });
  }

  function onPick(opt) {
    opt.action();
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl text-sm font-medium bg-ink-50 text-ink-800 border border-ink-200 hover:bg-ink-100 transition flex items-center justify-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 2 L19 22 L12 17 L5 22 Z" />
        </svg>
        {t("detail.actions.navToStart")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1200] bg-black/50 flex items-end sm:items-center justify-center px-4 pb-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-ink-800 truncate">
                {t("nav.sheet.title", { name: start.name })}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-400 text-sm shrink-0"
                aria-label={t("walking.exit")}
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onPick(opt)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-ink-100 hover:border-ink-300 hover:bg-ink-50 transition"
                >
                  <div className="text-sm font-medium text-ink-800">
                    {opt.label}
                  </div>
                  <div className="text-xs text-ink-400 mt-0.5">
                    {opt.sublabel}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
