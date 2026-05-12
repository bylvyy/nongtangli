// 街区印象 SVG 背景图
// 设计原则:
// 1. 单色剪影 + 主题相关意象,不画具体建筑(不假装是实景)
// 2. 全部用路线主色 (route.coverColor) 着色,通过透明度区分前后景
// 3. 如果 /public/photos/{routeId}.jpg 存在,优先用实拍图(由调用方判断)

const ART = {
  // 梧桐区老洋房:法国梧桐叶 + 老洋房屋顶剪影
  "梧桐区老洋房": (
    <g>
      {/* 远景洋房 */}
      <g opacity="0.18">
        <path d="M40 180 L40 130 L70 110 L100 130 L100 180 Z" />
        <path d="M120 180 L120 120 L160 95 L200 120 L200 180 Z" />
        <path d="M220 180 L220 135 L255 115 L290 135 L290 180 Z" />
        <rect x="55" y="145" width="10" height="15" />
        <rect x="80" y="145" width="10" height="15" />
        <rect x="140" y="135" width="14" height="20" />
        <rect x="170" y="135" width="14" height="20" />
        <rect x="240" y="148" width="12" height="18" />
        <rect x="265" y="148" width="12" height="18" />
      </g>
      {/* 前景梧桐叶 */}
      <g opacity="0.32">
        <path d="M50 60 Q60 45 75 50 Q85 35 95 50 Q108 40 110 58 Q120 65 110 78 Q105 92 90 88 Q80 100 70 88 Q55 90 55 78 Q42 70 50 60 Z" />
        <path d="M250 40 Q262 28 275 35 Q285 22 295 35 Q310 30 310 48 Q318 58 308 68 Q302 80 288 76 Q278 88 270 76 Q258 78 258 68 Q245 60 250 40 Z" />
        <path d="M180 200 Q190 188 202 192 Q210 180 220 192 Q232 188 232 205 Q242 213 232 222 Q228 233 215 230 Q207 240 198 230 Q186 232 186 222 Q176 215 180 200 Z" />
      </g>
    </g>
  ),

  // 苏州河水岸:水波纹 + 工业筒仓远景
  "苏州河水岸": (
    <g>
      <g opacity="0.18">
        {/* 筒仓 */}
        <rect x="30" y="100" width="22" height="80" />
        <rect x="55" y="90" width="22" height="90" />
        <rect x="80" y="100" width="22" height="80" />
        {/* 桥 */}
        <path d="M150 150 Q200 120 250 150 L250 158 Q200 128 150 158 Z" />
        <line x1="160" y1="155" x2="160" y2="180" strokeWidth="2" />
        <line x1="200" y1="142" x2="200" y2="180" strokeWidth="2" />
        <line x1="240" y1="155" x2="240" y2="180" strokeWidth="2" />
      </g>
      {/* 水波 */}
      <g opacity="0.32" fill="none" strokeWidth="1.5">
        <path d="M0 200 Q40 192 80 200 T160 200 T240 200 T320 200" stroke="currentColor" />
        <path d="M0 215 Q40 207 80 215 T160 215 T240 215 T320 215" stroke="currentColor" />
        <path d="M0 230 Q40 222 80 230 T160 230 T240 230 T320 230" stroke="currentColor" />
      </g>
    </g>
  ),

  // 工业遗产:厂房 + 烟囱 + 桁架
  "工业遗产": (
    <g>
      <g opacity="0.18">
        <path d="M30 180 L30 140 L60 130 L60 140 L90 130 L90 140 L120 130 L120 180 Z" />
        <path d="M30 140 L60 110 L90 140" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M60 140 L90 110 L120 140" fill="none" strokeWidth="2" stroke="currentColor" />
      </g>
      <g opacity="0.32">
        {/* 大烟囱 */}
        <path d="M210 30 L218 30 L222 180 L206 180 Z" />
        <rect x="204" y="40" width="20" height="3" />
        <rect x="204" y="55" width="20" height="3" />
        {/* 副烟囱 */}
        <path d="M260 70 L266 70 L268 180 L258 180 Z" />
        {/* 桁架横梁 */}
        <path d="M150 110 L290 110 L290 115 L150 115 Z" opacity="0.5" />
        <line x1="160" y1="110" x2="170" y2="115" stroke="currentColor" strokeWidth="1" />
        <line x1="180" y1="110" x2="190" y2="115" stroke="currentColor" strokeWidth="1" />
        <line x1="200" y1="110" x2="210" y2="115" stroke="currentColor" strokeWidth="1" />
        <line x1="270" y1="110" x2="280" y2="115" stroke="currentColor" strokeWidth="1" />
      </g>
    </g>
  ),

  // 老城厢生活:屋顶瓦片 + 晾衣绳 + 老虎窗
  "老城厢生活": (
    <g>
      <g opacity="0.2">
        {/* 连绵的瓦顶 */}
        <path d="M0 180 L0 150 L30 130 L60 150 L60 130 L90 110 L120 130 L120 150 L150 130 L180 150 L180 130 L210 110 L240 130 L240 150 L270 130 L300 150 L300 180 Z" />
        {/* 老虎窗 */}
        <rect x="38" y="138" width="14" height="12" fill="#f7f6f2" opacity="0.4" />
        <rect x="98" y="118" width="14" height="12" fill="#f7f6f2" opacity="0.4" />
        <rect x="218" y="118" width="14" height="12" fill="#f7f6f2" opacity="0.4" />
      </g>
      {/* 晾衣绳 */}
      <g opacity="0.4" stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M40 70 Q160 80 280 70" />
      </g>
      <g opacity="0.5">
        <rect x="60" y="72" width="16" height="22" rx="2" />
        <rect x="100" y="74" width="14" height="20" rx="2" />
        <rect x="140" y="76" width="20" height="18" rx="2" />
        <rect x="190" y="74" width="14" height="22" rx="2" />
        <rect x="230" y="73" width="16" height="20" rx="2" />
      </g>
    </g>
  ),

  // 新华路弄堂:外国弄堂的圆弧拱门 + 联排
  "新华路弄堂": (
    <g>
      <g opacity="0.2">
        {/* 联排洋房屋顶 */}
        <path d="M20 180 L20 140 L50 115 L80 140 L80 130 L110 110 L140 130 L140 140 L170 115 L200 140 L200 130 L230 110 L260 130 L260 140 L290 115 L300 130 L300 180 Z" />
      </g>
      <g opacity="0.34">
        {/* 圆弧拱门 */}
        <path d="M100 200 L100 145 Q100 120 130 120 Q160 120 160 145 L160 200 Z" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M180 200 L180 155 Q180 135 205 135 Q230 135 230 155 L230 200 Z" fill="none" strokeWidth="1.5" stroke="currentColor" />
        {/* 铁艺纹理 */}
        <line x1="115" y1="160" x2="145" y2="160" stroke="currentColor" />
        <line x1="115" y1="175" x2="145" y2="175" stroke="currentColor" />
        <line x1="130" y1="125" x2="130" y2="200" stroke="currentColor" />
      </g>
    </g>
  ),

  // 老虹口:钟楼 + 弄堂入口 + 路牌
  "老虹口": (
    <g>
      <g opacity="0.18">
        {/* 钟楼 */}
        <rect x="40" y="80" width="40" height="100" />
        <path d="M35 80 L60 50 L85 80 Z" />
        <circle cx="60" cy="115" r="10" fill="none" strokeWidth="2" stroke="currentColor" />
        <line x1="60" y1="115" x2="60" y2="108" stroke="currentColor" strokeWidth="1.5" />
        <line x1="60" y1="115" x2="65" y2="115" stroke="currentColor" strokeWidth="1.5" />
        {/* 远景屋顶 */}
        <path d="M120 180 L120 155 L150 140 L180 155 L180 145 L210 130 L240 145 L240 155 L270 140 L300 155 L300 180 Z" />
      </g>
      <g opacity="0.32">
        {/* 弄堂石库门拱 */}
        <path d="M140 200 L140 110 Q140 90 165 90 Q190 90 190 110 L190 200 Z" fill="none" strokeWidth="2" stroke="currentColor" />
        <rect x="155" y="140" width="20" height="40" fill="currentColor" opacity="0.4" />
      </g>
    </g>
  ),

  // 宗教与翻译:教堂尖顶 + 经卷
  "宗教与翻译": (
    <g>
      <g opacity="0.2">
        {/* 教堂主体 */}
        <rect x="100" y="100" width="50" height="80" />
        <path d="M95 100 L125 60 L155 100 Z" />
        {/* 双塔 */}
        <rect x="60" y="80" width="20" height="100" />
        <path d="M58 80 L70 50 L82 80 Z" />
        <rect x="170" y="80" width="20" height="100" />
        <path d="M168 80 L180 50 L192 80 Z" />
        {/* 十字架 */}
        <line x1="70" y1="50" x2="70" y2="38" stroke="currentColor" strokeWidth="2" />
        <line x1="65" y1="44" x2="75" y2="44" stroke="currentColor" strokeWidth="2" />
        <line x1="180" y1="50" x2="180" y2="38" stroke="currentColor" strokeWidth="2" />
        <line x1="175" y1="44" x2="185" y2="44" stroke="currentColor" strokeWidth="2" />
        {/* 拱形大门 */}
        <path d="M118 180 L118 135 Q118 120 132 120 Q145 120 145 135 L145 180 Z" fill="#f7f6f2" opacity="0.4" />
      </g>
      {/* 远景塔 */}
      <g opacity="0.28">
        <path d="M230 180 L230 110 L250 90 L270 110 L270 180 Z" />
        <path d="M225 110 L250 75 L275 110" fill="none" strokeWidth="1.5" stroke="currentColor" />
      </g>
    </g>
  ),
};

const FALLBACK = ART["梧桐区老洋房"];

export default function CoverArt({ theme, color, className = "", children }) {
  const art = ART[theme] || FALLBACK;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, #23211a 100%)`,
      }}
    >
      <svg
        viewBox="0 0 320 240"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full"
        style={{ color: "#f7f6f2" }}
        fill="currentColor"
      >
        {art}
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      {children}
    </div>
  );
}
