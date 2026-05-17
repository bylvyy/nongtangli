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

// 两点 bearing (度), 0=北, 90=东, 180=南, 270=西。
export function bearing(a, b) {
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return (deg + 360) % 360;
}

// 角度差 (-180, 180], 正=右转, 负=左转
function angleDiff(from, to) {
  let d = to - from;
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  return d;
}

// 找用户前方最近的"明显转弯"。
//   path: GCJ 轨迹
//   userPos: 用户 GCJ 位置
//   stopPos: 当前 stop GCJ 位置 (用于判断 turn 是否在 stop 之前)
//   options: { angleThreshold = 30, lookaheadMaxM = 800 }
// 返回 { kind, distM, turnAngle, stopDistM }:
//   - kind: 'turn-left' | 'turn-right' | 'straight' | null
//   - distM: 到该 turn 的沿轨迹米数 (kind=straight 时为到 stop 的米数)
//   - turnAngle: 转弯角度 (正右负左)
//   - stopDistM: 用户到 stop 沿轨迹的米数
//
// 判定顺序:
//   1. 如果用户前方 stop 之前没有转弯 → 'straight'
//   2. 否则 → 'turn-left'/'turn-right' + 距离
//   3. 当 distM < 5m 时认为正在转弯, kind 仍返回方向但调用方应淡化文案
export function findNextTurn(path, userPos, stopPos, options = {}) {
  const angleThreshold = options.angleThreshold ?? 30;
  const lookaheadMaxM = options.lookaheadMaxM ?? 800;
  if (!path || path.length < 3 || !userPos || !stopPos) return null;

  const cum = cumulativeMeters(path);
  const userProj = nearestPointOnPath(path, userPos, cum);
  const stopProj = nearestPointOnPath(path, stopPos, cum);
  if (!userProj || !stopProj) return null;

  // 用户实际到 stop 的距离 = 沿轨迹差 + 用户偏移 + stop 偏移
  // 用户没在 path 起点之前时, userOff 是主要项 (用户位置离 path 还有距离)
  const userOff = haversineMeters(userPos, userProj.point);
  const stopOff = haversineMeters(stopPos, stopProj.point);
  const along = Math.max(0, stopProj.meters - userProj.meters);
  const stopDistM = along + userOff + stopOff;

  // 用户在 stop 之后 (反向走) 或者 user/stop 都投影到同一点 (e.g. user 在 path 起点之前,
  // stop = path[0]): 没法给转弯, 退化成 straight 到 stop
  if (stopProj.meters <= userProj.meters) {
    return { kind: "straight", distM: stopDistM, turnAngle: 0, stopDistM };
  }

  // 从用户投影段开始, 向前扫每个折点 path[i] (i > userProj.segIdx),
  // 比较到达 i 时的"前进方向"和"离开 i 后方向"的差。
  // 第一段方向 = userPos → path[userProj.segIdx + 1]
  let prevBearing = bearing(userPos, path[userProj.segIdx + 1]);

  for (let i = userProj.segIdx + 1; i < path.length - 1; i++) {
    const distToHere = cum[i] - userProj.meters;
    if (distToHere > lookaheadMaxM) break;
    // 已经超过当前 stop 的位置, 不再考虑这之后的转弯
    if (cum[i] >= stopProj.meters) break;

    const nextBearing = bearing(path[i], path[i + 1]);
    const diff = angleDiff(prevBearing, nextBearing);
    if (Math.abs(diff) >= angleThreshold) {
      return {
        kind: diff > 0 ? "turn-right" : "turn-left",
        distM: Math.max(0, distToHere),
        turnAngle: diff,
        stopDistM,
      };
    }
    prevBearing = nextBearing;
  }

  // 一路直行到 stop
  return { kind: "straight", distM: stopDistM, turnAngle: 0, stopDistM };
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

// 城市步行直线 → 实际路径的绕路系数。窄街区实测 1.2-1.5, 取 1.3 是均值。
// 用在 stop 位于用户后方 (path 顺序上回头看) 等"path 切片不适用"的场景。
const DETOUR_FACTOR = 1.3;
// 离轨迹多远算"上路". <30m 包含步道/路宽, 也容忍 GPS 漂移
const ON_ROUTE_M = 30;

// 综合距离算法 (主用)。
//
// 输入:
//   path: walkingPath (GCJ-02 [lat,lng] 序列), 可能为 null
//   userPos: 用户位置 (GCJ-02)
//   stopPos: 当前 stop (GCJ-02, 已转好)
//
// 返回:
//   {
//     meters: 用户实际还要走的距离 (米),
//     onRoute: bool — 用户是否在轨迹上 (<30m),
//     userOff: number — 用户到轨迹最近投影点的直线距离,
//     reroutePoint: [lat,lng] | null — 偏离时, 路径上离用户最近的"上路点",
//     fallbackToLine: bool — 是否退化用了直线×系数算
//   }
//
// 三种情况:
// 1. 没轨迹 / 数据不全 → 直线 × 1.3, onRoute=true (没法判定就当上路)
// 2. 上路 (userOff<30m) 且 stop 在 path 顺序中用户前方 → path 切片
// 3. 上路但 stop 在用户后方 (回头看上一站) → 直线 × 1.3, onRoute 仍 true
// 4. 偏离 (userOff>=30m) → 返航段 + 续航段:
//      userOff (用户 → 最近投影点) + |stopProj - userProj| 沿轨迹差 + stopOff
export function pathDistance(path, userPos, stopPos) {
  if (!userPos || !stopPos) {
    return { meters: null, onRoute: true, userOff: 0, reroutePoint: null, fallbackToLine: false };
  }
  // 没有 walkingPath 时退化直线 × 系数
  if (!path || path.length < 2) {
    const line = haversineMeters(userPos, stopPos);
    return {
      meters: line * DETOUR_FACTOR,
      onRoute: true,
      userOff: 0,
      reroutePoint: null,
      fallbackToLine: true,
    };
  }
  const cum = cumulativeMeters(path);
  const userProj = nearestPointOnPath(path, userPos, cum);
  const stopProj = nearestPointOnPath(path, stopPos, cum);
  if (!userProj || !stopProj) {
    const line = haversineMeters(userPos, stopPos);
    return {
      meters: line * DETOUR_FACTOR,
      onRoute: true,
      userOff: 0,
      reroutePoint: null,
      fallbackToLine: true,
    };
  }

  const userOff = haversineMeters(userPos, userProj.point);
  const stopOff = haversineMeters(stopPos, stopProj.point);
  const onRoute = userOff < ON_ROUTE_M;

  // 偏离: 返航 + 续航 + stop 到轨迹的偏移
  if (!onRoute) {
    const along = Math.abs(stopProj.meters - userProj.meters);
    return {
      meters: userOff + along + stopOff,
      onRoute: false,
      userOff,
      reroutePoint: userProj.point,
      fallbackToLine: false,
    };
  }

  // 上路但 stop 在用户后方 (path 顺序回看): path 切片不适用, 直线×系数
  // 阈值留 5m 余量避免投影抖动来回切
  if (stopProj.meters <= userProj.meters + 5) {
    const line = haversineMeters(userPos, stopPos);
    return {
      meters: line * DETOUR_FACTOR,
      onRoute: true,
      userOff,
      reroutePoint: null,
      fallbackToLine: true,
    };
  }

  // 上路 + 前方: 标准 path 切片
  const along = stopProj.meters - userProj.meters;
  return {
    meters: along + userOff + stopOff,
    onRoute: true,
    userOff,
    reroutePoint: null,
    fallbackToLine: false,
  };
}
