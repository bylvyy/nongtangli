"use client";

import { useT } from "../lib/i18n";

// "导航到起点" — 调起高德步行导航
//
// uri.amap.com 的 callnative=1 在国内自带浏览器普遍失效, 只能落到 web 页。
// 改用平台原生 scheme: iosamap:// / androidamap://, 失败再 fallback 到 web。
//
// 高德 dev=1 表示传入的是 WGS84 原始 GPS 坐标(由高德自己转 GCJ); 我们 stops
// 数据里就是 WGS84, 直接传即可。t=2 表示步行导航。
export default function NavigateToStart({ route }) {
  const { t } = useT();
  const start = route?.stops?.[0];
  if (!start) return null;

  function onClick() {
    const [lat, lng] = start.coords;
    const name = start.name || "起点";
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    const native = isIOS
      ? `iosamap://path?sourceApplication=nongtangli&dname=${encodeURIComponent(
          name,
        )}&dlat=${lat}&dlon=${lng}&dev=1&t=2`
      : isAndroid
      ? `androidamap://route/plan/?dname=${encodeURIComponent(
          name,
        )}&dlat=${lat}&dlon=${lng}&dev=1&t=2`
      : null;

    const webFallback = `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(
      name,
    )}&mode=walk&coordinate=wgs84`;

    if (!native) {
      // 桌面或未知平台: 直接 web 页
      window.open(webFallback, "_blank", "noopener");
      return;
    }

    // 移动端: 先尝试拉起 App, 1.5s 没切走就降级 web
    // 用隐藏 iframe 触发 scheme, 比 location.href 在 iOS 上更稳, 不会留下错误页
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = native;
    document.body.appendChild(iframe);

    const fallbackTimer = setTimeout(() => {
      window.location.href = webFallback;
    }, 1500);

    // 页面被切到后台 (App 拉起成功) → 取消 fallback
    function onHide() {
      if (document.hidden) {
        clearTimeout(fallbackTimer);
        document.removeEventListener("visibilitychange", onHide);
      }
    }
    document.addEventListener("visibilitychange", onHide);

    // 4s 后清理 iframe, 避免泄漏
    setTimeout(() => {
      iframe.remove();
    }, 4000);
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
