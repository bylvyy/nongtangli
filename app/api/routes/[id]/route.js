import { getEnv, json, rowsToRoute, serverError } from "@/lib/server/db";

export const runtime = "edge";

export async function GET(_request, { params }) {
  const env = getEnv();
  const id = params.id;
  if (!id) return json({ error: "missing id" }, 400);
  try {
    const route = await env.DB.prepare(
      "SELECT * FROM routes WHERE id = ? AND is_published = 1",
    )
      .bind(id)
      .first();
    if (!route) return json({ error: "not found" }, 404);

    const stops = await env.DB.prepare(
      "SELECT * FROM stops WHERE route_id = ? ORDER BY ord",
    )
      .bind(id)
      .all();

    return json({ route: rowsToRoute(route, stops.results) }, 200, {
      "Cache-Control": "public, max-age=60, s-maxage=300",
    });
  } catch (e) {
    return serverError(e.message);
  }
}
