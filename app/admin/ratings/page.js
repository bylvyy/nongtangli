"use client";

// 评分汇总: 每条路线一行 (count / avg / lastAt), 点击展开评论列表。
// 评分总数 = sum(count), 平均分按各路线 avg 加权由前台展示而非后端。

import { useEffect, useState } from "react";

function fmt(ts) {
  if (!ts) return "—";
  return ts.replace("T", " ").slice(0, 16);
}

function Stars({ n }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(n)}
      <span className="text-ink-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function RatingsPage() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [comments, setComments] = useState({});
  const [routeNames, setRouteNames] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/admin/ratings", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/routes", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([rt, rr]) => {
        if (cancelled) return;
        setSummary(rt.summary || []);
        const names = {};
        for (const r of rr.routes || []) names[r.id] = r.name;
        setRouteNames(names);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(routeId) {
    if (openId === routeId) {
      setOpenId(null);
      return;
    }
    setOpenId(routeId);
    if (comments[routeId]) return;
    try {
      const res = await fetch(
        `/api/admin/ratings?route_id=${encodeURIComponent(routeId)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setComments((prev) => ({ ...prev, [routeId]: data.ratings || [] }));
    } catch {
      setComments((prev) => ({ ...prev, [routeId]: [] }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-bold">评分</h1>
        <p className="mt-1 text-sm text-ink-500">
          每条路线一行, 点击展开最近 200 条评论。
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          加载失败: {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-sm text-ink-400 py-10">加载中…</div>
      )}

      {!loading && !error && summary.length === 0 && (
        <div className="text-center text-sm text-ink-400 py-10">还没有评分</div>
      )}

      <ul className="space-y-2">
        {summary.map((s) => {
          const open = openId === s.routeId;
          const list = comments[s.routeId] || [];
          return (
            <li
              key={s.routeId}
              className="rounded-2xl bg-white border border-ink-100"
            >
              <button
                type="button"
                onClick={() => toggle(s.routeId)}
                className="w-full text-left px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink-800 truncate">
                    {routeNames[s.routeId] || s.routeId}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-400">
                    {s.count} 条 · 平均 {Number(s.avg).toFixed(2)} · 最近 {fmt(s.lastAt)}
                  </div>
                </div>
                <div className="text-sm font-bold text-amber-500">
                  {Number(s.avg).toFixed(1)}
                </div>
                <span
                  className={`text-ink-400 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 border-t border-ink-100 pt-3 space-y-3">
                  {list.length === 0 ? (
                    <p className="text-xs text-ink-400">没有可显示的评论</p>
                  ) : (
                    list.map((c) => (
                      <div key={c.id} className="text-sm">
                        <div className="flex items-center gap-2 text-xs">
                          <Stars n={c.stars} />
                          <span className="text-ink-400">{fmt(c.created_at)}</span>
                        </div>
                        {c.comment && (
                          <p className="mt-1 text-ink-800 whitespace-pre-wrap">
                            {c.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
