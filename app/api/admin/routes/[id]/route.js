import { getEnv, json, rowsToRoute, serverError } from "@/lib/server/db";

export const runtime = "edge";

export async function GET(_request, { params }) {
  const env = getEnv();
  const id = params.id;
  try {
    const route = await env.DB.prepare("SELECT * FROM routes WHERE id = ?")
      .bind(id)
      .first();
    if (!route) return json({ error: "not found" }, 404);
    const stops = await env.DB.prepare(
      "SELECT * FROM stops WHERE route_id = ? ORDER BY ord",
    )
      .bind(id)
      .all();
    return json({ route: rowsToRoute(route, stops.results) });
  } catch (e) {
    return serverError(e.message);
  }
}

export async function DELETE(_request, { params }) {
  const env = getEnv();
  const id = params.id;
  try {
    await env.DB.prepare("DELETE FROM routes WHERE id = ?").bind(id).run();
    return json({ ok: true });
  } catch (e) {
    return serverError(e.message);
  }
}
