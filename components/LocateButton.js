"use client";

import { useState } from "react";

// 地图 app 风格的定位按钮
// 状态:
//   idle (geo.state === 'idle')          → 灰边空心,点击触发授权
//   requesting                            → 圆环加载动画,不可点
//   watching + !follow                    → 黑色实心,点击进入跟随
//   watching + follow                     → 蓝色实心(高亮),点击退出跟随
//   denied                                → 红色 !, 点击展示提示
//   unsupported / error                   → 灰色 !,点击展示提示
//
// 朝向(heading)授权必须同步挂在用户手势里 — iOS 13+ 的 requestPermission
// 一旦延后到 useEffect 就会被判定为"非用户激活"而抛错。所以每次点击都顺手
// 调一遍 enable(), 直到拿到 active 为止。

export default function LocateButton({ geo, heading, follow, setFollow }) {
  const [tip, setTip] = useState(null);

  function showTip(msg) {
    setTip(msg);
    setTimeout(() => setTip(null), 3500);
  }

  function tryEnableHeading() {
    if (heading.state === "active" || heading.state === "unsupported") return;
    // 直接调,不 await,不 catch — 必须在用户手势同帧执行
    try {
      const p = heading.enable();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* swallow */
    }
  }

  function onClick() {
    // 不论何种状态,先尝试拿朝向授权 (借用本次点击的手势上下文)
    tryEnableHeading();

    if (geo.state === "idle") {
      geo.start();
      return;
    }
    if (geo.state === "requesting") return;
    if (geo.state === "watching") {
      setFollow((v) => !v);
      return;
    }
    if (geo.state === "denied") {
      showTip("已拒绝定位。请在浏览器地址栏左侧的锁/信息图标里改回允许");
      return;
    }
    if (geo.state === "unsupported") {
      showTip("当前浏览器不支持定位");
      return;
    }
    if (geo.state === "error") {
      showTip(`定位出错,正在重试`);
      geo.start();
      return;
    }
  }

  const variant = (() => {
    if (geo.state === "denied" || geo.state === "error") return "error";
    if (geo.state === "unsupported") return "warn";
    if (geo.state === "watching" && follow) return "active";
    if (geo.state === "watching") return "ready";
    if (geo.state === "requesting") return "loading";
    return "idle";
  })();

  const styles = {
    idle: "bg-white text-ink-600 border-ink-200",
    loading: "bg-white text-ink-400 border-ink-200",
    ready: "bg-white text-ink-800 border-ink-300",
    active: "bg-white text-blue-500 border-blue-300 ring-2 ring-blue-500/30",
    error: "bg-white text-red-500 border-red-200",
    warn: "bg-white text-ink-400 border-ink-200",
  };

  return (
    <div className="absolute bottom-12 right-3 z-[400] flex flex-col items-end gap-2">
      {tip && (
        <div className="max-w-[240px] bg-ink-800 text-ink-50 text-[11px] px-3 py-2 rounded-lg shadow-lg leading-relaxed">
          {tip}
        </div>
      )}
      <button
        onClick={onClick}
        aria-label="定位到当前位置"
        className={`w-11 h-11 rounded-full border shadow-md flex items-center justify-center transition ${styles[variant]}`}
      >
        {variant === "loading" ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : variant === "error" || variant === "warn" ? (
          <span className="text-base font-bold">!</span>
        ) : (
          <CrosshairIcon active={variant === "active"} />
        )}
      </button>
    </div>
  );
}

function CrosshairIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="3.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <line x1="10" y1="1" x2="10" y2="4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="15.5" x2="10" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="1" y1="10" x2="4.5" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15.5" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
