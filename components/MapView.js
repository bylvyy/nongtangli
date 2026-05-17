"use client";

import { useEffect, useState } from "react";

// MapInner 依赖 leaflet, 模块加载就读 window, 必须在客户端动态加载.
//
// 不能用 `next/dynamic({ ssr: false })`:
// @cloudflare/next-on-pages 1.13.16 在编译 edge worker 时, 会把 next/dynamic
// 加 ssr:false 的 import 误编译成 `async__chunk_NNNN` 这样一个未声明的标识符,
// SSR 渲染时直接 ReferenceError → 页面 500.
// (复现: 任何 next/dynamic + ssr:false 的 client component 都会让所在 page 500)
//
// 所以这里用纯 useEffect + 原生 import() — webpack 仍然会拆 chunk,
// 但不走 next/dynamic 的注册路径, 也就绕开了 next-on-pages 的转换 bug.
// SSR 期间 Inner 为 null, 渲染 loading; 客户端挂载后再拉真组件.

const Loading = () => (
  <div className="w-full h-full bg-ink-100 animate-pulse flex items-center justify-center text-ink-400 text-sm">
    地图加载中…
  </div>
);

export default function MapView(props) {
  const [Inner, setInner] = useState(null);
  useEffect(() => {
    let cancelled = false;
    import("./MapInner").then((m) => {
      if (!cancelled) setInner(() => m.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!Inner) return <Loading />;
  return <Inner {...props} />;
}
