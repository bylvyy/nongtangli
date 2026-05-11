"use client";

const KEY = "shanghai-citywalk:v1";

const empty = { walked: [], wishlist: [] };

function read() {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      walked: Array.isArray(parsed.walked) ? parsed.walked : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
    };
  } catch {
    return empty;
  }
}

function write(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("footprint-changed"));
}

export function getFootprint() {
  return read();
}

export function toggleWalked(routeId) {
  const s = read();
  s.walked = s.walked.includes(routeId)
    ? s.walked.filter((id) => id !== routeId)
    : [...s.walked, routeId];
  write(s);
  return s;
}

export function toggleWishlist(routeId) {
  const s = read();
  s.wishlist = s.wishlist.includes(routeId)
    ? s.wishlist.filter((id) => id !== routeId)
    : [...s.wishlist, routeId];
  write(s);
  return s;
}

export function computeStats(state, routes) {
  const walkedRoutes = routes.filter((r) => state.walked.includes(r.id));
  const distance = walkedRoutes.reduce((acc, r) => acc + r.distanceKm, 0);
  const stops = walkedRoutes.reduce((acc, r) => acc + r.stops.length, 0);
  return {
    routeCount: walkedRoutes.length,
    distanceKm: Math.round(distance * 10) / 10,
    stopCount: stops,
  };
}

// 解锁徽章
// 走完 5 条 → 漫游者
// 走完某街区(district)所有路线 → 该街区专属称号
export function computeBadges(state, routes) {
  const badges = [];
  const walked = routes.filter((r) => state.walked.includes(r.id));

  if (walked.length >= 5) {
    badges.push({
      id: "wanderer",
      title: "上海漫游者",
      desc: "走完 5 条路线",
    });
  }
  if (walked.length >= 10) {
    badges.push({
      id: "deep-walker",
      title: "深度漫游者",
      desc: "走完 10 条路线",
    });
  }

  // 街区维度
  const byDistrict = {};
  for (const r of routes) {
    (byDistrict[r.district] ||= []).push(r);
  }
  for (const [district, list] of Object.entries(byDistrict)) {
    const allDone = list.every((r) => state.walked.includes(r.id));
    if (allDone && list.length >= 1) {
      badges.push({
        id: `district-${district}`,
        title: `${district}熟客`,
        desc: `走完 ${district} 全部 ${list.length} 条路线`,
      });
    }
  }

  return badges;
}
