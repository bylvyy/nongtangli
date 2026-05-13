"use client";

import { useEffect, useState } from "react";
import RouteEditor from "../../../../components/admin/RouteEditor";

export const runtime = "edge";

export default function EditRoutePage({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/routes/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`http ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setData(d.route);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
        加载失败: {error}
      </div>
    );
  }
  if (!data) {
    return <div className="text-center text-sm text-ink-400 py-10">加载中…</div>;
  }
  return <RouteEditor mode="edit" initial={data} />;
}
