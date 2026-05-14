// Generate the walking polyline for a route, using the AMap walking direction
// API one segment at a time, and persist it to routes.walking_path. Auth is
// gated by middleware.js (Basic Auth on /api/admin/*).
//
// Stops are stored as WGS84; AMap expects and returns GCJ-02. We convert
// to GCJ on the way out, store GCJ on the way in (the frontend draws on a
// GCJ-02 tile layer, so no second conversion is needed at render time).

import { getEnv, json, serverError } from "@/lib/server/db";
import { wgs84ToGcj02 } from "@/lib/coords";

export const runtime = "edge";

function parsePolyline(str) {
  if (!str) return [];
  return str.split(";").map((p) => {
    const [lng, lat] = p.split(",").map(Number);
    return [lat, lng];
  });
}

async function fetchSegment(key, fromGcj, toGcj) {
  const origin = `${fromGcj[1]},${fromGcj[0]}`;
  const destination = `${toGcj[1]},${toGcj[0]}`;
  const url = `https://restapi.amap.com/v3/direction/walking?key=${encodeURIComponent(
    key,
  )}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`amap http ${res.status}`);
  }
  const data = await res.json();
  if (data.status !== "1" || !data.route?.paths?.length) {
    throw new Error(data.info || "amap returned no path");
  }
  const path = data.route.paths[0];
  const all = [];
  for (const step of path.steps || []) {
    const pts = parsePolyline(step.polyline);
    if (all.length && pts.length) {
      const last = all[all.length - 1];
      if (last[0] === pts[0][0] && last[1] === pts[0][1]) pts.shift();
    }
    all.push(...pts);
  }
  return all;
}

export async function POST(_request, { params }) {
  const env = getEnv();
  const id = String(params.id || "").trim();
  if (!/^[a-z0-9-]+$/.test(id)) {
    return json({ error: "invalid id" }, 400);
  }
  const key = env.AMAP_SERVER_KEY;
  if (!key) {
    return json({ error: "AMAP_SERVER_KEY not configured" }, 500);
  }

  let stopsRows;
  try {
    const r = await env.DB.prepare(
      "SELECT lat, lng FROM stops WHERE route_id = ? ORDER BY ord",
    )
      .bind(id)
      .all();
    stopsRows = r.results || [];
  } catch (e) {
    return serverError(`db read failed: ${e.message}`);
  }

  if (stopsRows.length < 2) {
    return json({ error: "need at least 2 stops" }, 400);
  }

  const gcjStops = stopsRows.map((s) => wgs84ToGcj02(s.lat, s.lng));

  const merged = [];
  for (let i = 0; i < gcjStops.length - 1; i++) {
    let seg;
    try {
      seg = await fetchSegment(key, gcjStops[i], gcjStops[i + 1]);
    } catch (e) {
      return json(
        {
          error: `segment ${i + 1}→${i + 2} failed: ${e.message}`,
          failedSegment: i,
        },
        502,
      );
    }
    if (!seg.length) {
      return json(
        { error: `segment ${i + 1}→${i + 2} returned 0 points`, failedSegment: i },
        502,
      );
    }
    if (merged.length) {
      const last = merged[merged.length - 1];
      if (last[0] === seg[0][0] && last[1] === seg[0][1]) seg.shift();
    }
    merged.push(...seg);
  }

  try {
    await env.DB.prepare(
      "UPDATE routes SET walking_path = ?, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(JSON.stringify(merged), id)
      .run();
  } catch (e) {
    return serverError(`db write failed: ${e.message}`);
  }

  return json({
    ok: true,
    segments: gcjStops.length - 1,
    points: merged.length,
  });
}

export async function DELETE(_request, { params }) {
  const env = getEnv();
  const id = String(params.id || "").trim();
  if (!/^[a-z0-9-]+$/.test(id)) {
    return json({ error: "invalid id" }, 400);
  }
  try {
    await env.DB.prepare(
      "UPDATE routes SET walking_path = NULL, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(id)
      .run();
  } catch (e) {
    return serverError(e.message);
  }
  return json({ ok: true });
}
