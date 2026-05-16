import HomeClient from "./HomeClient";
import { THEMES, ATMOSPHERES } from "../lib/routes";
import { fetchAllRoutes } from "../lib/server/routes-data";

export const runtime = "edge";
// 路线列表平均一周更新 1-2 条, 5 分钟边缘缓存足够新鲜,
// 同时 tab 切换 / Link prefetch 可命中静态产物 — 体感几乎瞬开。
export const revalidate = 300;

export default async function HomePage() {
  const routes = await fetchAllRoutes();
  // 按发布时间倒序，最近的两条置顶为"本周新上线"
  const sorted = [...routes].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
  const newest = sorted.slice(0, 2);
  const rest = sorted.slice(2);

  return (
    <HomeClient
      newest={newest}
      rest={rest}
      themes={THEMES}
      atmospheres={ATMOSPHERES}
    />
  );
}
