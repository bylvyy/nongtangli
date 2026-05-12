"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-xl bg-ink-100 animate-pulse flex items-center justify-center text-ink-400 text-sm">
      地图加载中…
    </div>
  ),
});

export default function MapView(props) {
  return <MapInner {...props} />;
}
