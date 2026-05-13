"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "../lib/i18n";

export default function NavTabs() {
  const pathname = usePathname() || "/";
  const { t } = useT();
  if (pathname.startsWith("/route/")) return null;
  const tabs = [
    {
      href: "/",
      label: t("nav.routes"),
      match: (p) => p === "/" || p.startsWith("/route"),
    },
    {
      href: "/footprint",
      label: t("nav.footprint"),
      match: (p) => p.startsWith("/footprint"),
    },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[800] bg-ink-50/95 backdrop-blur border-t border-ink-100 pb-safe">
      <div className="max-w-2xl mx-auto grid grid-cols-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-4 text-center text-base ${
                active ? "text-ink-800 font-semibold" : "text-ink-400"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
