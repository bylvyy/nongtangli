"use client";

// 用 OSRM 公共服务器(routing.openstreetmap.de)请求步行路径
// 注意:此服务对生产环境不保证可用性。流量起来后应迁移到高德 walking API。
//
// 缓存策略:同一条 stops 序列只算一次,存 localStorage,key 是 stops 坐标的 hash
// 失败时返回 null,调用方回退到直线

const ENDPOINT = "https://routing.openstreetmap.de/routed-foot/route/v1/foot";
const CACHE_KEY = "walking-route-cache:v1";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

function hashKey(stops) {
  return stops
    .map((s) => `${s.coords[0].toFixed(5)},${s.coords[1].toFixed(5)}`)
    .join("|");
}

function readCache() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function getWalkingPath(stops) {
  if (!stops || stops.length < 2) return null;

  const key = hashKey(stops);
  const cache = readCache();
  const hit = cache[key];
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) {
    return hit.path;
  }

  // OSRM expects lng,lat
  const coordsStr = stops
    .map((s) => `${s.coords[1]},${s.coords[0]}`)
    .join(";");
  const url = `${ENDPOINT}/${coordsStr}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords || !coords.length) return null;
    // GeoJSON 是 [lng, lat],我们统一转成 [lat, lng]
    const path = coords.map(([lng, lat]) => [lat, lng]);
    cache[key] = { t: Date.now(), path };
    writeCache(cache);
    return path;
  } catch {
    return null;
  }
}
