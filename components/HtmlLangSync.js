"use client";

import { useEffect } from "react";
import { useT } from "../lib/i18n";

// 让 <html lang> 跟随用户选择,主要影响屏幕阅读器和浏览器翻译启发。
export default function HtmlLangSync() {
  const { lang } = useT();
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);
  return null;
}
