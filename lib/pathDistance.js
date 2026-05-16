// 沿步行轨迹的距离工具。
//
// 行走模式里"距我 ××m"和"步行约 N 分钟",原先用直线 (haversine) 算,
// 城市里巷子/河道/铁路隔断会让真实步行距离比直线长 1.5-2x, 极不准。
//
// 这里用 D1 预存或运行时 fetch 的步行轨迹 (route.walkingPath, GCJ-02 lat,lng 序列)
// 把"用户 → 当前 stop"切成: 用户 → 用户在轨迹上的最近投影 → 沿轨迹到 stop 投影。
//
// 没有轨迹时调用方应自己 fallback 到直线 haversine。

const R = 6371000; // 地球半径 (m), 这里用 m 而不是 km, ETA 计算更顺手

function toRad(d) {
  return (d * Math.PI) / 180;
}

// haversine 米
export function haversineMeters(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// 计算 path 各段累计米。返回数组长度 = path.length, cum[0] = 0,
// cum[i] = path[0..i] 的总长。
export function cumulativeMeters(path) {
  if (!path || path.length < 2) return null;
  const cum = new Array(path.length);
  cum[0] = 0;
  for (let i = 1; i < path.length; i++) {
    cum[i] = cum[i - 1] + haversineMeters(path[i - 1], path[i]);
  }
  return cum;
}

// 把点 p 投影到线段 ab 上, 返回 {t, point, distSq}
// t 用经纬度直接当平面坐标算 (城市尺度上误差 < 1%, 完全够用)
function projectOnSegment(a, b, p) {
  const ax = a[1];
  const ay = a[0]; // 注意: lng=x, lat=y
  const bx = b[1];
  const by = b[0];
  const px = p[1];
  const py = p[0];
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return { t: 0, point: a, distSq: (px - ax) ** 2 + (py - ay) ** 2 };
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  const x = ax + t * dx;
  const y = ay + t * dy;
  return { t, point: [y, x], distSq: (px - x) ** 2 + (py - y) ** 2 };
}

// 找点 p 在 path 上的最近投影。返回 { segIdx, t, point, meters }
//   segIdx: 落在 [path[i], path[i+1]] 这一段
//   t: 段内参数 0..1
//   point: 投影点 [lat, lng]
//   meters: 从 path[0] 沿轨迹到投影点的距离 (米)
//
// cum 可选 — 提前算好可以避免重复计算。
export function nearestPointOnPath(path, p, cum) {
  if (!path || path.length < 2 || !p) return null;
  const _cum = cum || cumulativeMeters(path);
  let best = null;
  for (let i = 0; i < path.length - 1; i++) {
    const proj = projectOnSegment(path[i], path[i + 1], p);
    if (!best || proj.distSq < best.distSq) {
      best = { segIdx: i, t: proj.t, point: proj.point, distSq: proj.distSq };
    }
  }
  if (!best) return null;
  const segLen = haversineMeters(path[best.segIdx], path[best.segIdx + 1]);
  const meters = _cum[best.segIdx] + segLen * best.t;
  return {
    segIdx: best.segIdx,
    t: best.t,
    point: best.point,
    meters,
  };
}

// 用户 → stop 沿轨迹的距离 (米)。
//   path: [[lat,lng], ...] (GCJ-02)
//   userPos: [lat, lng] (GCJ-02)
//   stopPos: [lat, lng] (GCJ-02, 已转好)
// 返回 number (米) 或 null (轨迹太短/缺数据)
//
// 算法: 把 user 和 stop 都投影到轨迹上, 取它们沿轨迹累计米的差的绝对值,
// 再加上"用户到投影点"和"stop 到投影点"的直线距离 (用户和 stop 通常不在轨迹上)。
export function distanceAlongPath(path, userPos, stopPos) {
  if (!path || path.length < 2 || !userPos || !stopPos) return null;
  const cum = cumulativeMeters(path);
  const userProj = nearestPointOnPath(path, userPos, cum);
  const stopProj = nearestPointOnPath(path, stopPos, cum);
  if (!userProj || !stopProj) return null;
  const along = Math.abs(stopProj.meters - userProj.meters);
  const userOff = haversineMeters(userPos, userProj.point);
  // stop 通常很贴近轨迹 (它是轨迹的端点之一), userOff 才是主要偏移
  // 但偶发数据 stop 也可能离轨迹稍远, 一并加上
  const stopOff = haversineMeters(stopPos, stopProj.point);
  return along + userOff + stopOff;
}
