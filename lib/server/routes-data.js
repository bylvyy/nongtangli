// Server-only D1 fetchers used by the Next page components.
// Returns the same shape as the old ROUTES array so the existing client
// components (HomeClient, RouteDetailClient, RouteCard, FilterBar) keep
// working unchanged.

import { getEnv, rowsToRoute } from "./db";

export async function fetchAllRoutes() {
  const env = getEnv();
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
  return routesRes.results.map((r) =>
    rowsToRoute(r, stopsByRoute.get(r.id) || []),
  );
}

export async function fetchRouteById(id) {
  const env = getEnv();
  const route = await env.DB.prepare(
    "SELECT * FROM routes WHERE id = ? AND is_published = 1",
  )
    .bind(id)
    .first();
  if (!route) return null;
  const stops = await env.DB.prepare(
    "SELECT * FROM stops WHERE route_id = ? ORDER BY ord",
  )
    .bind(id)
    .all();
  return rowsToRoute(route, stops.results);
}
