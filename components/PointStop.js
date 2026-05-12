"use client";

function navigateUrl(stop) {
  const [lat, lng] = stop.coords;
  // 高德 URI scheme,手机有高德 app 会拉起,否则跳网页版
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(
    stop.name,
  )}&src=nongtangli&coordinate=wgs84&callnative=1`;
}

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
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onLocate?.(index)}
            className="text-[11px] text-ink-400 hover:text-ink-800"
          >
            地图定位
          </button>
          <a
            href={navigateUrl(stop)}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-brick-500 hover:text-brick-600"
          >
            导航 →
          </a>
        </div>
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
