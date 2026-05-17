"use client";

// 实时步行规划 hook — 调 /api/walking 拿"用户当前位置 → 当前 stop"的真步行距离。
//
// 触发条件 (任一):
// - 当前 stop 切换
// - 用户移动 > REFETCH_DIST_M
// - 距上次成功 fetch > REFETCH_INTERVAL_MS
//
// 节流: 同时只允许一个 in-flight 请求, 后续请求合并到一次。
// 失败时静默返回 null, 调用方应该 fallback 到直线×1.3 + 沿 D1 整路 path 的指引。

import { useEffect, useRef, useState } from "react";

// 高德返回 [lng,lat] 字符串数组, 转成我们用的 [lat,lng]
function parsePolyline(str) {
  if (!str) return [];
  return str.split(";").map((p) => {
    const [lng, lat] = p.split(",").map(Number);
    return [lat, lng];
  });
}

// 用户移动多少米才重新 fetch — 30m 大概是过一个路口的尺度
const REFETCH_DIST_M = 30;
// 兜底: 站着不动也每隔多久 refresh — 5 分钟够稳, 也避免 ETA 卡死
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

const R = 6371000;
function toRad(d) {
  return (d * Math.PI) / 180;
}
function haversineMeters(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// hook: 给定用户位置(GCJ) 和 当前 stop(GCJ), 返回 { distanceM, durationMin, polyline, loading, error }
//
// 当用户/stop/key 改变, 自动决定是否要 refetch。
// 注意: userPos / stopPos 用 [lat,lng] 数组, 每次都是新引用 — useEffect 依赖
// 使用拆开的 lat/lng 数值, 避免无限循环。
export function useLiveWalkingRoute(userPosGcj, stopPosGcj, stopKey) {
  const [state, setState] = useState({
    distanceM: null,
    durationMin: null,
    polyline: null,
    loading: false,
    error: null,
  });
  // 记录上次成功 fetch 的位置/key/时间, 用于决定是否要 refetch
  const lastRef = useRef({ userPos: null, stopKey: null, ts: 0 });
  // in-flight abort controller
  const abortRef = useRef(null);

  // 拆解为标量做依赖, 避免数组引用每次都变触发无限循环
  const userLat = userPosGcj?.[0];
  const userLng = userPosGcj?.[1];
  const stopLat = stopPosGcj?.[0];
  const stopLng = stopPosGcj?.[1];

  useEffect(() => {
    if (userLat == null || userLng == null || stopLat == null || stopLng == null) {
      return;
    }
    const userPos = [userLat, userLng];
    const stopPos = [stopLat, stopLng];
    // 合理性: 距 stop 直线 < 30m 时不需要再调 API, 没意义且会被到达逻辑覆盖
    const lineM = haversineMeters(userPos, stopPos);
    if (lineM < 30) {
      setState((s) => ({
        ...s,
        distanceM: lineM,
        durationMin: 1,
        polyline: null,
        loading: false,
        error: null,
      }));
      return;
    }

    const last = lastRef.current;
    const stopChanged = last.stopKey !== stopKey;
    const movedFar =
      last.userPos && haversineMeters(last.userPos, userPos) > REFETCH_DIST_M;
    const stale = Date.now() - last.ts > REFETCH_INTERVAL_MS;

    if (!stopChanged && !movedFar && !stale && last.ts > 0) {
      // 不需要 refetch
      return;
    }

    // 取消上一个 in-flight (用户移动得快或 stop 切换得快)
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((s) => ({ ...s, loading: true, error: null }));

    const origin = `${userLng},${userLat}`;
    const destination = `${stopLng},${stopLat}`;
    fetch(`/api/walking?origin=${origin}&destination=${destination}`, {
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`http ${res.status}`);
        const data = await res.json();
        if (data.status !== "1" || !data.route?.paths?.length) {
          throw new Error(data.info || "no path");
        }
        const path = data.route.paths[0];
        const distanceM = Number(path.distance);
        const durationS = Number(path.duration);
        // 拼 polyline
        const all = [];
        for (const step of path.steps || []) {
          const pts = parsePolyline(step.polyline);
          if (all.length && pts.length) {
            const tail = all[all.length - 1];
            if (tail[0] === pts[0][0] && tail[1] === pts[0][1]) pts.shift();
          }
          all.push(...pts);
        }
        if (ctrl.signal.aborted) return;
        lastRef.current = {
          userPos,
          stopKey,
          ts: Date.now(),
        };
        setState({
          distanceM,
          durationMin: Math.max(1, Math.round(durationS / 60)),
          polyline: all,
          loading: false,
          error: null,
        });
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        // 失败保留上一次的数据 (用户体验更稳), 只标 loading=false + error
        setState((s) => ({ ...s, loading: false, error: e.message }));
      });
    return () => ctrl.abort();
  }, [userLat, userLng, stopLat, stopLng, stopKey]);

  return state;
}
