// 智能封面组件
// 优先级:实拍图 (route.coverPhoto / public/photos/{id}.jpg) > SVG 街区印象图
// route.coverPhoto 是手动指定的实拍图路径

import CoverArt from "./CoverArt";

export default function RouteCover({ route, className = "", children }) {
  if (route.coverPhoto) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={route.coverPhoto}
          alt={route.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {children}
      </div>
    );
  }
  return (
    <CoverArt theme={route.theme} color={route.coverColor} className={className}>
      {children}
    </CoverArt>
  );
}
