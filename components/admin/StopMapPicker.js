"use client";

// 编辑某个 stop 时的小地图: 拖动 marker 或点击地图来更新经纬度。
// 用 dynamic import 避开 SSR (leaflet 依赖 window)。

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./StopMapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-xl bg-ink-100 flex items-center justify-center text-xs text-ink-400">
      地图加载中…
    </div>
  ),
});

export default function StopMapPicker(props) {
  return <Inner {...props} />;
}
