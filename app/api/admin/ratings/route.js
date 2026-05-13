import { getEnv, json, serverError } from "@/lib/server/db";

export const runtime = "edge";

export async function GET(request) {
  const env = getEnv();
  const url = new URL(request.url);
  const routeId = url.searchParams.get("route_id");
  try {
    if (routeId) {
      const res = await env.DB.prepare(
        "SELECT id, route_id, stars, comment, client_id, created_at FROM ratings WHERE route_id = ? ORDER BY created_at DESC LIMIT 200",
      )
        .bind(routeId)
        .all();
      return json({ ratings: res.results });
    }
    const summary = await env.DB.prepare(
      `SELECT route_id AS routeId,
              COUNT(*) AS count,
              ROUND(AVG(stars), 2) AS avg,
              MAX(created_at) AS lastAt
       FROM ratings
       GROUP BY route_id
       ORDER BY lastAt DESC`,
    ).all();
    return json({ summary: summary.results });
  } catch (e) {
    return serverError(e.message);
  }
}
