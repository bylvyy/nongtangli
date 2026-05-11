"use client";

export default function PointStop({ stop, index, total, onLocate, isFocused }) {
  return (
    <div
      className={`relative pl-8 pb-6 ${
        index === total - 1 ? "" : "border-l-2 border-dashed border-ink-200 ml-3"
      }`}
    >
      <div
        className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
          isFocused
            ? "bg-brick-500 text-white"
            : "bg-ink-50 border-2 border-ink-800 text-ink-800"
        }`}
      >
        {index + 1}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-serif text-base font-semibold text-ink-800">
          {stop.name}
        </h4>
        <button
          onClick={() => onLocate?.(index)}
          className="text-[11px] text-ink-400 hover:text-ink-800 shrink-0"
        >
          地图定位 →
        </button>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{stop.story}</p>
      {stop.photos?.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
          {stop.photos.map((p, i) => (
            <img
              key={i}
              src={p}
              alt=""
              className="h-24 w-32 object-cover rounded-lg border border-ink-100"
            />
          ))}
        </div>
      )}
    </div>
  );
}
