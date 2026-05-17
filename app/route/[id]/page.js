import { notFound } from "next/navigation";
import { fetchRouteById } from "../../../lib/server/routes-data";
import RouteDetailClient from "./RouteDetailClient";

export const runtime = "edge";
// 5 分钟边缘缓存。重新部署或路线编辑后通过 Cloudflare cache purge 立即失效。
export const revalidate = 300;

export default async function RouteDetailPage({ params }) {
  const route = await fetchRouteById(params.id);
  if (!route) return notFound();
  return <RouteDetailClient route={route} />;
}
