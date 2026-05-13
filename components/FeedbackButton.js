"use client";

// 全局右下角的反馈悬浮按钮 + 弹窗。详情页 (/route/*) 已经有底部悬浮操作条,
// 在那种页面隐藏自己,避免重叠。提交到 /api/feedback,带上 page 字段方便后台
// 知道反馈是从哪条路线来的。

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "../lib/i18n";

const CLIENT_ID_KEY = "rating:clientId"; // 与 RatingWidget 共用,匿名标识
const MAX_MESSAGE = 2000;
const MAX_CONTACT = 200;

const CATEGORIES = [
  { value: "general", labelKey: "feedback.category.general" },
  { value: "suggestion", labelKey: "feedback.category.suggestion" },
  { value: "bug", labelKey: "feedback.category.bug" },
];

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

export default function FeedbackButton() {
  const { t } = useT();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState("idle"); // idle | submitting | done | error

  // 路线详情页底部已有 sticky 操作条 (RouteActions),为了不互相挡,这种页面藏起 FAB
  const hidden = pathname.startsWith("/route/") || pathname.startsWith("/admin");

  // ESC 关闭 + 弹窗打开时锁定 body 滚动
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function reset() {
    setCategory("general");
    setMessage("");
    setContact("");
    setState("idle");
  }

  function close() {
    setOpen(false);
    // 留一会儿再清,避免关闭动画里看到状态闪回
    setTimeout(reset, 250);
  }

  async function submit() {
    const trimmed = message.trim();
    if (!trimmed || state === "submitting") return;
    setState("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: trimmed,
          contact: contact.trim() || undefined,
          page: pathname,
          clientId: getOrCreateClientId(),
        }),
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        aria-label={t("feedback.fab")}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[700] w-12 h-12 rounded-full bg-ink-800 text-ink-50 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full sm:max-w-md bg-ink-50 rounded-t-3xl sm:rounded-3xl shadow-xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {state === "done" ? (
              <div className="text-center py-8">
                <p className="text-base text-ink-800">{t("feedback.thanks")}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-4 px-5 py-2 rounded-full bg-ink-800 text-ink-50 text-sm"
                >
                  {t("feedback.close")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink-800">
                      {t("feedback.title")}
                    </h3>
                    <p className="mt-1 text-xs text-ink-500">
                      {t("feedback.subtitle")}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("feedback.close")}
                    onClick={close}
                    className="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center text-ink-500 shrink-0"
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
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex gap-1.5">
                  {CATEGORIES.map((c) => {
                    const active = c.value === category;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className={`px-3 py-1.5 rounded-full text-xs transition ${
                          active
                            ? "bg-ink-800 text-ink-50"
                            : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                        }`}
                      >
                        {t(c.labelKey)}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value.slice(0, MAX_MESSAGE))
                  }
                  placeholder={t("feedback.messagePlaceholder")}
                  rows={5}
                  autoFocus
                  className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:border-ink-400 resize-none"
                />

                <input
                  type="text"
                  value={contact}
                  onChange={(e) =>
                    setContact(e.target.value.slice(0, MAX_CONTACT))
                  }
                  placeholder={t("feedback.contactPlaceholder")}
                  className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:border-ink-400"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-ink-400">
                    {message.length}/{MAX_MESSAGE}
                  </span>
                  <button
                    type="button"
                    disabled={!message.trim() || state === "submitting"}
                    onClick={submit}
                    className="px-5 py-2 rounded-full bg-ink-800 text-ink-50 text-sm font-medium disabled:bg-ink-300 disabled:text-ink-50 transition"
                  >
                    {state === "submitting"
                      ? t("feedback.submitting")
                      : t("feedback.submit")}
                  </button>
                </div>

                {state === "error" && (
                  <p className="mt-2 text-xs text-red-500">
                    {t("feedback.error")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
