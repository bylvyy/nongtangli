"use client";

// 高德步行规划 API:https://restapi.amap.com/v3/direction/walking
// 单次最多支持 2 个点(起+终),多 stops 串行请求并拼接
// 注意:高德 API 接收和返回都是 GCJ-02 坐标,所以传入前要把 WGS84 转成 GCJ-02
//
// 缓存策略:同一条 stops 序列只算一次,存 localStorage,key 是 stops 坐标的 hash
// 失败时返回 null,调用方回退到直线

import { wgs84ToGcj02 } from "./coords";

const CACHE_KEY = "walking-route-cache:v2-amap";
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
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage 满了就忽略
  }
}

// 高德返回的 polyline 形如 "121.4737,31.2304;121.4750,31.2310"
function parsePolyline(str) {
  if (!str) return [];
  return str.split(";").map((p) => {
    const [lng, lat] = p.split(",").map(Number);
    return [lat, lng];
  });
}

async function fetchSegment(from, to, key) {
  // from / to 已经是 GCJ-02 [lat, lng]
  const origin = `${from[1]},${from[0]}`;
  const destination = `${to[1]},${to[0]}`;
  const url = `https://restapi.amap.com/v3/direction/walking?key=${key}&origin=${origin}&destination=${destination}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "1" || !data.route?.paths?.length) return null;
  const path = data.route.paths[0];
  // 把每一步的 polyline 拼起来
  const all = [];
  for (const step of path.steps || []) {
    const pts = parsePolyline(step.polyline);
    if (all.length && pts.length) {
      // 避免相邻 step 接缝处重复点
      if (
        all[all.length - 1][0] === pts[0][0] &&
        all[all.length - 1][1] === pts[0][1]
      ) {
        pts.shift();
      }
    }
    all.push(...pts);
  }
  return all;
}

export async function getWalkingPath(stops) {
  if (!stops || stops.length < 2) return null;

  const key = hashKey(stops);
  const cache = readCache();
  const hit = cache[key];
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) {
    return hit.path;
  }

  const apiKey = process.env.NEXT_PUBLIC_AMAP_WEB_KEY;
  if (!apiKey) {
    if (typeof window !== "undefined") {
      console.warn("[walkingRoute] 缺少 NEXT_PUBLIC_AMAP_WEB_KEY,无法生成步行路径");
    }
    return null;
  }

  // 把 WGS84 转 GCJ-02
  const gcjStops = stops.map((s) => wgs84ToGcj02(s.coords[0], s.coords[1]));

  try {
    const segments = [];
    for (let i = 0; i < gcjStops.length - 1; i++) {
      const seg = await fetchSegment(gcjStops[i], gcjStops[i + 1], apiKey);
      if (!seg || !seg.length) return null;
      // 拼接时避免重复
      if (segments.length && seg.length) {
        const last = segments[segments.length - 1];
        if (last[0] === seg[0][0] && last[1] === seg[0][1]) seg.shift();
      }
      segments.push(...seg);
    }
    if (!segments.length) return null;
    cache[key] = { t: Date.now(), path: segments };
    writeCache(cache);
    return segments;
  } catch {
    return null;
  }
}
