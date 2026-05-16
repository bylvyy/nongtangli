"use client";

import { useEffect, useRef, useState } from "react";

// 设备朝向 hook — 返回 0–360 的真北方位角 (北 0, 东 90)
//
// state: 'idle' | 'unsupported' | 'denied' | 'active'
//
// iOS 13+ 必须 user gesture 同帧调 requestPermission(), 因此暴露 enable()。
// Android 上优先订 deviceorientationabsolute (真北), 没有再降级到 deviceorientation。
export function useDeviceHeading() {
  const [heading, setHeading] = useState(null);
  const [state, setState] = useState("idle");
  const cleanupRef = useRef(null);
  const lastEmitRef = useRef(0);

  function attach() {
    // 重复 enable 时不要再绑一遍 — 之前没做这步, 多次绑定会让多个 handler 用
    // 不同事件源交替写 state, 视觉上就是扇形抖动 / 闪烁
    if (cleanupRef.current) return cleanupRef.current;

    let preferAbsolute = false;
    function commit(value) {
      // 节流到 ~30fps, 避免 React 高频 re-render 让扇形跳
      const now = performance.now();
      if (now - lastEmitRef.current < 33) return;
      lastEmitRef.current = now;
      // 平滑: 简单低通, 减少传感器抖动
      setHeading((prev) => {
        if (prev == null) return value;
        let delta = value - prev;
        if (delta > 180) delta -= 360;
        else if (delta < -180) delta += 360;
        const next = (prev + delta * 0.25 + 360) % 360;
        return next;
      });
    }

    function fromEvent(e) {
      // iOS: webkitCompassHeading 已经是真北, 0-360, 顺时针
      if (typeof e.webkitCompassHeading === "number") {
        commit(e.webkitCompassHeading);
        return;
      }
      // 真北事件优先
      if (e.absolute && typeof e.alpha === "number") {
        commit((360 - e.alpha) % 360);
        return;
      }
      // 兜底: 普通 deviceorientation, alpha 不一定指真北, 但比没有强
      if (!preferAbsolute && typeof e.alpha === "number") {
        commit((360 - e.alpha) % 360);
      }
    }

    // 优先尝试 absolute. 一旦收到一次 absolute 事件就标记 preferAbsolute,
    // 之后 fallback handler 自动让位
    function absHandler(e) {
      preferAbsolute = true;
      fromEvent(e);
    }

    window.addEventListener("deviceorientationabsolute", absHandler, true);
    window.addEventListener("deviceorientation", fromEvent, true);
    setState("active");

    const cleanup = () => {
      window.removeEventListener("deviceorientationabsolute", absHandler, true);
      window.removeEventListener("deviceorientation", fromEvent, true);
      cleanupRef.current = null;
    };
    cleanupRef.current = cleanup;
    return cleanup;
  }

  async function enable() {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) {
      setState("unsupported");
      return;
    }
    // 已经 active 的话, 重复点击是 noop, 不要重新走 requestPermission
    if (state === "active" && cleanupRef.current) return;

    const reqFn = window.DeviceOrientationEvent.requestPermission;
    if (typeof reqFn === "function") {
      try {
        const result = await reqFn();
        if (result !== "granted") {
          setState("denied");
          return;
        }
      } catch {
        setState("denied");
        return;
      }
    }
    attach();
  }

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return { heading, state, enable };
}
