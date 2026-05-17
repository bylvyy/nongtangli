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
import { getWalkingPath, getWalkingPathSync } from "../lib/walkingRoute";
import { pointWgsToGcj } from "../lib/coords";
import { useT } from "../lib/i18n";
import { localizeField } from "../lib/routes";
import LocateButton from "./LocateButton";

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
  // SVG transform="rotate(deg cx cy)" 用 attribute 写法, Safari 不认 CSS
  // transform-origin 影响 SVG 元素, 所以这里只走 attribute 形式。
  const cone =
    typeof heading === "number"
      ? `<path d="M24 24 L14 6 Q24 1 34 6 Z" fill="#3b82f6" opacity="0.35" transform="rotate(${heading.toFixed(1)} 24 24)" />`
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
  walkingPath,
  livePolyline,
  height,
  focusIndex,
  geo,
  heading,
  follow,
  setFollow,
}) {
  const { lang } = useT();
  // 数据源里 stops.coords 是 WGS84,显示在国产地图上需要转 GCJ-02
  const stopsGcj = useMemo(
    () =>
      stops?.map((s) => ({
        ...s,
        coords: pointWgsToGcj(s.coords),
        displayName: localizeField(s, "name", lang),
      })),
    [stops, lang],
  );

  // 浏览器 Geolocation 在中国大陆返回的实际上已经是 GCJ-02:
  // - iOS Safari 国行: 系统层已经加偏
  // - Android Chrome 国内: fused location 已经加偏
  // - 桌面 Chrome 国内: 走 Wi-Fi 定位, 通常也是 GCJ
  // 我们的瓦片是 GCJ, 所以直接画即可。再做 WGS→GCJ 会双重偏移 ~300m。
  // 如果以后要支持境外用户, 这里需要根据 outOfChina 区分处理。
  const userPosition = useMemo(() => {
    if (!geo?.position) return null;
    return geo.position;
  }, [geo?.position]);
  const userHeading = heading?.heading;
  const center = useMemo(() => {
    if (!stopsGcj?.length) return [31.2304, 121.4737];
    return stopsGcj[0].coords;
  }, [stopsGcj]);

  // 优先用 D1 预存或 localStorage 命中的轨迹 — 进入即渲染,无网络等待。
  // 没拿到才走运行时 fetch (作为兜底)。
  const initialPath = useMemo(
    () => getWalkingPathSync(stops, walkingPath),
    [stops, walkingPath],
  );
  const [walkPath, setWalkPath] = useState(initialPath);

  useEffect(() => {
    setWalkPath(initialPath);
    if (initialPath) return; // 已有轨迹,无需再请求
    let cancelled = false;
    getWalkingPath(stops, walkingPath).then((path) => {
      if (cancelled || !path) return;
      setWalkPath(path);
    });
    return () => {
      cancelled = true;
    };
  }, [stops, walkingPath, initialPath]);

  const straightLine = stopsGcj?.map((s) => s.coords);
  const userIcon = useMemo(
    () => buildUserIcon(userHeading),
    [userHeading],
  );

  return (
    <div className="relative w-full h-full" style={typeof height === "number" ? { height } : null}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://amap.com">高德地图</a>'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={["1", "2", "3", "4"]}
          maxZoom={18}
        />

        {walkPath && (
          <Polyline
            positions={walkPath}
            pathOptions={{
              color: "#8f4127",
              weight: livePolyline ? 3 : 4,
              opacity: livePolyline ? 0.45 : 0.85,
            }}
          />
        )}

        {/* 行走模式: 实时步行规划 polyline (用户当前位置 → 当前 stop)
            盖在 D1 路径之上, 用 moss 绿区分 — 这是用户"当下要走的路". */}
        {livePolyline && livePolyline.length > 1 && (
          <Polyline
            positions={livePolyline}
            pathOptions={{ color: "#5a7d4a", weight: 5, opacity: 0.9 }}
          />
        )}

        {!walkPath && straightLine?.length > 1 && (
          <Polyline
            positions={straightLine}
            pathOptions={{
              color: "#8f4127",
              weight: 2,
              opacity: 0.5,
              dashArray: "6 6",
            }}
          />
        )}

        {stopsGcj?.map((s, i) => (
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
                {i + 1}. {s.displayName}
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
          stops={stopsGcj}
          focusIndex={focusIndex}
          follow={follow}
          userPos={userPosition}
        />
      </MapContainer>


      {geo && heading && (
        <LocateButton
          geo={geo}
          heading={heading}
          follow={follow}
          setFollow={setFollow}
        />
      )}
    </div>
  );
}
