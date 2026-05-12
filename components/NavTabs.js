"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "路线", match: (p) => p === "/" || p.startsWith("/route") },
  { href: "/footprint", label: "足迹", match: (p) => p.startsWith("/footprint") },
];

export default function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[800] bg-ink-50/95 backdrop-blur border-t border-ink-100 pb-safe">
      <div className="max-w-2xl mx-auto grid grid-cols-2">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`py-4 text-center text-base ${
                active ? "text-ink-800 font-semibold" : "text-ink-400"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
