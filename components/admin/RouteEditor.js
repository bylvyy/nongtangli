"use client";

// 路线编辑器 - 新建 / 编辑共用。提交到 POST /api/admin/routes (upsert)。
// 设计选择: 经纬度用数字输入框 + 行内小地图选点, 因为后台用户都是编辑组员, 不需要
// 完整的 GIS 工具, 但需要一个直观的"我点的就是这里"的反馈。

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StopMapPicker from "./StopMapPicker";
import {
  ATMOSPHERES,
  THEMES,
  deriveIntensity,
} from "../../lib/routes";

const DISTRICTS = [
  "徐汇",
  "普陀-静安",
  "黄浦",
  "杨浦",
  "长宁",
  "虹口",
  "黄浦-徐汇",
  "静安-长宁",
  "静安",
];

function emptyStop() {
  return {
    name: "",
    name_en: "",
    story: "",
    story_en: "",
    coords: [null, null],
    photos: [],
  };
}

function emptyRoute() {
  return {
    id: "",
    name: "",
    name_en: "",
    hook: "",
    hook_en: "",
    theme: THEMES[0],
    atmosphere: ATMOSPHERES[0],
    district: DISTRICTS[0],
    distanceKm: 3,
    durationMin: 90,
    tags: [],
    coverColor: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    isPublished: true,
    stops: [],
  };
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-500">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-ink-400 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:border-ink-400";

export default function RouteEditor({ initial, mode }) {
  const router = useRouter();
  const isNew = mode === "new";
  const [route, setRoute] = useState(initial || emptyRoute());
  const [tagsRaw, setTagsRaw] = useState((initial?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successAt, setSuccessAt] = useState(null);

  const intensityAuto = useMemo(
    () => deriveIntensity(Number(route.distanceKm) || 0),
    [route.distanceKm],
  );

  function set(field, value) {
    setRoute((r) => ({ ...r, [field]: value }));
  }

  function setStop(i, patch) {
    setRoute((r) => {
      const stops = r.stops.slice();
      stops[i] = { ...stops[i], ...patch };
      return { ...r, stops };
    });
  }

  function addStop() {
    setRoute((r) => ({ ...r, stops: [...r.stops, emptyStop()] }));
  }

  function removeStop(i) {
    setRoute((r) => {
      const stops = r.stops.slice();
      stops.splice(i, 1);
      return { ...r, stops };
    });
  }

  function moveStop(i, delta) {
    setRoute((r) => {
      const stops = r.stops.slice();
      const j = i + delta;
      if (j < 0 || j >= stops.length) return r;
      [stops[i], stops[j]] = [stops[j], stops[i]];
      return { ...r, stops };
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const tags = tagsRaw
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...route,
        tags,
        distanceKm: Number(route.distanceKm),
        durationMin: parseInt(route.durationMin, 10),
        intensity: intensityAuto,
        stops: route.stops.map((s) => ({
          name: s.name,
          name_en: s.name_en,
          story: s.story,
          story_en: s.story_en,
          lat: Number(s.coords?.[0]),
          lng: Number(s.coords?.[1]),
          photos: s.photos || [],
        })),
      };

      const res = await fetch("/api/admin/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `http ${res.status}`);
      }
      setSuccessAt(Date.now());
      if (isNew) {
        router.push(`/admin/routes/${payload.id}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold">
            {isNew ? "新建路线" : "编辑路线"}
          </h1>
          {!isNew && (
            <p className="mt-1 text-sm text-ink-500">id: {route.id}</p>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-full bg-ink-800 text-ink-50 text-sm disabled:bg-ink-300"
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {successAt && !error && (
        <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          已保存 ✓
        </div>
      )}

      <section className="rounded-2xl bg-white border border-ink-100 p-5 space-y-3">
        <h2 className="font-serif text-base font-semibold">基础</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="路线 id (slug)" hint="新建后不可改, 仅 a-z 0-9 -">
            <input
              className={inputCls}
              value={route.id}
              onChange={(e) =>
                set(
                  "id",
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                )
              }
              disabled={!isNew}
              placeholder="例: anfu-road"
            />
          </Field>

          <Field label="发布日期">
            <input
              type="date"
              className={inputCls}
              value={route.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
            />
          </Field>

          <Field label="名称 (中)">
            <input
              className={inputCls}
              value={route.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="名称 (EN)">
            <input
              className={inputCls}
              value={route.name_en || ""}
              onChange={(e) => set("name_en", e.target.value)}
            />
          </Field>

          <Field label="hook (中)">
            <textarea
              rows={2}
              className={inputCls}
              value={route.hook || ""}
              onChange={(e) => set("hook", e.target.value)}
            />
          </Field>
          <Field label="hook (EN)">
            <textarea
              rows={2}
              className={inputCls}
              value={route.hook_en || ""}
              onChange={(e) => set("hook_en", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="主题">
            <select
              className={inputCls}
              value={route.theme}
              onChange={(e) => set("theme", e.target.value)}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="氛围">
            <select
              className={inputCls}
              value={route.atmosphere}
              onChange={(e) => set("atmosphere", e.target.value)}
            >
              {ATMOSPHERES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="行政区">
            <select
              className={inputCls}
              value={route.district}
              onChange={(e) => set("district", e.target.value)}
            >
              {DISTRICTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="状态">
            <select
              className={inputCls}
              value={route.isPublished ? "published" : "draft"}
              onChange={(e) =>
                set("isPublished", e.target.value === "published")
              }
            >
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="距离 (km)">
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={route.distanceKm}
              onChange={(e) => set("distanceKm", e.target.value)}
            />
          </Field>
          <Field label="预计时长 (分钟)">
            <input
              type="number"
              step="5"
              className={inputCls}
              value={route.durationMin}
              onChange={(e) => set("durationMin", e.target.value)}
            />
          </Field>
          <Field label="强度 (自动)">
            <input className={inputCls} value={intensityAuto} disabled />
          </Field>
          <Field label="封面色 (可选)" hint="例: #b35a3c">
            <input
              className={inputCls}
              value={route.coverColor || ""}
              onChange={(e) => set("coverColor", e.target.value)}
            />
          </Field>
        </div>

        <Field label="标签 (逗号分隔)">
          <input
            className={inputCls}
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </Field>
      </section>

      <section className="rounded-2xl bg-white border border-ink-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold">
            Stops ({route.stops.length})
          </h2>
          <button
            type="button"
            onClick={addStop}
            className="px-3 py-1.5 rounded-full bg-ink-100 text-ink-700 text-xs hover:bg-ink-200"
          >
            + 新增 stop
          </button>
        </div>

        {route.stops.length === 0 && (
          <p className="text-sm text-ink-400">还没有 stop。点击右上角新增。</p>
        )}

        <ul className="space-y-3">
          {route.stops.map((s, i) => {
            const lat = Number(s.coords?.[0]);
            const lng = Number(s.coords?.[1]);
            return (
              <li
                key={i}
                className="rounded-xl border border-ink-100 p-3 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">#{i + 1}</span>
                  <input
                    className={`${inputCls} mt-0 flex-1`}
                    value={s.name}
                    placeholder="名称 (中)"
                    onChange={(e) => setStop(i, { name: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => moveStop(i, -1)}
                    disabled={i === 0}
                    className="px-2 py-1 rounded text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStop(i, 1)}
                    disabled={i === route.stops.length - 1}
                    className="px-2 py-1 rounded text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStop(i)}
                    className="px-2 py-1 rounded text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>

                <input
                  className={inputCls}
                  value={s.name_en || ""}
                  placeholder="名称 (EN)"
                  onChange={(e) => setStop(i, { name_en: e.target.value })}
                />

                <textarea
                  rows={2}
                  className={inputCls}
                  value={s.story || ""}
                  placeholder="故事 (中)"
                  onChange={(e) => setStop(i, { story: e.target.value })}
                />
                <textarea
                  rows={2}
                  className={inputCls}
                  value={s.story_en || ""}
                  placeholder="故事 (EN)"
                  onChange={(e) => setStop(i, { story_en: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Field label="纬度 (WGS84)">
                    <input
                      type="number"
                      step="0.000001"
                      className={inputCls}
                      value={Number.isFinite(lat) ? lat : ""}
                      onChange={(e) =>
                        setStop(i, {
                          coords: [parseFloat(e.target.value), lng],
                        })
                      }
                    />
                  </Field>
                  <Field label="经度 (WGS84)">
                    <input
                      type="number"
                      step="0.000001"
                      className={inputCls}
                      value={Number.isFinite(lng) ? lng : ""}
                      onChange={(e) =>
                        setStop(i, {
                          coords: [lat, parseFloat(e.target.value)],
                        })
                      }
                    />
                  </Field>
                </div>

                <StopMapPicker
                  lat={lat}
                  lng={lng}
                  onChange={(nlat, nlng) =>
                    setStop(i, { coords: [nlat, nlng] })
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-full bg-ink-800 text-ink-50 text-sm disabled:bg-ink-300"
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </div>
  );
}
