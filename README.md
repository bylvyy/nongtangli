# 弄堂里 · 上海街区漫游 (V1)

> Citywalk 不是消费主义,所以这里没有一条路线的人均超过 300。

路线卡片为主、地图为辅的上海街区漫游 PWA。面向上海本地年轻白领。

## 跑起来

```bash
npm install
npm run dev
# → http://localhost:3000
```

国内网络如果 npm 慢,可以先 `npm config set registry https://registry.npmmirror.com`。

## 技术选择

- **Next.js 14 (App Router)** + **Tailwind**
- **React Leaflet + OpenStreetMap 瓦片**(无需 API key,可直接跑)
  - 想换高德:把 `components/MapInner.js` 里的 `<TileLayer>` 换成 `https://wprd0{s}.is.autonavi.com/appmaptile?...` 即可,坐标系需注意 WGS84 → GCJ02 转换
- **localStorage** 存"上海足迹"(走过 / 想去)。无后端,无登录。

## 目录

```
app/
  page.js                  首屏:足迹概要 + 本周新上线 + 路线列表
  HomeClient.js
  route/[id]/page.js       路线详情(点位序列 + 地图)
  footprint/page.js        上海足迹(统计 + 徽章 + 清单)
components/
  RouteCard.js  FilterBar.js  MapView.js  MapInner.js
  PointStop.js  RouteActions.js  NavTabs.js
lib/
  routes.js                10 条种子路线 + theme/atmosphere 枚举
  footprint.js             localStorage 读写 + 统计 + 徽章规则
  useFootprint.js          React hook
```

## 路线数据约定

`lib/routes.js` 中的每条路线:

| 字段 | 谁赋值 | 说明 |
|---|---|---|
| `theme` | 编辑人工 | 7 个枚举之一(`THEMES`) |
| `atmosphere` | 编辑人工 | 适合独自 / 朋友 / date |
| `intensity` | **自动推导** | <3km 轻松 / 3-6km 中等 / >6km 暴走,见 `deriveIntensity` |
| `distanceKm` | 实地测量 | 决定 intensity |
| `stops[]` | 编辑人工 | 顺序即为行走顺序,每个含 `coords [lat,lng]` 和 `story` |
| `district` | 编辑人工 | 用于"走完某街区全部路线 → 解锁称号" |

`lib/routes.js` 末尾有 `_devOverlapCheck()`,可在 dev 时调用检查路线之间点位重合是否超过 1 个(产品定义里的硬要求)。

## 关于种子路线的诚实交代

10 条路线的**地理骨架是真实的**(街区位置、建筑年代、知名旧居), 但产品定义中强调的"老板的故事 / 弄堂里只有居民才知道的细节"这种需要实地走访才能拿到的内容,目前用建筑/街区的可考据历史叙事填充。建议:

1. 主理人 + 撰稿人按现有路线骨架做一遍实地核实
2. 在每条 `stop.story` 上覆盖真实的当下细节(店还在不在、老板是谁、哪个弄堂口最近装了铁门……)
3. 拍 1-2 张图填到 `stop.photos`(目前为空数组,UI 已留位置)

## 还没做(留给 V2)

- 路线编辑后台(目前直接改 `lib/routes.js`)
- 反向排除候选池的数据管线(小红书/抖音/高德监测)
- 真实的步行导航(目前只展示路线和点位,导航点击外跳到系统地图)
- 离线支持 / PWA manifest
- 用户账号(目前足迹只在本机 localStorage)
