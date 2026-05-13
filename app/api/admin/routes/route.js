import {
  badRequest,
  deriveIntensity,
  getEnv,
  json,
  rowsToRoute,
  safeJson,
  serverError,
} from "@/lib/server/db";

export const runtime = "edge";

export async function GET() {
  const env = getEnv();
  try {
    const [routes, stops] = await Promise.all([
      env.DB.prepare("SELECT * FROM routes ORDER BY published_at DESC").all(),
      env.DB.prepare("SELECT * FROM stops ORDER BY route_id, ord").all(),
    ]);
    const stopsByRoute = new Map();
    for (const s of stops.results) {
      if (!stopsByRoute.has(s.route_id)) stopsByRoute.set(s.route_id, []);
      stopsByRoute.get(s.route_id).push(s);
    }
    const out = routes.results.map((r) =>
      rowsToRoute(r, stopsByRoute.get(r.id) || []),
    );
    return json({ routes: out });
  } catch (e) {
    return serverError(e.message);
  }
}

export async function POST(request) {
  const env = getEnv();
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid json");
  }

  const id = String(body.id || "").trim();
  if (!/^[a-z0-9-]+$/.test(id)) {
    return badRequest("id must be slug (a-z, 0-9, dash)");
  }
  const name = String(body.name || "").trim();
  if (!name) return badRequest("name required");

  const distanceKm = Number(body.distanceKm);
  if (!Number.isFinite(distanceKm)) return badRequest("distanceKm required");
  const durationMin = Number(body.durationMin);
  if (!Number.isInteger(durationMin)) return badRequest("durationMin required");

  const tags = Array.isArray(body.tags) ? body.tags : [];
  const stops = Array.isArray(body.stops) ? body.stops : [];

  const intensity = body.intensity || deriveIntensity(distanceKm);
  const isPublished = body.isPublished === false ? 0 : 1;

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const publishedAt = body.publishedAt || now.slice(0, 10);

  const walkingPath =
    body.walkingPath != null ? JSON.stringify(body.walkingPath) : null;

  try {
    const stmts = [
      env.DB.prepare(
        `INSERT INTO routes (id, name, name_en, hook, hook_en, theme, atmosphere, intensity, distance_km, duration_min, district, tags, cover_color, walking_path, published_at, is_published, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           name_en=excluded.name_en,
           hook=excluded.hook,
           hook_en=excluded.hook_en,
           theme=excluded.theme,
           atmosphere=excluded.atmosphere,
           intensity=excluded.intensity,
           distance_km=excluded.distance_km,
           duration_min=excluded.duration_min,
           district=excluded.district,
           tags=excluded.tags,
           cover_color=excluded.cover_color,
           walking_path=excluded.walking_path,
           published_at=excluded.published_at,
           is_published=excluded.is_published,
           updated_at=datetime('now')`,
      ).bind(
        id,
        name,
        body.name_en || null,
        body.hook || null,
        body.hook_en || null,
        body.theme || "",
        body.atmosphere || "",
        intensity,
        distanceKm,
        durationMin,
        body.district || "",
        JSON.stringify(tags),
        body.coverColor || null,
        walkingPath,
        publishedAt,
        isPublished,
      ),
      env.DB.prepare("DELETE FROM stops WHERE route_id = ?").bind(id),
    ];
    stops.forEach((s, i) => {
      const lat = Number(s.coords?.[0] ?? s.lat);
      const lng = Number(s.coords?.[1] ?? s.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO stops (route_id, ord, name, name_en, story, story_en, lat, lng, photos)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          id,
          i,
          String(s.name || ""),
          s.name_en || null,
          s.story || null,
          s.story_en || null,
          lat,
          lng,
          JSON.stringify(safeJson(s.photos, []) || []),
        ),
      );
    });
    await env.DB.batch(stmts);
    return json({ ok: true, id });
  } catch (e) {
    return serverError(e.message);
  }
}
