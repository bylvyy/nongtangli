"use client";

import { useT } from "../lib/i18n";

// 路线详情页的主 CTA — "开始路线" → 进入行走模式
//
// 视觉上比 NavigateToStart / RouteActions 都强 (实心 brick 色, 大字),
// 这是 citywalk 产品的核心动作。
export default function StartWalkingButton({ onStart }) {
  const { t } = useT();
  return (
    <button
      onClick={onStart}
      className="w-full py-3 rounded-xl text-base font-semibold bg-brick-500 text-white shadow-sm hover:bg-brick-600 transition flex items-center justify-center gap-2"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M13 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        <path d="M9.5 21l1-6.5L8 13l-1 4" />
        <path d="M14.5 14l-2-2.5h-3l-2 5" />
        <path d="M14.5 14l3 2.5L20 14" />
      </svg>
      {t("detail.actions.startWalk")}
    </button>
  );
}
