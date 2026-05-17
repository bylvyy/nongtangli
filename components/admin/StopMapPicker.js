"use client";

// 编辑某个 stop 时的小地图: 拖动 marker 或点击地图来更新经纬度.
// 用动态 import 避开 SSR (leaflet 依赖 window).
//
// 不能用 next/dynamic({ ssr: false }) — 见 components/MapView.js 注释,
// next-on-pages 1.13.16 会把它编译成未声明的 async__chunk_NNNN 标识符 → 500.

import { useEffect, useState } from "react";

export default function StopMapPicker(props) {
  const [Inner, setInner] = useState(null);
  useEffect(() => {
    let cancelled = false;
    import("./StopMapPickerInner").then((m) => {
      if (!cancelled) setInner(() => m.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!Inner) {
    return (
      <div className="h-48 rounded-xl bg-ink-100 flex items-center justify-center text-xs text-ink-400">
        地图加载中…
      </div>
    );
  }
  return <Inner {...props} />;
}
