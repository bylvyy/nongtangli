// Helpers shared by every Next.js API route handler. Dependency-free so the
// edge bundle stays small.

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

export function badRequest(message) {
  return json({ error: message }, 400);
}

export function serverError(message) {
  return json({ error: message }, 500);
}

export function rowsToRoute(routeRow, stopRows) {
  if (!routeRow) return null;
  return {
    id: routeRow.id,
    name: routeRow.name,
    name_en: routeRow.name_en,
    hook: routeRow.hook,
    hook_en: routeRow.hook_en,
    theme: routeRow.theme,
    atmosphere: routeRow.atmosphere,
    intensity: routeRow.intensity,
    distanceKm: routeRow.distance_km,
    durationMin: routeRow.duration_min,
    district: routeRow.district,
    tags: safeJson(routeRow.tags, []),
    coverColor: routeRow.cover_color,
    walkingPath: safeJson(routeRow.walking_path, null),
    publishedAt: routeRow.published_at,
    isPublished: !!routeRow.is_published,
    stops: (stopRows || []).map((s) => ({
      name: s.name,
      name_en: s.name_en,
      story: s.story,
      story_en: s.story_en,
      coords: [s.lat, s.lng],
      photos: safeJson(s.photos, []),
    })),
  };
}

export function safeJson(text, fallback) {
  if (text == null) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function deriveIntensity(distanceKm) {
  if (distanceKm < 3) return "轻松散步";
  if (distanceKm <= 6) return "中等步行";
  return "长距离暴走";
}

// D1 binding lookup. In Next-on-Pages we read from getRequestContext().env;
// in `next dev` we fall back to process.env so smoke tests against `next dev`
// at least surface a clear "binding missing" error instead of crashing.
export function getEnv() {
  try {
    // Lazy import keeps `next dev` happy when the package isn't loaded yet.
    const mod = require("@cloudflare/next-on-pages");
    if (typeof mod.getRequestContext === "function") {
      return mod.getRequestContext().env;
    }
  } catch {
    // not running on pages — fall through
  }
  return globalThis.process?.env || {};
}
