"use client";

import { useFootprint } from "../lib/useFootprint";
import { toggleWalked, toggleWishlist } from "../lib/footprint";

export default function RouteActions({ routeId }) {
  const fp = useFootprint();
  const walked = fp.walked.includes(routeId);
  const wished = fp.wishlist.includes(routeId);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => toggleWalked(routeId)}
        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
          walked
            ? "bg-moss-600 text-ink-50"
            : "bg-ink-50 text-ink-800 border border-ink-200"
        }`}
      >
        {walked ? "✓ 已走过" : "标记走过"}
      </button>
      <button
        onClick={() => toggleWishlist(routeId)}
        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
          wished
            ? "bg-brick-500 text-ink-50"
            : "bg-ink-50 text-ink-800 border border-ink-200"
        }`}
      >
        {wished ? "★ 在清单中" : "加入想去清单"}
      </button>
    </div>
  );
}
