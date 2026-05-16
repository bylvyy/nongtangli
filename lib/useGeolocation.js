"use client";

import { useEffect, useRef, useState } from "react";

// 用户定位 hook
// state: 'idle' | 'requesting' | 'watching' | 'denied' | 'unsupported' | 'error'
//
// 双轨策略: 先用 getCurrentPosition (低精度, 短超时) 快速给一个粗略位置,
// 同时 watchPosition (高精度, 长超时) 在后台持续精化。城市里室内/楼宇遮挡时
// 高精度 GPS 锁定要 10 秒以上, 单靠 watchPosition 用户体感是"按了没反应"。
export function useGeolocation() {
  const [state, setState] = useState("idle");
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const firstFixRef = useRef(false);

  function start() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("unsupported");
      return;
    }
    // 已经在监听就只是 noop
    if (watchIdRef.current != null) {
      setState("watching");
      return;
    }
    setState("requesting");
    setError(null);
    firstFixRef.current = false;

    function onSuccess(pos) {
      firstFixRef.current = true;
      setPosition({
        coords: [pos.coords.latitude, pos.coords.longitude],
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      });
      setState("watching");
      setError(null);
    }

    function onError(err) {
      if (err.code === err.PERMISSION_DENIED) {
        setState("denied");
        setError(err.message);
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        return;
      }
      // timeout / position unavailable: 只有还没首次 fix 才暴露给 UI,
      // 已经 watching 中的偶发 timeout 不打扰用户
      if (!firstFixRef.current) {
        setState("error");
        setError(err.message);
      }
    }

    // 快速通道 — 低精度, 用网络/Wi-Fi/cell 定位, 通常 1-3 秒返回
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 8000 },
    );

    // 后台高精度监听 — 慢慢精化位置
    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 60000 },
    );
  }

  function stop() {
    if (watchIdRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState("idle");
    setPosition(null);
    firstFixRef.current = false;
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { state, position, error, start, stop };
}
