"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "概览", match: (p) => p === "/admin" },
  {
    href: "/admin/routes",
    label: "路线",
    match: (p) => p.startsWith("/admin/routes"),
  },
  {
    href: "/admin/feedback",
    label: "反馈",
    match: (p) => p.startsWith("/admin/feedback"),
  },
  {
    href: "/admin/ratings",
    label: "评分",
    match: (p) => p.startsWith("/admin/ratings"),
  },
];

export default function AdminHeader() {
  const pathname = usePathname() || "/admin";
  return (
    <header className="sticky top-0 z-[800] backdrop-blur bg-ink-50/90 border-b border-ink-100">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="font-serif text-lg font-bold text-ink-800"
        >
          弄堂里 · 后台
        </Link>
        <Link
          href="/"
          className="text-xs text-ink-400 hover:text-ink-800 transition"
        >
          回到前台 →
        </Link>
      </div>
      <nav className="max-w-3xl mx-auto px-4 -mt-1 pb-2 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
                active
                  ? "bg-ink-800 text-ink-50"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
