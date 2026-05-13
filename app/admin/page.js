"use client";

// 后台首页: 三块入口 + 关键数字。数字在客户端拉, 失败也只是显示 — , 不影响导航。

import Link from "next/link";
import { useEffect, useState } from "react";

function StatCard({ label, value, href }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-white border border-ink-100 px-4 py-5 hover:border-ink-300 transition"
    >
      <div className="text-xs text-ink-400">{label}</div>
      <div className="mt-1 text-2xl font-serif font-bold text-ink-800">
        {value ?? "—"}
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    routes: null,
    drafts: null,
    unread: null,
    ratings: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/admin/routes").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/feedback?status=unread").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ratings").then((r) => r.json()).catch(() => null),
    ]).then(([routesRes, fbRes, rtRes]) => {
      if (cancelled) return;
      const all = routesRes?.routes || [];
      const drafts = all.filter((r) => !r.isPublished).length;
      const ratingsTotal = (rtRes?.summary || []).reduce(
        (sum, s) => sum + Number(s.count || 0),
        0,
      );
      setStats({
        routes: all.length,
        drafts,
        unread: (fbRes?.feedback || []).length,
        ratings: ratingsTotal,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">概览</h1>
        <p className="mt-1 text-sm text-ink-500">
          路线、反馈、评分的入口。数字会在打开时刷新一次。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="已发布路线" value={stats.routes} href="/admin/routes" />
        <StatCard label="草稿" value={stats.drafts} href="/admin/routes" />
        <StatCard
          label="未读反馈"
          value={stats.unread}
          href="/admin/feedback?status=unread"
        />
        <StatCard label="累计评分" value={stats.ratings} href="/admin/ratings" />
      </div>

      <div className="rounded-2xl bg-white border border-ink-100 p-5 space-y-3">
        <h2 className="font-serif text-base font-semibold">快捷入口</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            href="/admin/routes/new"
            className="px-4 py-2.5 rounded-full bg-ink-800 text-ink-50 text-sm text-center"
          >
            新建路线
          </Link>
          <Link
            href="/admin/routes"
            className="px-4 py-2.5 rounded-full bg-ink-100 text-ink-800 text-sm text-center"
          >
            管理路线
          </Link>
          <Link
            href="/admin/feedback"
            className="px-4 py-2.5 rounded-full bg-ink-100 text-ink-800 text-sm text-center"
          >
            查看反馈
          </Link>
        </div>
      </div>
    </div>
  );
}
