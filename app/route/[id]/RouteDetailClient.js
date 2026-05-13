"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapView from "../../../components/MapView";
import PointStop from "../../../components/PointStop";
import RouteActions from "../../../components/RouteActions";
import LangToggle from "../../../components/LangToggle";
import { useGeolocation } from "../../../lib/useGeolocation";
import { useDeviceHeading } from "../../../lib/useDeviceHeading";
import {
  deriveIntensity,
  localizeAtmosphere,
  localizeDistrict,
  localizeField,
  localizeIntensity,
  localizeTheme,
} from "../../../lib/routes";
import { useT } from "../../../lib/i18n";

export default function RouteDetailClient({ route }) {
  const { t, lang } = useT();
  const [focus, setFocus] = useState(null);
  const [follow, setFollow] = useState(false);
  const geo = useGeolocation();
  const heading = useDeviceHeading();
  const router = useRouter();
  const intensity = deriveIntensity(route.distanceKm);

  const name = localizeField(route, "name", lang);
  const hook = localizeField(route, "hook", lang);

  function onBack(e) {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  // 卡片滑过某阈值后,顶栏标题渐显
  const cardTitleRef = useRef(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    showToast(ok ? t("detail.share.success") : t("detail.share.fail"));
  }

  useEffect(() => {
    const el = cardTitleRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setTitleVisible(!entry.isIntersecting),
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="-mt-4 -mx-4">
      {/* 详情页专属顶栏 — 透明覆盖在地图上 */}
      <div className="sticky top-0 z-[800] h-14 px-3 flex items-center gap-2 bg-ink-50/0 backdrop-blur-0 transition-colors">
        <div className={`absolute inset-0 -z-10 transition-all ${
          titleVisible
            ? "bg-ink-50/90 backdrop-blur border-b border-ink-100"
            : "bg-transparent"
        }`} />
        <a
          href="/"
          onClick={onBack}
          aria-label={t("nav.back")}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
            titleVisible
              ? "text-ink-800 hover:bg-ink-100"
              : "bg-white/90 backdrop-blur text-ink-800 shadow"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </a>
        <div
          className={`min-w-0 flex-1 text-[15px] font-semibold text-ink-800 truncate transition-opacity duration-200 ${
            titleVisible ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!titleVisible}
        >
          {name}
        </div>
        <LangToggle
          className={
            titleVisible
              ? ""
              : "bg-white/90 backdrop-blur border-transparent shadow"
          }
        />
        <button
          type="button"
          onClick={onShare}
          aria-label={t("nav.share")}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
            titleVisible
              ? "text-ink-800 hover:bg-ink-100"
              : "bg-white/90 backdrop-blur text-ink-800 shadow"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4" />
            <path d="M15.4 6.5l-6.8 4" />
          </svg>
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[900] pointer-events-none">
          <div className="px-4 py-2.5 rounded-xl bg-ink-800/95 text-ink-50 text-sm shadow-lg max-w-[80vw] text-center">
            {toast}
          </div>
        </div>
      )}

      {/* hero 地图 — sticky 顶部,卡片向上覆盖 */}
      <div className="sticky top-0 -mt-14 h-[55vh] z-0 bg-ink-100">
        <MapView
          stops={route.stops}
          walkingPath={route.walkingPath}
          focusIndex={focus}
          geo={geo}
          heading={heading}
          follow={follow && geo.state === "watching"}
          setFollow={setFollow}
        />
      </div>

      {/* 信息卡片 — 向上覆盖地图,自然滚到顶部 */}
      <div className="relative z-10 -mt-8 bg-ink-50 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        {/* 抓取条 */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-ink-200" />
        </div>

        <div className="px-4 pb-6 space-y-5">
          {/* 标题区 */}
          <header ref={cardTitleRef} className="pt-2">
            <h1 className="font-serif text-2xl font-bold text-ink-800 leading-snug">
              {name}
            </h1>
            <p className="mt-2 text-sm text-ink-600">{hook}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="tag-chip">{localizeTheme(route.theme, lang)}</span>
              <span className="tag-chip">
                {localizeIntensity(intensity, lang)}
              </span>
              <span className="tag-chip">
                {localizeAtmosphere(route.atmosphere, lang)}
              </span>
              <span className="tag-chip">
                {localizeDistrict(route.district, lang)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-ink-400">
              <span>{route.distanceKm} km</span>
              <span>·</span>
              <span>
                {t("card.hours", { n: Math.round(route.durationMin / 30) / 2 })}
              </span>
              <span>·</span>
              <span>
                {route.stops.length} {t("stats.stops")}
              </span>
            </div>
          </header>

          <RouteActions routeId={route.id} />

          <p className="text-[11px] text-ink-400 leading-relaxed">
            {t("detail.tip")}
          </p>

          {/* 地点序列 */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink-800 mb-3">
              {t("detail.section.stops")}
            </h2>
            <div>
              {route.stops.map((s, i) => (
                <PointStop
                  key={i}
                  stop={s}
                  index={i}
                  total={route.stops.length}
                  isFocused={focus === i}
                  onLocate={(idx) => {
                    setFocus(idx);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
