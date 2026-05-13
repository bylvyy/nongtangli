"use client";

// 反馈列表: 全部 / 未读 切换。点行展开正文+联系方式, 提供"标记已读"按钮。
// 列表只取最近 500 条 (后端 LIMIT), 量大了再做分页。

import { useEffect, useState } from "react";

const CATEGORY_LABELS = {
  general: "聊聊",
  suggestion: "建议",
  bug: "Bug",
};

function CategoryChip({ value }) {
  const label = CATEGORY_LABELS[value] || value;
  const tone =
    value === "bug"
      ? "bg-red-100 text-red-700"
      : value === "suggestion"
      ? "bg-amber-100 text-amber-800"
      : "bg-ink-100 text-ink-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] ${tone}`}>
      {label}
    </span>
  );
}

function fmt(ts) {
  if (!ts) return "—";
  // sqlite 默认是 "YYYY-MM-DD HH:MM:SS" UTC
  return ts.replace("T", " ").slice(0, 16);
}

export default function FeedbackPage() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  async function load(status) {
    setLoading(true);
    setError(null);
    try {
      const url =
        status === "unread"
          ? "/api/admin/feedback?status=unread"
          : "/api/admin/feedback";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const data = await res.json();
      setItems(data.feedback || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filter);
  }, [filter]);

  async function markRead(id, isRead) {
    try {
      await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead }),
      });
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, is_read: isRead ? 1 : 0 } : it,
        ),
      );
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-bold">反馈</h1>
        <p className="mt-1 text-sm text-ink-500">
          按时间倒序, 最近 500 条。点击展开正文 / 联系方式。
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { v: "all", label: "全部" },
          { v: "unread", label: "未读" },
        ].map((opt) => {
          const active = filter === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => setFilter(opt.v)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                active
                  ? "bg-ink-800 text-ink-50"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => load(filter)}
          className="ml-auto px-3 py-1.5 rounded-full bg-ink-100 text-ink-600 hover:bg-ink-200 text-xs"
        >
          刷新
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          加载失败: {error}
        </div>
      )}

      {loading && !error && (
        <div className="text-center text-sm text-ink-400 py-10">加载中…</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center text-sm text-ink-400 py-10">没有反馈</div>
      )}

      <ul className="space-y-2">
        {items.map((it) => {
          const open = openId === it.id;
          const unread = !it.is_read;
          return (
            <li
              key={it.id}
              className={`rounded-2xl bg-white border transition ${
                unread ? "border-ink-300" : "border-ink-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : it.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryChip value={it.category} />
                    {unread && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px]">
                        未读
                      </span>
                    )}
                    <span className="text-[11px] text-ink-400">
                      {fmt(it.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-800 line-clamp-2">
                    {it.message}
                  </p>
                  {it.page && (
                    <p className="mt-1 text-[11px] text-ink-400 truncate">
                      来自: {it.page}
                    </p>
                  )}
                </div>
                <span
                  className={`text-ink-400 mt-1 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 border-t border-ink-100 pt-3 space-y-2">
                  <p className="text-sm text-ink-800 whitespace-pre-wrap">
                    {it.message}
                  </p>
                  {it.contact && (
                    <p className="text-xs text-ink-500">
                      联系方式: <span className="text-ink-800">{it.contact}</span>
                    </p>
                  )}
                  {it.client_id && (
                    <p className="text-[11px] text-ink-400">
                      clientId: {it.client_id}
                    </p>
                  )}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => markRead(it.id, !unread ? 0 : 1)}
                      className="px-3 py-1.5 rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200 text-xs"
                    >
                      {unread ? "标记已读" : "标记未读"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
