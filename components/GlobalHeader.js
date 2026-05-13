"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "../lib/i18n";
import LangToggle from "./LangToggle";

export default function GlobalHeader() {
  const pathname = usePathname() || "/";
  const { t } = useT();

  // 路线详情页用自己的顶栏; 后台用 admin 自己的 chrome
  if (pathname.startsWith("/route/")) return null;
  if (pathname.startsWith("/admin")) return null;

  const isFootprint = pathname.startsWith("/footprint");

  return (
    <header className="sticky top-0 z-[800] backdrop-blur bg-ink-50/90 border-b border-ink-100">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {isFootprint ? (
          <>
            <span className="text-lg font-serif font-bold text-ink-800">
              {t("footprint.title")}
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs text-ink-400 hover:text-ink-800 transition"
              >
                {t("nav.backToRoutes")}
              </Link>
              <LangToggle />
            </div>
          </>
        ) : (
          <>
            <Link
              href="/"
              className="text-lg font-serif font-bold text-ink-800"
            >
              {t("app.name")}
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-400 hidden sm:inline">
                {t("app.tagline")}
              </span>
              <LangToggle />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
