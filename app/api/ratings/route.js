import { badRequest, getEnv, json, serverError } from "@/lib/server/db";

export const runtime = "edge";

export async function POST(request) {
  const env = getEnv();
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid json");
  }
  const routeId = String(body.routeId || "").trim();
  const stars = Number(body.stars);
  const comment = body.comment ? String(body.comment).slice(0, 500) : null;
  const clientId = body.clientId ? String(body.clientId).slice(0, 64) : null;

  if (!routeId) return badRequest("missing routeId");
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return badRequest("stars must be an integer 1-5");
  }

  const ua = request.headers.get("user-agent") || null;

  try {
    const res = await env.DB.prepare(
      "INSERT INTO ratings (route_id, stars, comment, client_id, user_agent) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(routeId, stars, comment, clientId, ua)
      .run();
    return json({ ok: true, id: res.meta?.last_row_id ?? null });
  } catch (e) {
    return serverError(e.message);
  }
}
