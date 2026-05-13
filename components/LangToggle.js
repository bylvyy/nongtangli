"use client";

import { useT } from "../lib/i18n";

export default function LangToggle({ className = "" }) {
  const { lang, setLang, t } = useT();
  const next = lang === "zh" ? "en" : "zh";
  const label = lang === "zh" ? "EN" : "中";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t("lang.toggle.aria")}
      className={`text-[11px] font-medium px-2 py-1 rounded-full border border-ink-200 text-ink-600 hover:text-ink-800 hover:border-ink-400 transition ${className}`}
    >
      {label}
    </button>
  );
}
