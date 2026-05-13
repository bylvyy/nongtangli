"use client";

import { useT } from "../lib/i18n";
import {
  localizeAtmosphere,
  localizeIntensity,
  localizeTheme,
} from "../lib/routes";

const INTENSITIES = ["轻松散步", "中等步行", "长距离暴走"];

export default function FilterBar({
  themes,
  atmospheres,
  active,
  onChange,
}) {
  const { t, lang } = useT();

  function setKey(k, v) {
    onChange({ ...active, [k]: active[k] === v ? null : v });
  }

  function Group({ title, items, k, localize }) {
    return (
      <div>
        <div className="text-[11px] text-ink-400 mb-1">{title}</div>
        <div className="flex gap-1.5 flex-wrap">
          {items.map((it) => (
            <button
              key={it}
              onClick={() => setKey(k, it)}
              className={active[k] === it ? "tag-chip-strong" : "tag-chip"}
            >
              {localize ? localize(it, lang) : it}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 rounded-2xl border border-ink-100 bg-white">
      <Group
        title={t("filter.theme")}
        items={themes}
        k="theme"
        localize={localizeTheme}
      />
      <Group
        title={t("filter.intensity")}
        items={INTENSITIES}
        k="intensity"
        localize={localizeIntensity}
      />
      <Group
        title={t("filter.atmosphere")}
        items={atmospheres}
        k="atmosphere"
        localize={localizeAtmosphere}
      />
      {(active.theme || active.intensity || active.atmosphere) && (
        <button
          className="text-xs text-ink-400 underline"
          onClick={() =>
            onChange({ theme: null, intensity: null, atmosphere: null })
          }
        >
          {t("filter.clear")}
        </button>
      )}
    </div>
  );
}
