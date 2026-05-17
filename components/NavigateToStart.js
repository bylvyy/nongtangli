"use client";

import { useState } from "react";
import { useT } from "../lib/i18n";

// "导航到起点" — 让用户自己挑用什么地图打开。
//
// 设计原则:
// - 不做任何 deeplink 自动 fallback / setTimeout 跳转
//   (旧版会在桌面/没装高德时强制跳到高德 web, 桌面用户直接报 console error
//    且没人想被强制送进中文页面)
// - 一个按钮 → 打开 sheet → 用户点哪个跳哪个 → 失败用户自己回来点别的
// - 平台决定第一行: iOS = Apple Maps, Android = Google Maps,
//   桌面没系统地图 → Google Maps web
// - 第二行永远是高德 app (装了体验最好), 第三行高德网页版 (没装的兜底)
//
// 坐标系: 数据库里 stops.coords 是 WGS-84, 所有目标 URL 全部直接传 WGS 即可。
// - Apple Maps: 中国区自动转 GCJ, 不能预先转, 否则双重偏移 ~400m
// - Google Maps: 不做中国偏移 (Google 在中国大陆地图整体偏 ~500m, 这是 Google 的事)
// - 高德 app: dev=1 告诉它"我传的是 WGS", 由高德服务端转 GCJ
// - 高德 web: coordinate=wgs84 同上
// 任何一处漏写 dev=1 或 coordinate=wgs84 都会出现 ~400m 偏移, 改的时候特别注意。

function buildLinks(stop) {
  const [lat, lng] = stop.coords; // WGS-84
  const rawName = stop.name || "起点";
  const name = encodeURIComponent(rawName);

  return {
    appleMaps: `maps://?daddr=${lat},${lng}&dirflg=w&q=${name}`,
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
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

export default function NavigateToStart({ route }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const start = route?.stops?.[0];
  if (!start) return null;

  const links = buildLinks(start);
  const platform = detectPlatform();

  // 每个 option: { label, sublabel, href, target }
  // target: "_self" 让 deeplink 直接由当前页发起 (不开新 tab, 失败也不留空白页)
  //         "_blank" 给 web 链接 — 用户回得来
  const options = [];
  if (platform === "ios") {
    options.push({
      key: "apple",
      label: t("nav.option.appleMaps.label"),
      sublabel: t("nav.option.appleMaps.sub"),
      href: links.appleMaps,
      target: "_self",
    });
    options.push({
      key: "amap-app",
      label: t("nav.option.amapApp.label"),
      sublabel: t("nav.option.amapApp.sub"),
      href: links.amapAppIOS,
      target: "_self",
    });
  } else if (platform === "android") {
    options.push({
      key: "google",
      label: t("nav.option.googleMaps.label"),
      sublabel: t("nav.option.googleMaps.sub"),
      href: links.googleMaps,
      target: "_blank",
    });
    options.push({
      key: "amap-app",
      label: t("nav.option.amapApp.label"),
      sublabel: t("nav.option.amapApp.sub"),
      href: links.amapAppAndroid,
      target: "_self",
    });
  } else {
    // 桌面: 没系统地图 app, Google Maps web 顶替
    options.push({
      key: "google",
      label: t("nav.option.googleMaps.label"),
      sublabel: t("nav.option.googleMaps.sub"),
      href: links.googleMaps,
      target: "_blank",
    });
  }
  // 第三行 (桌面是第二行): 高德网页版, 永远兜底
  options.push({
    key: "amap-web",
    label: t("nav.option.amapWeb.label"),
    sublabel: t("nav.option.amapWeb.sub"),
    href: links.amapWeb,
    target: "_blank",
  });

  function onPick(opt) {
    // 直接发起跳转, 不做任何 timer / visibilitychange 监听。
    // - target=_self: 用 location.assign, deeplink 失败浏览器自然停在原页
    // - target=_blank: 用 window.open, web 链接新 tab 打开
    if (opt.target === "_blank") {
      window.open(opt.href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(opt.href);
    }
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
