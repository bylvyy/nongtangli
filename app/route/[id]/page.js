import { notFound } from "next/navigation";
import { fetchRouteById } from "../../../lib/server/routes-data";
import RouteDetailClient from "./RouteDetailClient";

export const runtime = "edge";
// 注意: 这里不能加 `revalidate` — next-on-pages 1.13.x 在
// "edge runtime + 动态参数 + ISR" 三件套下会 500。同一仓库里
// `/`、`/footprint` (edge + revalidate, 无动态参数) 都能正常 ISR;
// `/api/routes/[id]` (edge + 动态参数, 用 Cache-Control 头手动缓存) 也正常。
// 唯独 `/route/[id]` 这类页面级 ISR 会挂。
// 性能上影响很小: D1 边缘命中 ~50ms, Link prefetch 已经把详情页拉到本地缓存。
export const dynamic = "force-dynamic";

export default async function RouteDetailPage({ params }) {
  const route = await fetchRouteById(params.id);
  if (!route) return notFound();
  return <RouteDetailClient route={route} />;
}
