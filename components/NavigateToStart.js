"use client";

import { useT } from "../lib/i18n";

// "导航到起点" — 调起高德步行导航
//
// 用 https://uri.amap.com/navigation 这个 URI Scheme:
// - 手机: 自动尝试拉起高德 App, 没装就降级到高德移动 web 导航
// - 桌面: 落到高德的 web 页, 用户至少能看清起点位置
// stops[0].coords 是 WGS84 (数据约定); 让高德按 coordinate=wgs84 自己转 GCJ
export default function NavigateToStart({ route }) {
  const { t } = useT();
  const start = route?.stops?.[0];
  if (!start) return null;

  function onClick() {
    const [lat, lng] = start.coords;
    const name = encodeURIComponent(start.name || "起点");
    // mode=walk 步行; callnative=1 优先 App
    const url = `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=walk&coordinate=wgs84&callnative=1`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <button
      onClick={onClick}
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
  );
}
