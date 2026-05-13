"use client";

// 路线详情页底部的快速评分组件。1-5 星 + 可选评论,提交到 /api/ratings。
// 评分结果只进 D1 给管理后台看,不在用户侧展示其他人的分。
// 用 localStorage 记一个匿名 clientId + 已评分路线集合,做一道弱去重(防止同一浏览器
// 反复提交)。这道防线只是 UX 兜底,真正的去重/反作弊不在 V1 范围内。

import { useEffect, useState } from "react";
import { useT } from "../lib/i18n";

const CLIENT_ID_KEY = "rating:clientId";
const RATED_SET_KEY = "rating:rated:v1";
const MAX_COMMENT = 500;

function getOrCreateClientId() {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = `c_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      window.localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function readRatedSet() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(RATED_SET_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markRated(routeId) {
  if (typeof window === "undefined") return;
  try {
    const set = readRatedSet();
    set.add(routeId);
    window.localStorage.setItem(
      RATED_SET_KEY,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    // ignore
  }
}

export default function RatingWidget({ routeId }) {
  const { t } = useT();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState("idle"); // idle | submitting | done | error
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    if (readRatedSet().has(routeId)) setAlreadyRated(true);
  }, [routeId]);

  if (alreadyRated) {
    return (
      <section className="mt-4 rounded-2xl bg-ink-100/60 px-4 py-5 text-center">
        <p className="text-sm text-ink-600">{t("rating.alreadyRated")}</p>
      </section>
    );
  }

  if (state === "done") {
    return (
      <section className="mt-4 rounded-2xl bg-ink-100/60 px-4 py-5 text-center">
        <p className="text-sm text-ink-600">{t("rating.thanks")}</p>
      </section>
    );
  }

  async function submit() {
    if (stars < 1 || stars > 5 || state === "submitting") return;
    setState("submitting");
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId,
          stars,
          comment: comment.trim() || undefined,
          clientId: getOrCreateClientId(),
        }),
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      markRated(routeId);
      setState("done");
    } catch {
      setState("error");
    }
  }

  const display = hover || stars;

  return (
    <section className="mt-4 rounded-2xl bg-ink-100/60 px-4 py-5">
      <h3 className="font-serif text-base font-semibold text-ink-800">
        {t("rating.title")}
      </h3>
      <p className="mt-1 text-xs text-ink-500">{t("rating.subtitle")}</p>

      <div
        className="mt-3 flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={t("rating.aria", { n })}
            onClick={() => setStars(n)}
            onMouseEnter={() => setHover(n)}
            className="text-3xl leading-none p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ink-300 rounded"
          >
            <span className={n <= display ? "text-amber-400" : "text-ink-300"}>
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
        placeholder={t("rating.commentPlaceholder")}
        rows={2}
        className="mt-3 w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:border-ink-400 resize-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-ink-400">
          {comment.length}/{MAX_COMMENT}
        </span>
        <button
          type="button"
          disabled={stars < 1 || state === "submitting"}
          onClick={submit}
          className="px-4 py-2 rounded-full bg-ink-800 text-ink-50 text-sm font-medium disabled:bg-ink-300 disabled:text-ink-50 transition"
        >
          {state === "submitting" ? t("rating.submitting") : t("rating.submit")}
        </button>
      </div>

      {state === "error" && (
        <p className="mt-2 text-xs text-red-500">{t("rating.error")}</p>
      )}
    </section>
  );
}
