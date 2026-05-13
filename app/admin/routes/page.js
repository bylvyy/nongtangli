"use client";

// 路线管理: 列表 (含草稿). 行内: 编辑 / 删除. 删除带二次确认弹窗。

import Link from "next/link";
import { useEffect, useState } from "react";

function ConfirmDelete({ route, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function doDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/routes/${encodeURIComponent(route.id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `http ${res.status}`);
      }
      onConfirm();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-ink-50 rounded-2xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg font-bold text-ink-800">删除路线?</h3>
        <p className="mt-2 text-sm text-ink-600">
          这会永久删除路线 <span className="font-semibold">{route.name}</span>{" "}
          以及它所有的 stops。这个操作不能撤销。
        </p>
        {error && (
          <p className="mt-2 text-xs text-red-600">删除失败: {error}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-full bg-ink-100 text-ink-700 text-sm"
          >
            取消
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={busy}
            className="px-4 py-2 rounded-full bg-red-600 text-white text-sm disabled:bg-red-300"
          >
            {busy ? "删除中…" : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/routes", { cache: "no-store" });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const data = await res.json();
      setRoutes(data.routes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold">路线</h1>
          <p className="mt-1 text-sm text-ink-500">
            含草稿 ({routes.filter((r) => !r.isPublished).length} 条),
            按发布日期倒序。
          </p>
        </div>
        <Link
          href="/admin/routes/new"
          className="px-4 py-2 rounded-full bg-ink-800 text-ink-50 text-sm shrink-0"
        >
          + 新建
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          加载失败: {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-sm text-ink-400 py-10">加载中…</div>
      )}

      <ul className="space-y-2">
        {routes.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl bg-white border border-ink-100 px-4 py-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-800 truncate">
                  {r.name}
                </span>
                {!r.isPublished && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px]">
                    草稿
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-ink-400 flex flex-wrap gap-2">
                <span>{r.id}</span>
                <span>·</span>
                <span>{r.district}</span>
                <span>·</span>
                <span>{r.distanceKm} km</span>
                <span>·</span>
                <span>{r.stops?.length || 0} stops</span>
                <span>·</span>
                <span>{r.publishedAt}</span>
              </div>
            </div>
            <Link
              href={`/admin/routes/${r.id}`}
              className="px-3 py-1.5 rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200 text-xs"
            >
              编辑
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(r)}
              className="px-3 py-1.5 rounded-full text-red-600 hover:bg-red-50 text-xs"
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {confirming && (
        <ConfirmDelete
          route={confirming}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            setConfirming(null);
            load();
          }}
        />
      )}
    </div>
  );
}
