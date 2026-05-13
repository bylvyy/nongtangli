import HomeClient from "./HomeClient";
import { THEMES, ATMOSPHERES } from "../lib/routes";
import { fetchAllRoutes } from "../lib/server/routes-data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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
