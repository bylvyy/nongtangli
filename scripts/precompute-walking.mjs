// 在 build 之前跑一次,把每条路线的步行轨迹从高德拉下来,
// 写成 lib/walking-paths.generated.js,前端直接 import,
// 用户进详情页时不再有任何网络等待。
//
// 使用 .env.local 里的 NEXT_PUBLIC_AMAP_WEB_KEY(node 不会自动读 .env,需要手动加载)。
// 失败的路线会回退为 null,前端显示直线占位。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ---- 加载 .env.local ----
function loadDotEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}
loadDotEnv();

// ---- 极简版 WGS84 → GCJ-02(同 lib/coords.js,服务端版本) ----
const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;
function outOfChina(lat, lng) {
  if (lng < 72.004 || lng > 137.8347) return true;
  if (lat < 0.8293 || lat > 55.8271) return true;
  return false;
}
function transformLat(x, y) {
  let ret =
    -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}
function transformLng(x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}
function wgs84ToGcj02(lat, lng) {
  if (outOfChina(lat, lng)) return [lat, lng];
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [lat + dLat, lng + dLng];
}

function parsePolyline(str) {
  if (!str) return [];
  return str.split(";").map((p) => {
    const [lng, lat] = p.split(",").map(Number);
    return [lat, lng];
  });
}

async function fetchSegment(from, to, key) {
  const origin = `${from[1]},${from[0]}`;
  const destination = `${to[1]},${to[0]}`;
  const url = `https://restapi.amap.com/v3/direction/walking?key=${key}&origin=${origin}&destination=${destination}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`http ${res.status}`);
  const data = await res.json();
  if (data.status !== "1" || !data.route?.paths?.length) {
    throw new Error(`amap status ${data.status}: ${data.info || ""}`);
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

async function computeRoute(stops, key) {
  if (!stops || stops.length < 2) return null;
  const gcj = stops.map((s) => wgs84ToGcj02(s.coords[0], s.coords[1]));
  const all = [];
  for (let i = 0; i < gcj.length - 1; i++) {
    const seg = await fetchSegment(gcj[i], gcj[i + 1], key);
    if (all.length && seg.length) {
      const last = all[all.length - 1];
      if (last[0] === seg[0][0] && last[1] === seg[0][1]) seg.shift();
    }
    all.push(...seg);
  }
  return all;
}

// ---- 从 lib/routes.js 提取 ROUTES,不引入 next 等依赖,直接 dynamic import ----
async function loadRoutes() {
  const mod = await import(path.join(ROOT, "lib/routes.js"));
  return mod.ROUTES;
}

async function main() {
  // 服务端 key(Cloudflare Pages 上以 AMAP_SERVER_KEY 注入)优先,
  // 本地 dev 退回 NEXT_PUBLIC_AMAP_WEB_KEY
  const key = process.env.AMAP_SERVER_KEY || process.env.NEXT_PUBLIC_AMAP_WEB_KEY;
  if (!key) {
    console.warn("[precompute] 没有 AMAP key 可用,跳过预计算(保留现有 generated 文件)");
    process.exit(0);
  }

  const routes = await loadRoutes();
  console.log(`[precompute] 共 ${routes.length} 条路线,开始预计算步行路径...`);

  const out = {};
  let okCount = 0;
  for (const route of routes) {
    process.stdout.write(`  - ${route.id} ... `);
    try {
      const path = await computeRoute(route.stops, key);
      out[route.id] = path;
      okCount += 1;
      console.log(`ok (${path.length} 个点)`);
    } catch (e) {
      console.log(`failed: ${e.message}`);
      out[route.id] = null;
    }
  }

  // 一条都没成功,大概率是网络问题,保留现有文件不要写空
  if (okCount === 0) {
    console.warn("[precompute] 全部失败,保留现有 generated 文件");
    process.exit(0);
  }

  const generatedAt = new Date().toISOString();
  const file =
    `// AUTO-GENERATED by scripts/precompute-walking.mjs at ${generatedAt}\n` +
    `// Do not edit by hand; run \`npm run precompute\` to regenerate.\n` +
    `// Coordinates are GCJ-02 [lat, lng].\n\n` +
    `export const WALKING_PATHS = ${JSON.stringify(out)};\n`;

  const outPath = path.join(ROOT, "lib/walking-paths.generated.js");
  fs.writeFileSync(outPath, file);
  console.log(`[precompute] 写入 ${outPath}`);
}

main().catch((e) => {
  console.error("[precompute] 失败:", e);
  process.exit(1);
});
