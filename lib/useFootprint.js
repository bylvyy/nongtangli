"use client";

import { useEffect, useState } from "react";
import { getFootprint } from "./footprint";

export function useFootprint() {
  const [state, setState] = useState({ walked: [], wishlist: [] });

  useEffect(() => {
    setState(getFootprint());
    const onChange = () => setState(getFootprint());
    window.addEventListener("footprint-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("footprint-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return state;
}
