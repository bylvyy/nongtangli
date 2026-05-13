import { getEnv, json, rowsToRoute, serverError } from "@/lib/server/db";

export const runtime = "edge";

export async function GET() {
  const env = getEnv();
  try {
    const [routesRes, stopsRes] = await Promise.all([
      env.DB.prepare(
        "SELECT * FROM routes WHERE is_published = 1 ORDER BY published_at DESC",
      ).all(),
      env.DB.prepare(
        "SELECT s.* FROM stops s INNER JOIN routes r ON r.id = s.route_id WHERE r.is_published = 1 ORDER BY s.route_id, s.ord",
      ).all(),
    ]);

    const stopsByRoute = new Map();
    for (const s of stopsRes.results) {
      if (!stopsByRoute.has(s.route_id)) stopsByRoute.set(s.route_id, []);
      stopsByRoute.get(s.route_id).push(s);
    }

    const routes = routesRes.results.map((r) =>
      rowsToRoute(r, stopsByRoute.get(r.id) || []),
    );

    return json({ routes }, 200, {
      "Cache-Control": "public, max-age=60, s-maxage=300",
    });
  } catch (e) {
    return serverError(e.message);
  }
}
