"use client";

import { useEffect, useState } from "react";

// 跟着我走 + 朝向开关 + 状态文字
// 父组件传入定位/朝向 hooks 的状态和控制函数
export default function GuideControls({
  geo, // { state, position, error, start, stop }
  heading, // { heading, state, enable }
  follow,
  setFollow,
}) {
  const [iosLikely, setIosLikely] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIosLikely(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document),
    );
  }, []);

  const showHeadingButton =
    iosLikely && heading.state === "idle" && geo.state === "watching";

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-800">实地导航</div>
          <div className="text-[11px] text-ink-400 mt-0.5 leading-relaxed">
            {geo.state === "idle" && "授权后地图上会显示你的位置和朝向"}
            {geo.state === "requesting" && "正在获取定位…"}
            {geo.state === "watching" && (
              <>
                定位精度 ±{Math.round(geo.position?.accuracy || 0)} 米
                {heading.state === "active" && " · 朝向已开启"}
              </>
            )}
            {geo.state === "denied" && "已拒绝定位。可在浏览器地址栏左侧重新授权"}
            {geo.state === "unsupported" && "当前浏览器不支持定位"}
            {geo.state === "error" && `定位出错: ${geo.error}`}
          </div>
        </div>
        {geo.state === "watching" ? (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setFollow((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                follow
                  ? "bg-ink-800 text-ink-50"
                  : "bg-ink-50 border border-ink-200 text-ink-800"
              }`}
            >
              {follow ? "跟随中" : "跟随我"}
            </button>
            <button
              onClick={geo.stop}
              className="px-3 py-1.5 rounded-lg text-xs bg-ink-50 border border-ink-200 text-ink-600"
            >
              停止
            </button>
          </div>
        ) : (
          <button
            onClick={geo.start}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-ink-800 text-ink-50"
          >
            授权定位
          </button>
        )}
      </div>

      {showHeadingButton && (
        <button
          onClick={heading.enable}
          className="mt-2 w-full py-1.5 rounded-lg text-xs bg-brick-500 text-ink-50"
        >
          开启朝向(iOS 需手动授权)
        </button>
      )}
      {heading.state === "denied" && (
        <div className="mt-2 text-[11px] text-ink-400">
          已拒绝朝向授权,可在 Safari 设置 → 网站 → 运动与方向中重新开启
        </div>
      )}

      <div className="mt-2 text-[10px] text-ink-400 leading-relaxed border-t border-ink-100 pt-2">
        浏览器定位精度有限(±10-30m),弄堂内可能漂移。需要精确步行导航请用每个点位旁的"导航"按钮。
      </div>
    </div>
  );
}
