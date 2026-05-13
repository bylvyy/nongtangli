// GET /api/routes — list all published routes (with stops).
// Single round-trip: fetch routes + stops, then group in JS. D1's free tier
// is happy with this shape for ~16 routes / ~100 stops.

import { json, rowsToRoute, serverError } from "../../_lib/db.js";

export async function onRequestGet({ env }) {
  try {
    const routesQuery = env.DB.prepare(
      "SELECT * FROM routes WHERE is_published = 1 ORDER BY published_at DESC",
    );
    const stopsQuery = env.DB.prepare(
      "SELECT s.* FROM stops s INNER JOIN routes r ON r.id = s.route_id WHERE r.is_published = 1 ORDER BY s.route_id, s.ord",
    );
    const [routesRes, stopsRes] = await Promise.all([
      routesQuery.all(),
      stopsQuery.all(),
    ]);

    const stopsByRoute = new Map();
    for (const s of stopsRes.results) {
      if (!stopsByRoute.has(s.route_id)) stopsByRoute.set(s.route_id, []);
      stopsByRoute.get(s.route_id).push(s);
    }

    const routes = routesRes.results.map((r) =>
      rowsToRoute(r, stopsByRoute.get(r.id) || []),
    );

    return json(
      { routes },
      200,
      { "Cache-Control": "public, max-age=60, s-maxage=300" },
    );
  } catch (e) {
    return serverError(e.message);
  }
}
