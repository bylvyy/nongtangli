"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// 修复 leaflet 默认 marker 图标在 webpack 下找不到的老问题
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ stops, focusIndex }) {
  const map = useMap();
  useEffect(() => {
    if (!stops?.length) return;
    if (typeof focusIndex === "number" && stops[focusIndex]) {
      map.setView(stops[focusIndex].coords, 16, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(stops.map((s) => s.coords));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [stops, focusIndex, map]);
  return null;
}

export default function MapInner({ stops, height, focusIndex }) {
  const center = useMemo(() => {
    if (!stops?.length) return [31.2304, 121.4737];
    return stops[0].coords;
  }, [stops]);

  return (
    <div
      className="rounded-xl overflow-hidden border border-ink-100"
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
        {stops?.length > 1 && (
          <Polyline
            positions={stops.map((s) => s.coords)}
            pathOptions={{ color: "#8f4127", weight: 3, opacity: 0.8 }}
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
            <Tooltip permanent direction="top" offset={[0, -8]} className="!bg-white !text-ink-800 !border-ink-200 !shadow-sm">
              <span className="text-[11px]">
                {i + 1}. {s.name}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
        <FitBounds stops={stops} focusIndex={focusIndex} />
      </MapContainer>
    </div>
  );
}
