"use client";

// 极简双语方案: 中文 / 英文。其它语言一律 fallback 到英文。
// - 检测顺序: localStorage 用户手动选择 > navigator.language > 默认 en
// - UI 文案统一从这里取; 路线内容(stop name/story)由 lib/routes.js 提供 *_en 字段
// - 切换语言后会广播 lang-changed 事件, 监听的组件重新读取
//
// 不引入第三方 i18n 库, 因为只有两种语言, 且全部为静态字符串。

import { useEffect, useState } from "react";

const STORAGE_KEY = "lang:v1";

const dict = {
  zh: {
    "app.name": "弄堂里",
    "app.tagline": "上海街区漫游 · V1",
    "app.footer.principle":
      "Citywalk 不是消费主义,所以这里没有一条路线的人均超过 300。",
    "app.footer.cadence": "每周新增 1-2 条 · 每月至少 1 条非梧桐区路线",

    "nav.routes": "路线",
    "nav.footprint": "足迹",
    "nav.back": "返回",
    "nav.share": "分享路线",
    "nav.backToRoutes": "返回路线 →",
    "nav.viewAll": "查看 →",

    "home.myFootprint": "我的上海足迹",
    "home.thisWeek": "本周新上线",
    "home.thisWeek.note": "每周 1-2 条",
    "home.allRoutes": "全部路线",
    "home.sortByDistance": "按距离",
    "home.sortByDistance.locating": "定位中…",
    "home.sortByDistance.denied": "定位被拒",
    "home.sortByDistance.unsupported": "不支持定位",
    "home.sortByDistance.error": "定位失败",
    "home.sortByDistance.active": "按距离 ✓",
    "home.filter": "筛选",
    "home.filter.collapse": "收起筛选",
    "home.filter.empty": "暂无符合筛选的路线",

    "filter.theme": "主题",
    "filter.intensity": "强度",
    "filter.atmosphere": "氛围",
    "filter.clear": "清除筛选",

    "stats.routes": "条路线",
    "stats.km": "公里",
    "stats.stops": "个地点",

    "footprint.title": "我的足迹",
    "footprint.subtitle": "每次打开都能看到自己走到了哪里",
    "footprint.empty.title": "还没有任何足迹",
    "footprint.empty.body.before": "去看看 ",
    "footprint.empty.body.linkText": "全部路线",
    "footprint.empty.body.after":
      ",选一条走走、收一条想去的,这里就会慢慢长出你自己的上海地图。",
    "footprint.section.badges": "徽章",
    "footprint.section.wishlist": "想去清单",
    "footprint.section.walked": "已走过",
    "footprint.guide.markAfterWalk": "走完一条后回来打勾,就能累积里程和徽章。",
    "footprint.next.5": "走完 5 条解锁「上海漫游者」 · 还差 {n} 条",
    "footprint.next.10": "走完 10 条解锁「深度漫游者」 · 还差 {n} 条",
    "badge.wanderer": "上海漫游者",
    "badge.wanderer.desc": "走完 5 条路线",
    "badge.deepWalker": "深度漫游者",
    "badge.deepWalker.desc": "走完 10 条路线",
    "badge.districtRegular": "{district}熟客",
    "badge.districtRegular.desc": "走完 {district} 全部 {n} 条路线",

    "intensity.easy": "轻松散步",
    "intensity.medium": "中等步行",
    "intensity.hard": "长距离暴走",

    "atmosphere.solo": "适合独自",
    "atmosphere.friends": "适合朋友",
    "atmosphere.date": "适合 date",

    "card.distFromMe": "距我 {dist}",
    "card.wished": "·想去",
    "card.walked": "·已走",
    "card.hours": "{n} 小时",

    "detail.actions.walked": "✓ 已走过",
    "detail.actions.markWalked": "标记走过",
    "detail.actions.wished": "★ 在清单中",
    "detail.actions.addWish": "加入想去清单",
    "detail.actions.navToStart": "导航到起点",
    "nav.sheet.title": "导航到 {name}",
    "nav.option.appleMaps.label": "Apple 地图",
    "nav.option.appleMaps.sub": "iPhone 自带 · 步行路线",
    "nav.option.googleMaps.label": "Google Maps",
    "nav.option.googleMaps.sub": "中国大陆需要 VPN · 装了 app 会自动用 app 打开",
    "nav.option.amapApp.label": "高德地图",
    "nav.option.amapApp.sub": "国内体验最好 · 没装会自动跳网页版",
    "nav.option.amapWeb.label": "高德网页版",
    "nav.option.amapWeb.sub": "无需安装 · 浏览器直接看",
    "detail.actions.startWalk": "开始路线",
    "walking.exit": "退出",
    "walking.stop.distance": "距我 {dist}",
    "walking.stop.eta": "步行约 {min} 分钟",
    "walking.stop.arrived": "已到达",
    "walking.stop.arriving": "快到了",
    "walking.toast.arrived": "已到达 · {name}",
    "walking.prev": "上一站",
    "walking.next": "下一站",
    "walking.next.arrived": "已到达 · 下一站",
    "walking.turn.left": "前方 {dist} 左转",
    "walking.turn.right": "前方 {dist} 右转",
    "walking.turn.left.imminent": "即将左转",
    "walking.turn.right.imminent": "即将右转",
    "walking.turn.straight": "直行 {dist} 到达",
    "walking.turn.straight.short": "直行到达",
    "walking.offroute": "已偏离路线 · 返回路线 {dist}",
    "walking.done": "看完了",
    "walking.complete.title": "走完啦,记录这条路线?",
    "walking.complete.subtitle": "标记走过后会出现在你的足迹里",
    "walking.complete.confirm": "记录",
    "walking.complete.skip": "暂不",
    "walking.escape": "用高德继续步行导航",
    "detail.tip":
      "地图右下圆形按钮定位到我 · 下方“地图定位”放大单点 · “导航”拉起高德步行",
    "detail.section.stops": "地点顺序",
    "detail.share.success": "复制成功,发给好友一起解锁路线吧",
    "detail.share.fail": "复制失败,请手动长按链接复制",

    "stop.locate": "地图定位",
    "stop.navigate": "导航",

    "rating.title": "这条路线怎么样？",
    "rating.subtitle": "给它打个分，帮其他人挑路线",
    "rating.aria": "{n} 星",
    "rating.commentPlaceholder": "走完有什么想说的？(可选)",
    "rating.submit": "提交",
    "rating.submitting": "提交中…",
    "rating.thanks": "谢谢你的反馈 ✓",
    "rating.error": "提交失败，请稍后再试",
    "rating.alreadyRated": "你已经给这条路线评过分了 ✓",

    "feedback.fab": "意见反馈",
    "feedback.title": "聊聊你的想法",
    "feedback.subtitle": "Bug、建议、吐槽都欢迎，我们会读每一条",
    "feedback.category.general": "聊聊",
    "feedback.category.suggestion": "建议",
    "feedback.category.bug": "Bug",
    "feedback.messagePlaceholder": "写点什么…",
    "feedback.contactPlaceholder": "邮箱或微信(可选，方便我们回复)",
    "feedback.submit": "发送",
    "feedback.submitting": "发送中…",
    "feedback.thanks": "已收到，谢谢你 ✓",
    "feedback.error": "发送失败，请稍后再试",
    "feedback.close": "关闭",

    "lang.toggle.aria": "切换语言",
  },
  en: {
    "app.name": "Nongtangli",
    "app.tagline": "Shanghai neighborhood walks · V1",
    "app.footer.principle":
      "Citywalk isn't consumerism — no route here costs more than ¥300 per person.",
    "app.footer.cadence":
      "1–2 new routes weekly · at least one non-Plane-tree route each month",

    "nav.routes": "Routes",
    "nav.footprint": "Footprint",
    "nav.back": "Back",
    "nav.share": "Share route",
    "nav.backToRoutes": "Back to routes →",
    "nav.viewAll": "View →",

    "home.myFootprint": "My Shanghai Footprint",
    "home.thisWeek": "New this week",
    "home.thisWeek.note": "1–2 each week",
    "home.allRoutes": "All routes",
    "home.sortByDistance": "Sort by distance",
    "home.sortByDistance.locating": "Locating…",
    "home.sortByDistance.denied": "Location denied",
    "home.sortByDistance.unsupported": "Location unavailable",
    "home.sortByDistance.error": "Location failed",
    "home.sortByDistance.active": "By distance ✓",
    "home.filter": "Filter",
    "home.filter.collapse": "Hide filter",
    "home.filter.empty": "No routes match this filter.",

    "filter.theme": "Theme",
    "filter.intensity": "Intensity",
    "filter.atmosphere": "Vibe",
    "filter.clear": "Clear filter",

    "stats.routes": "routes",
    "stats.km": "km",
    "stats.stops": "stops",

    "footprint.title": "My Footprint",
    "footprint.subtitle": "See how far you've walked, every time you open this.",
    "footprint.empty.title": "No footprint yet",
    "footprint.empty.body.before": "Browse ",
    "footprint.empty.body.linkText": "all routes",
    "footprint.empty.body.after":
      ", pick one to walk or save one to your wishlist — this page will grow into your own map of Shanghai.",
    "footprint.section.badges": "Badges",
    "footprint.section.wishlist": "Wishlist",
    "footprint.section.walked": "Walked",
    "footprint.guide.markAfterWalk":
      "Mark a route as walked when you finish, and your distance and badges will accumulate here.",
    "footprint.next.5": "Walk 5 routes to unlock “Shanghai Wanderer” — {n} to go",
    "footprint.next.10": "Walk 10 routes to unlock “Deep Wanderer” — {n} to go",
    "badge.wanderer": "Shanghai Wanderer",
    "badge.wanderer.desc": "Walked 5 routes",
    "badge.deepWalker": "Deep Wanderer",
    "badge.deepWalker.desc": "Walked 10 routes",
    "badge.districtRegular": "{district} Regular",
    "badge.districtRegular.desc": "Walked all {n} routes in {district}",

    "intensity.easy": "Easy stroll",
    "intensity.medium": "Moderate walk",
    "intensity.hard": "Long hike",

    "atmosphere.solo": "Solo-friendly",
    "atmosphere.friends": "With friends",
    "atmosphere.date": "Date-worthy",

    "card.distFromMe": "{dist} away",
    "card.wished": "· wishlist",
    "card.walked": "· walked",
    "card.hours": "{n} h",

    "detail.actions.walked": "✓ Walked",
    "detail.actions.markWalked": "Mark as walked",
    "detail.actions.wished": "★ In wishlist",
    "detail.actions.addWish": "Add to wishlist",
    "detail.actions.navToStart": "Navigate to start",
    "nav.sheet.title": "Navigate to {name}",
    "nav.option.appleMaps.label": "Apple Maps",
    "nav.option.appleMaps.sub": "Built-in on iPhone · walking directions",
    "nav.option.googleMaps.label": "Google Maps",
    "nav.option.googleMaps.sub": "Needs VPN in mainland China · opens app if installed",
    "nav.option.amapApp.label": "AMap (Gaode)",
    "nav.option.amapApp.sub": "Best in mainland China · falls back to web if not installed",
    "nav.option.amapWeb.label": "AMap web",
    "nav.option.amapWeb.sub": "No install needed · opens in browser",
    "detail.actions.startWalk": "Start walking",
    "walking.exit": "Exit",
    "walking.stop.distance": "{dist} from you",
    "walking.stop.eta": "~{min} min walk",
    "walking.stop.arrived": "Arrived",
    "walking.stop.arriving": "Almost there",
    "walking.toast.arrived": "Arrived · {name}",
    "walking.prev": "Prev",
    "walking.next": "Next",
    "walking.next.arrived": "Arrived · Next",
    "walking.turn.left": "In {dist}, turn left",
    "walking.turn.right": "In {dist}, turn right",
    "walking.turn.left.imminent": "Turn left now",
    "walking.turn.right.imminent": "Turn right now",
    "walking.turn.straight": "Straight {dist}",
    "walking.turn.straight.short": "Almost there",
    "walking.offroute": "Off route · {dist} back to route",
    "walking.done": "Done here",
    "walking.complete.title": "Done — log this walk?",
    "walking.complete.subtitle": "It'll show up in your footprint.",
    "walking.complete.confirm": "Log it",
    "walking.complete.skip": "Not now",
    "walking.escape": "Continue with AMap",
    "detail.tip":
      "Tap the round button (bottom-right) to locate yourself · “Locate” zooms to a stop · “Navigate” opens AMap walking directions",
    "detail.section.stops": "Stops in order",
    "detail.share.success": "Link copied — share it with a friend.",
    "detail.share.fail": "Copy failed — long-press the link to copy.",

    "stop.locate": "Locate",
    "stop.navigate": "Navigate",

    "rating.title": "How was this route?",
    "rating.subtitle": "Rate it to help others pick a walk.",
    "rating.aria": "{n} stars",
    "rating.commentPlaceholder": "Anything to share after the walk? (optional)",
    "rating.submit": "Submit",
    "rating.submitting": "Submitting…",
    "rating.thanks": "Thanks for your feedback ✓",
    "rating.error": "Submit failed, please try again later.",
    "rating.alreadyRated": "You've already rated this route ✓",

    "feedback.fab": "Feedback",
    "feedback.title": "Tell us what you think",
    "feedback.subtitle": "Bugs, ideas, gripes — we read everything.",
    "feedback.category.general": "Chat",
    "feedback.category.suggestion": "Idea",
    "feedback.category.bug": "Bug",
    "feedback.messagePlaceholder": "Type something…",
    "feedback.contactPlaceholder": "Email or WeChat (optional, so we can reply)",
    "feedback.submit": "Send",
    "feedback.submitting": "Sending…",
    "feedback.thanks": "Got it — thanks ✓",
    "feedback.error": "Send failed, please try again later.",
    "feedback.close": "Close",

    "lang.toggle.aria": "Switch language",
  },
};

export const SUPPORTED_LANGS = ["zh", "en"];

function detectInitial() {
  if (typeof window === "undefined") return "en"; // SSR: 渲染英文; 客户端 hydrate 后再切
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch {}
  const nav =
    (typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage)) ||
    "";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getLang() {
  return detectInitial();
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }
  window.dispatchEvent(new Event("lang-changed"));
}

function format(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] == null ? `{${k}}` : String(vars[k]),
  );
}

// 给 Server Component 用: 不带 hook, 默认英文(SSR 时无 navigator)
export function tStatic(key, vars, lang = "en") {
  const table = dict[lang] || dict.en;
  const value = table[key] ?? dict.en[key] ?? key;
  return format(value, vars);
}

// 客户端 hook: 自动跟随 lang-changed
export function useT() {
  const [lang, setL] = useState("en"); // SSR 期间用 en, 避免 hydration mismatch
  useEffect(() => {
    setL(detectInitial());
    const onChange = () => setL(detectInitial());
    window.addEventListener("lang-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("lang-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  function t(key, vars) {
    const table = dict[lang] || dict.en;
    const value = table[key] ?? dict.en[key] ?? key;
    return format(value, vars);
  }
  return { t, lang, setLang };
}

// 路线/stop 的字段访问器: 优先取对应语言, 缺失就 fallback 到中文(因为中文是源数据)
// 用法: pickField(route, 'name', lang)
export function pickField(obj, field, lang) {
  if (!obj) return "";
  if (lang === "en") {
    return obj[`${field}_en`] ?? obj[field] ?? "";
  }
  return obj[field] ?? "";
}
