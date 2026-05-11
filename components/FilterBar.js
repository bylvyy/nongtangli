"use client";

const INTENSITIES = ["轻松散步", "中等步行", "长距离暴走"];

export default function FilterBar({
  themes,
  atmospheres,
  active,
  onChange,
}) {
  function setKey(k, v) {
    onChange({ ...active, [k]: active[k] === v ? null : v });
  }

  function Group({ title, items, k }) {
    return (
      <div>
        <div className="text-[11px] text-ink-400 mb-1">{title}</div>
        <div className="flex gap-1.5 flex-wrap">
          {items.map((it) => (
            <button
              key={it}
              onClick={() => setKey(k, it)}
              className={
                active[k] === it ? "tag-chip-strong" : "tag-chip"
              }
            >
              {it}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 rounded-2xl border border-ink-100 bg-white">
      <Group title="主题" items={themes} k="theme" />
      <Group title="强度" items={INTENSITIES} k="intensity" />
      <Group title="氛围" items={atmospheres} k="atmosphere" />
      {(active.theme || active.intensity || active.atmosphere) && (
        <button
          className="text-xs text-ink-400 underline"
          onClick={() => onChange({ theme: null, intensity: null, atmosphere: null })}
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
