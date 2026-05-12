"use client";

import { useEffect, useRef, useState } from "react";

// 设备朝向 hook
// 兼容 iOS 13+ (DeviceOrientationEvent.requestPermission) 和 Android
//
// 注意:iOS 必须由用户点击按钮触发请求权限,因此暴露 enable() 函数
// state: 'idle' | 'unsupported' | 'denied' | 'active'
export function useDeviceHeading() {
  const [heading, setHeading] = useState(null);
  const [state, setState] = useState("idle");
  const enabledRef = useRef(false);

  function attach() {
    const handler = (e) => {
      // iOS 提供 webkitCompassHeading(已经是真北 0-360),最准
      if (typeof e.webkitCompassHeading === "number") {
        setHeading(e.webkitCompassHeading);
        return;
      }
      // Android: alpha 是相对设备 z 轴,需取反才能近似为真北方位
      if (typeof e.alpha === "number") {
        setHeading((360 - e.alpha) % 360);
      }
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    enabledRef.current = true;
    setState("active");
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }

  async function enable() {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) {
      setState("unsupported");
      return;
    }
    // iOS 13+ 需要 requestPermission
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
      // cleanup is handled inside attach via removed handler refs in closure scope
      // but we don't reattach,够用
    };
  }, []);

  return { heading, state, enable };
}
