"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { getWalkingPath } from "../lib/walkingRoute";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ stops, focusIndex, follow, userPos }) {
  const map = useMap();
  useEffect(() => {
    if (follow && userPos) {
      map.setView(userPos.coords, Math.max(map.getZoom(), 16), {
        animate: true,
      });
      return;
    }
    if (typeof focusIndex === "number" && stops?.[focusIndex]) {
      map.setView(stops[focusIndex].coords, 16, { animate: true });
      return;
    }
    if (!stops?.length) return;
    const bounds = L.latLngBounds(stops.map((s) => s.coords));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [stops, focusIndex, follow, userPos, map]);
  return null;
}

function buildUserIcon(heading) {
  // SVG 蓝点 + 可选的朝向扇形
  const cone =
    typeof heading === "number"
      ? `<g transform="rotate(${heading} 24 24)" style="transform-origin:24px 24px">
           <path d="M24 24 L14 6 Q24 1 34 6 Z" fill="#3b82f6" opacity="0.35" />
         </g>`
      : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      ${cone}
      <circle cx="24" cy="24" r="9" fill="white" />
      <circle cx="24" cy="24" r="7" fill="#3b82f6" />
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "user-location-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

export default function MapInner({
  stops,
  height,
  focusIndex,
  userPosition,
  userHeading,
  follow,
}) {
  const center = useMemo(() => {
    if (!stops?.length) return [31.2304, 121.4737];
    return stops[0].coords;
  }, [stops]);

  const [walkPath, setWalkPath] = useState(null);
  const [walkStatus, setWalkStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setWalkStatus("loading");
    setWalkPath(null);
    getWalkingPath(stops).then((path) => {
      if (cancelled) return;
      if (path) {
        setWalkPath(path);
        setWalkStatus("ok");
      } else {
        setWalkStatus("fallback");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [stops]);

  const straightLine = stops?.map((s) => s.coords);
  const userIcon = useMemo(
    () => buildUserIcon(userHeading),
    [userHeading],
  );

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-ink-100"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {walkPath && (
          <Polyline
            positions={walkPath}
            pathOptions={{ color: "#8f4127", weight: 4, opacity: 0.85 }}
          />
        )}

        {!walkPath && straightLine?.length > 1 && (
          <Polyline
            positions={straightLine}
            pathOptions={{
              color: "#8f4127",
              weight: 2,
              opacity: walkStatus === "loading" ? 0.25 : 0.5,
              dashArray: "6 6",
            }}
          />
        )}

        {stops?.map((s, i) => (
          <CircleMarker
            key={i}
            center={s.coords}
            radius={focusIndex === i ? 9 : 6}
            pathOptions={{
              color: "#23211a",
              fillColor: focusIndex === i ? "#b35a3c" : "#f7f6f2",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -8]}
              className="!bg-white !text-ink-800 !border-ink-200 !shadow-sm"
            >
              <span className="text-[11px]">
                {i + 1}. {s.name}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* 用户位置 + 精度圈 + 朝向 */}
        {userPosition && (
          <>
            <Circle
              center={userPosition.coords}
              radius={Math.min(userPosition.accuracy || 30, 80)}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
            <Marker position={userPosition.coords} icon={userIcon} />
          </>
        )}

        <FitBounds
          stops={stops}
          focusIndex={focusIndex}
          follow={follow}
          userPos={userPosition}
        />
      </MapContainer>

      {walkStatus === "loading" && (
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[11px] text-ink-600 border border-ink-100">
          正在生成步行路径…
        </div>
      )}
      {walkStatus === "fallback" && (
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[11px] text-ink-600 border border-ink-100">
          仅供参考,以实际道路为准
        </div>
      )}
    </div>
  );
}
