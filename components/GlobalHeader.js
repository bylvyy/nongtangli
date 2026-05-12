"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalHeader() {
  const pathname = usePathname() || "/";

  // 路线详情页用自己的顶栏
  if (pathname.startsWith("/route/")) return null;

  const isFootprint = pathname.startsWith("/footprint");

  return (
    <header
      className={`sticky top-0 z-[800] backdrop-blur border-b transition-colors ${
        isFootprint
          ? "bg-ink-800/95 border-ink-600 text-ink-50"
          : "bg-ink-50/90 border-ink-100 text-ink-800"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-baseline justify-between">
        {isFootprint ? (
          <>
            <span className="text-lg font-serif font-bold">我的足迹</span>
            <span className="text-xs text-ink-200">已走过的上海</span>
          </>
        ) : (
          <>
            <Link
              href="/"
              className="text-lg font-serif font-bold text-ink-800"
            >
              弄堂里
            </Link>
            <span className="text-xs text-ink-400">上海街区漫游 · V1</span>
          </>
        )}
      </div>
    </header>
  );
}
