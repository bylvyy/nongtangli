"use client";

// 嵌入路线编辑器里的小地图: 点地图 / 拖 marker 都会回写 WGS84 坐标。
// 高德瓦片是 GCJ-02, 显示前我们把 WGS 转 GCJ; 用户点击/拖完得到的是 GCJ,
// 再转回 WGS 存数据库, 保持和 stops 表里的 lat/lng 一致。

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { pointWgsToGcj, pointGcjToWgs } from "../../lib/coords";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickToMove({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function StopMapPickerInner({ lat, lng, onChange }) {
  // 接收 WGS84, 内部展示用 GCJ
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  const fallback = [31.2304, 121.4737]; // 上海人民广场, 没坐标时的兜底中心
  const wgs = valid ? [lat, lng] : fallback;
  const gcj = useMemo(() => pointWgsToGcj(wgs), [wgs]);

  function handlePick(latlngGcj) {
    const wgsBack = pointGcjToWgs(latlngGcj);
    onChange(wgsBack[0], wgsBack[1]);
  }

  return (
    <div className="h-48 rounded-xl overflow-hidden border border-ink-100">
      <MapContainer
        center={gcj}
        zoom={valid ? 16 : 13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://amap.com">高德地图</a>'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={["1", "2", "3", "4"]}
          maxZoom={18}
        />
        <Recenter center={gcj} />
        <ClickToMove onPick={handlePick} />
        {valid && (
          <Marker
            position={gcj}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng();
                handlePick([ll.lat, ll.lng]);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
