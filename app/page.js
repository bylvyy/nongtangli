import HomeClient from "./HomeClient";
import { ROUTES, THEMES, ATMOSPHERES } from "../lib/routes";

export default function HomePage() {
  // 按发布时间倒序,最近的两条置顶为"本周新上线"
  const sorted = [...ROUTES].sort((a, b) =>
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
