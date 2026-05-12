"use client";

import { useEffect, useRef, useState } from "react";

// 用户定位 hook
// state: 'idle' | 'requesting' | 'watching' | 'denied' | 'unsupported' | 'error'
export function useGeolocation() {
  const [state, setState] = useState("idle");
  const [position, setPosition] = useState(null); // { coords: [lat,lng], accuracy, heading? }
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  function start() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("unsupported");
      return;
    }
    setState("requesting");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          coords: [pos.coords.latitude, pos.coords.longitude],
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        });
        setState("watching");
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setState("denied");
        else setState("error");
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    );
  }

  function stop() {
    if (watchIdRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState("idle");
    setPosition(null);
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
