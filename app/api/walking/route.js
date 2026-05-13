// /api/walking?origin=lng,lat&destination=lng,lat — server-side AMap proxy.
// Server-side key (AMAP_SERVER_KEY) avoids browser-side CORS / referrer checks.

import { getEnv, json } from "@/lib/server/db";

export const runtime = "edge";

export async function GET(request) {
  const env = getEnv();
  const url = new URL(request.url);
  const origin = url.searchParams.get("origin");
  const destination = url.searchParams.get("destination");

  if (!origin || !destination) {
    return json({ error: "missing origin or destination" }, 400);
  }

  const key = env.AMAP_SERVER_KEY;
  if (!key) {
    return json({ error: "server key not configured" }, 500);
  }

  const upstream = `https://restapi.amap.com/v3/direction/walking?key=${encodeURIComponent(
    key,
  )}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

  try {
    const res = await fetch(upstream, {
      headers: { "Accept-Encoding": "gzip" },
      cf: { cacheTtl: 60 * 60 * 24 * 7, cacheEverything: true },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return json({ error: "upstream fetch failed" }, 502);
  }
}
