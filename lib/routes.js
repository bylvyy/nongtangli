// 路线数据模型
// theme: 编辑人工赋值；atmosphere: 编辑人工赋值；intensity: 由 distanceKm 自动推导
// stops 顺序即为实际行走顺序
// coords: [lat, lng] WGS84

export const THEMES = [
  "梧桐区老洋房",
  "苏州河水岸",
  "工业遗产",
  "老城厢生活",
  "新华路弄堂",
  "老虹口",
  "宗教与翻译",
  "外滩与万国建筑",
  "老石库门",
];

// 所有分类型的字符串(theme / atmosphere / intensity / district)同时充当数据
// 主键和中文显示文本。英文版只是显示层翻译, 不改数据。
export const THEME_LABELS_EN = {
  梧桐区老洋房: "Plane-tree Villas",
  苏州河水岸: "Suzhou Riverside",
  工业遗产: "Industrial Heritage",
  老城厢生活: "Old City Life",
  新华路弄堂: "Xinhua Road Lanes",
  老虹口: "Old Hongkou",
  宗教与翻译: "Faith & Translation",
  外滩与万国建筑: "Bund & Foreign Buildings",
  老石库门: "Old Shikumen",
};

export const ATMOSPHERES = ["适合独自", "适合朋友", "适合 date"];

export const ATMOSPHERE_LABELS_EN = {
  适合独自: "Solo-friendly",
  适合朋友: "With friends",
  "适合 date": "Date-worthy",
};

export const INTENSITY_LABELS_EN = {
  轻松散步: "Easy stroll",
  中等步行: "Moderate walk",
  长距离暴走: "Long hike",
};

export const DISTRICT_LABELS_EN = {
  徐汇: "Xuhui",
  "普陀-静安": "Putuo–Jing'an",
  黄浦: "Huangpu",
  杨浦: "Yangpu",
  长宁: "Changning",
  虹口: "Hongkou",
  "黄浦-徐汇": "Huangpu–Xuhui",
  "静安-长宁": "Jing'an–Changning",
  静安: "Jing'an",
};

export function deriveIntensity(distanceKm) {
  if (distanceKm < 3) return "轻松散步";
  if (distanceKm <= 6) return "中等步行";
  return "长距离暴走";
}

// 显示层翻译: 拿不到英文版就回退中文(保险)
export function localizeTheme(theme, lang) {
  if (lang === "en") return THEME_LABELS_EN[theme] || theme;
  return theme;
}
export function localizeAtmosphere(atmo, lang) {
  if (lang === "en") return ATMOSPHERE_LABELS_EN[atmo] || atmo;
  return atmo;
}
export function localizeIntensity(intensity, lang) {
  if (lang === "en") return INTENSITY_LABELS_EN[intensity] || intensity;
  return intensity;
}
export function localizeDistrict(district, lang) {
  if (lang === "en") return DISTRICT_LABELS_EN[district] || district;
  return district;
}

// 路线/stop 字段访问器: 英文优先取 *_en 字段, 缺失就回退中文
export function localizeField(obj, field, lang) {
  if (!obj) return "";
  if (lang === "en") return obj[`${field}_en`] ?? obj[field] ?? "";
  return obj[field] ?? "";
}

export const ROUTES = [
  {
    id: "wukang-wuyuan",
    name: "武康路背面：从乌鲁木齐路绕进去",
    name_en: "Behind Wukang Road: A Detour from Urumqi Road",
    hook: "避开网红机位的梧桐区A面",
    hook_en: "The plane-tree quarter without the Instagram crowds",
    theme: "梧桐区老洋房",
    atmosphere: "适合独自",
    distanceKm: 4.2,
    durationMin: 150,
    publishedAt: "2026-05-04",
    district: "徐汇",
    tags: ["梧桐", "老洋房", "弄堂"],
    coverColor: "#b35a3c",
    stops: [
      {
        name: "乌鲁木齐中路菜场",
        name_en: "Middle Urumqi Road Wet Market",
        coords: [31.2168, 121.4427],
        story:
          "起点不在武康路。先在乌中市集吃一碗早餐——这是周边居民日常,不是网红打卡。",
        story_en:
          "The walk doesn't start at Wukang Road. Begin with breakfast at the Wuzhong market — this is daily life for residents, not a photo op.",
        photos: [],
      },
      {
        name: "五原路 288 弄",
        name_en: "Lane 288, Wuyuan Road",
        coords: [31.2152, 121.4445],
        story:
          "三十年代新式里弄,弄口墙上还有 '安和邨' 的水刷石老字。从这条弄堂横穿,绕过武康大楼正面人流。",
        story_en:
          "A 1930s 'new-style' shikumen lane. The pebble-dash characters '安和邨' are still on the wall at the entrance. Cut through here to bypass the crowds at the front of the Normandie Apartments.",
        photos: [],
      },
      {
        name: "湖南路 105 号",
        name_en: "105 Hunan Road",
        coords: [31.2125, 121.4412],
        story:
          "湖南别墅,周作民旧居,1948 年陈纳德与陈香梅在此完婚。围墙不高,从外面就能看到法式坡屋顶。",
        story_en:
          "Hunan Villa — former home of banker Zhou Zuomin. In 1948 Claire Chennault (of Flying Tigers fame) married Anna Chan here. The wall is low enough to glimpse the French mansard roof from the street.",
        photos: [],
      },
      {
        name: "永福路 52 号",
        name_en: "52 Yongfu Road",
        coords: [31.2113, 121.4395],
        story:
          "原英国驻沪总领事官邸,如今是 Cha House 茶室,院内大树是 1937 年前的原物。",
        story_en:
          "The former British Consul-General's residence in Shanghai, now Cha House tea room. The trees in the courtyard pre-date 1937 and are original.",
        photos: [],
      },
      {
        name: "复兴西路 147 号 · 柯灵故居",
        name_en: "147 West Fuxing Road · Ke Ling's House",
        coords: [31.2098, 121.4411],
        story:
          "西班牙式公寓,作家柯灵 1959–2000 年居住于此。三楼朝南房间是他的书房,临街窗外是法国梧桐第二排。",
        story_en:
          "A Spanish-style apartment building. The writer Ke Ling lived here from 1959 to 2000; his south-facing third-floor study overlooks the second row of plane trees.",
        photos: [],
      },
      {
        name: "高邮路 5 弄",
        name_en: "Lane 5, Gaoyou Road",
        coords: [31.2086, 121.4438],
        story:
          "终点。弄堂内是赖少其旧居,这条弄至今没装铁门,可以一直走到底,看到搪瓷澡盆和晾衣绳。",
        story_en:
          "End of the walk. Lai Shaoqi's former residence sits inside this lane, which to this day has no iron gate — walk all the way to the back and you'll see enamel washtubs and laundry lines.",
        photos: [],
      },
    ],
  },
  {
    id: "suzhou-river-north",
    name: "苏州河北岸:从蝴蝶湾走到光复里",
    name_en: "Suzhou River North Bank: From Butterfly Bay to Guangfuli",
    hook: "工厂、面粉、码头工人的水边",
    hook_en: "The waterside of factories, flour mills and dockworkers",
    theme: "苏州河水岸",
    atmosphere: "适合独自",
    distanceKm: 6.2,
    durationMin: 200,
    publishedAt: "2026-04-27",
    district: "普陀-静安",
    tags: ["水岸", "工业", "民国"],
    coverColor: "#566a3b",
    stops: [
      {
        name: "梦清园 · 苏州河展示中心",
        name_en: "Mengqing Park · Suzhou River Visitor Centre",
        coords: [31.2415, 121.4373],
        story:
          "原宜昌路水厂腾退改造,展厅讲苏州河三十年治水。门票免费,本地人遛弯路过随便看。",
        story_en:
          "Built on the site of the old Yichang Road waterworks, this exhibition tells the story of three decades of cleaning up the Suzhou River. Admission is free; locals just wander in on their evening walks.",
        photos: [],
      },
      {
        name: "福新面粉一厂旧址",
        name_en: "Fuxin No. 1 Flour Mill (former site)",
        coords: [31.2426, 121.4445],
        story:
          "荣氏家族 1913 年创办,机器进口自英国 Henry Simon。1956 年公私合营,2005 年停产,红砖筒仓还在。",
        story_en:
          "Founded by the Rong family in 1913 with milling machinery imported from Henry Simon of Britain. Nationalised in 1956, shut down in 2005 — the red-brick silos are still standing.",
        photos: [],
      },
      {
        name: "四行仓库",
        name_en: "Sihang Warehouse",
        coords: [31.2459, 121.4582],
        story:
          "西墙的弹孔是真的——2015 年修缮时考古剥离,严格按 1937 年八百壮士守卫战时的弹道复原。",
        story_en:
          "The bullet holes on the west wall are real. Archaeologists peeled back the plaster in the 2015 restoration and reconstructed them along the actual ballistics of the 1937 'Eight Hundred Heroes' defence.",
        photos: [],
      },
      {
        name: "光复路桥下",
        name_en: "Under Guangfu Road Bridge",
        coords: [31.2447, 121.4593],
        story:
          "桥洞下常有钓鱼的爷叔。河里能钓到的是黑鱼和鲫鱼,他们会告诉你哪段水底是淤的、哪段是石头底。",
        story_en:
          "Old men fish under the bridge. They catch snakehead and crucian carp, and they'll happily tell you which stretch of riverbed is silt and which is stone.",
        photos: [],
      },
      {
        name: "光复里",
        name_en: "Guangfuli Lane",
        coords: [31.2440, 121.4609],
        story:
          "终点。1929 年的广式里弄,现在还有居民晾被子。穿过即到武宁路桥,过桥可接 13 号线汉中路站。",
        story_en:
          "End of the walk. A 1929 Cantonese-style lane where residents still hang their bedding to dry. Cut through it to Wuning Road Bridge; cross over for Hanzhong Road station on Line 13.",
        photos: [],
      },
    ],
  },
  {
    id: "old-city-inner",
    name: "老城厢内圈:豫园后面的真上海",
    name_en: "Inside the Old City: The Real Shanghai Behind Yu Garden",
    hook: "豫园后五百米的另一个上海",
    hook_en: "Another Shanghai, 500 metres past the Yu Garden tourists",
    theme: "老城厢生活",
    atmosphere: "适合独自",
    distanceKm: 2.6,
    durationMin: 120,
    publishedAt: "2026-04-20",
    district: "黄浦",
    tags: ["老城厢", "弄堂", "回民"],
    coverColor: "#8f4127",
    stops: [
      {
        name: "丹凤路菜场",
        name_en: "Danfeng Road Wet Market",
        coords: [31.2294, 121.4901],
        story:
          "起点。早上六点最热闹,卖海鲜的摊主很多是崇明话,问价钱要听得懂 '一斤多少钿'。",
        story_en:
          "Start here. Six in the morning is busiest. Many seafood vendors speak Chongming dialect — be ready to parse 'how much per jin?' in old Shanghainese.",
        photos: [],
      },
      {
        name: "梓园 · 王一亭旧居",
        name_en: "Ziyuan Garden · Wang Yiting's Former Residence",
        coords: [31.2280, 121.4880],
        story:
          "申报馆主笔王一亭的私园,园内有罗汉松和湖石。1922 年爱因斯坦访沪,曾在此用餐。如今居民院,只能从乔家路侧巷瞥见。",
        story_en:
          "Private garden of Wang Yiting, lead writer for Shenbao newspaper. Inside are old Buddhist pines and Taihu rocks. Einstein dined here on his 1922 visit to Shanghai. Now a residential courtyard — you can only glimpse it from the alley off Qiaojia Road.",
        photos: [],
      },
      {
        name: "书隐楼",
        name_en: "Shuyin Lou (Hidden Library Pavilion)",
        coords: [31.2263, 121.4892],
        story:
          "天灯弄 77 号,清乾隆年间陆锡熊宅。木雕门楼上的 '书隐楼' 三字至今未风化。家族后人住,白天可隔栏看砖雕。",
        story_en:
          "77 Tiandeng Lane — the Qianlong-era home of scholar Lu Xixiong. The carved wooden gateway with the three characters '书隐楼' has not weathered to this day. Descendants still live inside; in daytime you can study the brick carvings through the railing.",
        photos: [],
      },
      {
        name: "小桃园清真寺",
        name_en: "Xiao Taoyuan Mosque",
        coords: [31.2252, 121.4878],
        story:
          "1917 年由金子云阿訇主持兴建,上海现存规模最大的伊斯兰建筑。大殿三个穹顶,寺前小桃园街以前真有桃园。",
        story_en:
          "Built in 1917 under Imam Jin Ziyun, this is the largest surviving Islamic building in Shanghai. The main hall has three domes; the lane in front, Xiao Taoyuan, used to be an actual peach orchard.",
        photos: [],
      },
      {
        name: "豫园街道社区食堂",
        name_en: "Yuyuan Neighbourhood Community Canteen",
        coords: [31.2249, 121.4869],
        story:
          "终点。街道老人食堂,中午对外开放,荤素三个菜十五块。墙上贴 '本周菜单' 是手写的。",
        story_en:
          "End of the walk. A neighbourhood canteen for the elderly that opens to the public at lunch — three dishes (one meat, two veg) for 15 yuan. The 'menu of the week' on the wall is handwritten.",
        photos: [],
      },
    ],
  },
  {
    id: "yangpu-riverside",
    name: "杨浦滨江:从毛麻仓库到工部局电厂",
    name_en: "Yangpu Riverside: From the Hemp Warehouse to the Municipal Power Plant",
    hook: "中国最早的电从这里发出来",
    hook_en: "The first electricity in China was generated here",
    theme: "工业遗产",
    atmosphere: "适合朋友",
    distanceKm: 7.5,
    durationMin: 230,
    publishedAt: "2026-04-13",
    district: "杨浦",
    tags: ["工业", "滨江", "百年"],
    coverColor: "#4a4738",
    stops: [
      {
        name: "杨树浦水厂栈桥",
        name_en: "Yangshupu Waterworks Boardwalk",
        coords: [31.2691, 121.5403],
        story:
          "1881 年建成,中国第一座现代化自来水厂。哥特复兴式雉堞至今保留,栈桥从厂区南侧腾出供市民通行。",
        story_en:
          "Completed in 1881, China's first modern waterworks. Its Gothic Revival crenellations are still intact; a boardwalk has been carved out of the south edge of the still-active plant for the public.",
        photos: [],
      },
      {
        name: "杨树浦发电厂遗迹公园",
        name_en: "Yangshupu Power Plant Heritage Park",
        coords: [31.2702, 121.5462],
        story:
          "1913 年投产,远东最大火电厂。105 米烟囱保留,旁边的灰仓改成了咖啡馆,但底层钢架还是原物。",
        story_en:
          "Commissioned in 1913, once the largest thermal power station in the Far East. The 105-metre chimney is preserved; the ash silo next door is now a café, though its lower steel framework is original.",
        photos: [],
      },
      {
        name: "毛麻仓库",
        name_en: "Maoma (Wool & Hemp) Warehouse",
        coords: [31.2674, 121.5358],
        story:
          "1920 年,日商在杨树浦建的仓储厂房,大跨度无柱空间。如今做展览,但工字钢梁和铸铁柱头都没动。",
        story_en:
          "Built in 1920 by a Japanese trading firm — a long-span warehouse without internal columns. Now used for exhibitions, but the I-beams and cast-iron capitals have not been touched.",
        photos: [],
      },
      {
        name: "国棉十七厂老门楼",
        name_en: "Cotton Mill No. 17 Gatehouse",
        coords: [31.2647, 121.5310],
        story:
          "1921 年由日资裕丰纺织建立。门楼 '国营上海第十七棉纺织厂' 字迹模糊但还在,门楼后面如今是绿地。",
        story_en:
          "Founded in 1921 by Japanese-owned Yufeng Textiles. The faded characters '国营上海第十七棉纺织厂' (Shanghai State-Run Cotton Mill No. 17) are still legible. Behind the gate is now parkland.",
        photos: [],
      },
      {
        name: "上海制皂厂沿江段",
        name_en: "Shanghai Soap Factory Riverfront",
        coords: [31.2614, 121.5234],
        story:
          "厂房改造的肥皂博物馆免费,但更值得看的是江边那段不锈钢扶手——是用厂里旧锅炉的零件焊的。",
        story_en:
          "The factory-turned-Soap Museum is free, but the real find is the stainless-steel railing along the river — welded together from parts salvaged from the factory's old boilers.",
        photos: [],
      },
      {
        name: "秦皇岛路码头",
        name_en: "Qinhuangdao Road Ferry Pier",
        coords: [31.2570, 121.5108],
        story:
          "终点。这里是 1947–1949 年苏北逃难民众进沪的主要码头。如今是轮渡站,可以买票坐船到东昌路。",
        story_en:
          "End of the walk. From 1947 to 1949 this was the main pier for refugees fleeing northern Jiangsu into Shanghai. Today it's a ferry terminal — buy a ticket and cross to Dongchang Road on the other side.",
        photos: [],
      },
    ],
  },
  {
    id: "xinhua-fanyu",
    name: "新华路弄堂:外国弄堂的二十栋小楼",
    name_en: "Xinhua Road Lanes: Twenty Houses in the 'Foreign Lane'",
    hook: "三十年代外侨区的剩余样本",
    hook_en: "What's left of a 1930s expat enclave",
    theme: "新华路弄堂",
    atmosphere: "适合 date",
    distanceKm: 3.8,
    durationMin: 150,
    publishedAt: "2026-04-06",
    district: "长宁",
    tags: ["弄堂", "外国弄堂", "梧桐"],
    coverColor: "#7a8a5c",
    stops: [
      {
        name: "新华路 211 弄",
        name_en: "Lane 211, Xinhua Road",
        coords: [31.2056, 121.4193],
        story:
          "起点。1925 年由匈牙利建筑师邬达克与美国哈沙德设计,弄内 20 栋花园住宅,每栋样式不同。号称 '外国弄堂'。",
        story_en:
          "Start here. Designed in 1925 by Hungarian architect László Hudec and American Elliott Hazzard. Twenty garden villas line the lane, no two identical — Shanghainese still call it the 'Foreign Lane'.",
        photos: [],
      },
      {
        name: "新华路 329 弄 36 号",
        name_en: "36 Lane 329, Xinhua Road",
        coords: [31.2054, 121.4214],
        story:
          "圆形别墅,清水红砖+绿色琉璃瓦双坡顶,据传为日商酒井住宅。一楼天井是椭圆形,围墙缝里能瞥到。",
        story_en:
          "A round villa: exposed red brick under a double-pitched roof of green glazed tile, said to have been the home of the Japanese merchant Sakai. Peer through the gap in the wall and you can just see the oval inner courtyard.",
        photos: [],
      },
      {
        name: "番禺路 60 号 · 邬达克旧居",
        name_en: "60 Panyu Road · Hudec's Former Residence",
        coords: [31.2085, 121.4232],
        story:
          "邬达克自宅,1930 年建,英国乡村式半木结构。现在是邬达克纪念馆,工作日下午人少。",
        story_en:
          "László Hudec's own house, built in 1930 in English country half-timbered style. Now the Hudec Memorial Hall — quietest on weekday afternoons.",
        photos: [],
      },
      {
        name: "幸福里 · 法华镇路",
        name_en: "Xingfuli · Fahuazhen Road",
        coords: [31.2118, 121.4248],
        story:
          "幸福里只是入口,继续往北走法华镇路,你会发现六十年代的工人新村和三十年代洋房贴面而立。",
        story_en:
          "Xingfuli is just the entry point. Keep walking north along Fahuazhen Road and you'll find 1960s workers' housing standing wall-to-wall with 1930s villas.",
        photos: [],
      },
      {
        name: "复园路菜场",
        name_en: "Fuyuan Road Wet Market",
        coords: [31.2143, 121.4263],
        story:
          "终点。藏在新华别墅区里的小菜场,中午十一点收市,卖本地老人爱吃的咸菜大头菜和糟卤。",
        story_en:
          "End of the walk. A small market tucked inside the Xinhua villa district. It closes at 11 a.m., selling pickled mustard root and lees brine — staples for the local elderly.",
        photos: [],
      },
    ],
  },
  {
    id: "tilanqiao-jewish",
    name: "提篮桥:犹太难民区的两个街区",
    name_en: "Tilanqiao: Two Blocks of the Jewish Refugee Quarter",
    hook: "1943 年的方舟,街区还在",
    hook_en: "The 1943 ark — the streets still stand",
    theme: "老虹口",
    atmosphere: "适合独自",
    distanceKm: 2.8,
    durationMin: 130,
    publishedAt: "2026-03-30",
    district: "虹口",
    tags: ["犹太", "老虹口", "二战"],
    coverColor: "#b35a3c",
    stops: [
      {
        name: "上海犹太难民纪念馆",
        name_en: "Shanghai Jewish Refugees Museum",
        coords: [31.2526, 121.5050],
        story:
          "原摩西会堂,1907 年俄籍犹太人建。1939–1945 年成为难民信仰中心。馆藏的 '上海方舟' 纪念墙刻有 13732 个名字。",
        story_en:
          "The former Ohel Moshe Synagogue, built in 1907 by Russian Jews. From 1939 to 1945 it served as the spiritual centre of the refugee community. The museum's 'Shanghai Ark' memorial wall carries 13,732 names.",
        photos: [],
      },
      {
        name: "舟山路",
        name_en: "Zhoushan Road",
        coords: [31.2535, 121.5063],
        story:
          "犹太难民聚居核心。门牌号 '59' '79' '116' 等都有过 Café 和理发店,墙上还能看到德语招牌的洗刷痕迹。",
        story_en:
          "The heart of the refugee quarter. Numbers 59, 79, 116 once held cafés and barbershops; the painted-over outlines of German signage are still visible on the walls.",
        photos: [],
      },
      {
        name: "霍山公园",
        name_en: "Huoshan Park",
        coords: [31.2542, 121.5085],
        story:
          "1875 年建,原汇山公园。难民被允许进入的少数公共绿地之一。园内的青铜纪念碑 1994 年立,德文/希伯来文/中文三语。",
        story_en:
          "Built in 1875 as Wayside Park — one of the few green spaces refugees were permitted to enter. A bronze memorial inside, erected in 1994, carries trilingual inscriptions: German, Hebrew, Chinese.",
        photos: [],
      },
      {
        name: "下海庙",
        name_en: "Xiahai Temple",
        coords: [31.2554, 121.5113],
        story:
          "下海庙的 '下海' 才是上海地名的真源——清乾隆年间,渔民为求平安建。现存大殿是 1990 年代复建,但门前石狮是原物。",
        story_en:
          "The 'Xiahai' in this temple's name is the true source of 'Shanghai' as a place name — fishermen built it during the Qianlong era of the Qing for safe passage. The main hall was rebuilt in the 1990s, but the stone lions out front are original.",
        photos: [],
      },
      {
        name: "提篮桥犹太面包房旧址",
        name_en: "Former Vienna Bakery, Tilanqiao",
        coords: [31.2536, 121.5072],
        story:
          "终点。舟山路 86 号曾是 Vienna 面包房,现在是杂货店,门头黑铁招牌槽还在。墙上能看到德文字母 'WIEN' 的浅痕。",
        story_en:
          "End of the walk. 86 Zhoushan Road was once Café Vienna, the refugee bakery; today it's a corner shop, but the black iron channel for the old signboard is still above the door, and the faint outline of 'WIEN' in German letters can still be made out on the wall.",
        photos: [],
      },
    ],
  },
  {
    id: "nanchang-sinan",
    name: "南昌路-思南路:梧桐区的另一条对角线",
    name_en: "Nanchang–Sinan: Another Diagonal Through the Plane-tree Quarter",
    hook: "比武康路安静一半的法租界",
    hook_en: "The French Concession, half as crowded as Wukang Road",
    theme: "梧桐区老洋房",
    atmosphere: "适合 date",
    distanceKm: 3.5,
    durationMin: 140,
    publishedAt: "2026-03-23",
    district: "黄浦-徐汇",
    tags: ["梧桐", "民国", "名人"],
    coverColor: "#566a3b",
    stops: [
      {
        name: "南昌路 100 弄 · 老渔阳里 2 号",
        name_en: "100 Lane, Nanchang Road · No. 2 Old Yuyangli",
        coords: [31.2202, 121.4663],
        story:
          "起点。1920 年陈独秀寓所,中国共产党发起组在此成立。门牌很不起眼,弄堂口墙上有铜牌。",
        story_en:
          "Start here. Chen Duxiu's residence in 1920, where the founding group of the Chinese Communist Party first met. The door is unremarkable; a small bronze plaque on the lane wall is the only marker.",
        photos: [],
      },
      {
        name: "雁荡路 84 号",
        name_en: "84 Yandang Road",
        coords: [31.2192, 121.4685],
        story:
          "原叶恭绰故居,法式公寓,1933 年建。现在底楼是西餐馆,二楼以上仍住居民。门口铸铁雨棚是原物。",
        story_en:
          "Former home of Ye Gongchuo, a 1933 French-style apartment building. The ground floor is now a Western restaurant; the upper floors are still residential. The cast-iron entrance canopy is original.",
        photos: [],
      },
      {
        name: "复兴公园南门",
        name_en: "Fuxing Park, South Gate",
        coords: [31.2179, 121.4699],
        story:
          "1909 年建,法国景观师柏勃设计。下棋的爷叔聚在中央草坪东侧,从早上九点到下午四点。",
        story_en:
          "Opened in 1909, designed by French landscape architect Jean Borchet. Old men play Chinese chess on the east side of the central lawn, from 9 a.m. to 4 p.m. daily.",
        photos: [],
      },
      {
        name: "思南路 73 号 · 周公馆",
        name_en: "73 Sinan Road · Zhou's Residence",
        coords: [31.2151, 121.4691],
        story:
          "1946 年中共上海办事处,周恩来董必武曾住。展厅免费,后院有口井,据说当年用来藏文件。",
        story_en:
          "The 1946 Shanghai office of the Chinese Communist Party — Zhou Enlai and Dong Biwu both lived here. Free to enter; there's a well in the back courtyard said to have been used to hide documents.",
        photos: [],
      },
      {
        name: "皋兰路 1 号",
        name_en: "1 Gaolan Road",
        coords: [31.2138, 121.4688],
        story:
          "终点。原张学良公馆,西班牙式三层。门前皋兰路上的法国梧桐是 1932 年所植,树龄 90 年以上。",
        story_en:
          "End of the walk. The former residence of warlord Zhang Xueliang — a three-storey Spanish-style villa. The plane trees out on Gaolan Road were planted in 1932, well over 90 years old now.",
        photos: [],
      },
    ],
  },
  {
    id: "duolun-tianai",
    name: "多伦路-甜爱路:左联与情书",
    name_en: "Duolun & Tian'ai Road: The League of Left-Wing Writers, Plus a Love-Letter Lane",
    hook: "鲁迅走过的路加一段情书路",
    hook_en: "The streets Lu Xun walked, finished with a lane of love letters",
    theme: "老虹口",
    atmosphere: "适合朋友",
    distanceKm: 4.6,
    durationMin: 170,
    publishedAt: "2026-03-16",
    district: "虹口",
    tags: ["民国", "文人", "左联"],
    coverColor: "#8f4127",
    stops: [
      {
        name: "多伦路文化名人街",
        name_en: "Duolun Road Cultural Celebrities Street",
        coords: [31.2715, 121.4795],
        story:
          "起点。鲁迅、瞿秋白、丁玲、茅盾都在多伦路一带住过。街道名牌是新做的,但 201 弄、189 号等门牌都是民国原物。",
        story_en:
          "Start here. Lu Xun, Qu Qiubai, Ding Ling and Mao Dun all lived around Duolun Road. The street signage is recent, but the door plates at Lane 201 and No. 189 are originals from the Republican era.",
        photos: [],
      },
      {
        name: "鸿德堂",
        name_en: "Hongde Church",
        coords: [31.2720, 121.4811],
        story:
          "1928 年中国基督教自立会建,中国传统庙宇式教堂——重檐歇山顶配基督十字。门口对联 '荣神益人' 是民国老字。",
        story_en:
          "Built in 1928 by the Chinese Christian Independent Church — a Christian church in the form of a traditional Chinese temple, with a double-eaved hip roof topped by a cross. The couplet at the door reading '荣神益人' (Glorify God, Benefit Mankind) is in original Republican-era calligraphy.",
        photos: [],
      },
      {
        name: "鲁迅故居 · 大陆新村 9 号",
        name_en: "Lu Xun's Former Residence · No. 9 Dalu New Village",
        coords: [31.2729, 121.4839],
        story:
          "1933 年鲁迅迁入,1936 年逝于此。三楼前间是他的写字桌,桌面那道凹痕是真的——抄稿用力压出来的。",
        story_en:
          "Lu Xun moved in in 1933 and died here in 1936. His writing desk sits in the front room on the third floor; the indentation in the desktop is genuine — pressed in by years of leaning hard while copying out manuscripts.",
        photos: [],
      },
      {
        name: "鲁迅公园北门",
        name_en: "Lu Xun Park, North Gate",
        coords: [31.2740, 121.4843],
        story:
          "原虹口公园,1896 年英租界建。本地老人晨练区在西北角,假山后有票友天天唱越剧。",
        story_en:
          "Originally Hongkou Park, opened by the British Settlement in 1896. Locals do morning exercises in the northwest corner; behind the rockery, amateur troupes sing Yue opera every day.",
        photos: [],
      },
      {
        name: "甜爱路",
        name_en: "Tian'ai (Sweet Love) Road",
        coords: [31.2762, 121.4853],
        story:
          "全长 528 米,墙上嵌着 28 首情诗,从《诗经》到聂鲁达。本地人结婚前会来路边邮筒寄信给自己。",
        story_en:
          "528 metres long, with 28 love poems set into the walls — from the Book of Songs to Pablo Neruda. Locals come here before getting married to post a letter to themselves at the streetside mailbox.",
        photos: [],
      },
      {
        name: "溧阳路 1338 号",
        name_en: "1338 Liyang Road",
        coords: [31.2776, 121.4868],
        story:
          "终点。原日本海军武官府,1936 年建。新古典加日式入母屋顶,转角有一棵广玉兰是原种。",
        story_en:
          "End of the walk. The former Japanese Naval Attaché's residence, built in 1936 — neoclassical with a Japanese irimoya hip-and-gable roof. The southern magnolia at the corner is the original tree.",
        photos: [],
      },
    ],
  },
  {
    id: "yuyuan-road",
    name: "愚园路:从静安寺一直走到中山公园",
    name_en: "Yuyuan Road: from Jing'an Temple to Zhongshan Park",
    hook: "梧桐区西段,洋房密度最高",
    hook_en: "The western plane-tree belt — highest density of old villas",
    theme: "梧桐区老洋房",
    atmosphere: "适合朋友",
    distanceKm: 6.5,
    durationMin: 220,
    publishedAt: "2026-03-09",
    district: "静安-长宁",
    tags: ["梧桐", "老洋房", "暴走"],
    coverColor: "#4a4738",
    stops: [
      {
        name: "愚园路 81 号",
        name_en: "81 Yuyuan Road",
        coords: [31.2245, 121.4485],
        story:
          "起点。原刘吉生公寓,1929 年建,新古典三层。如今底层是花店,门厅大理石地砖是民国原物。",
        story_en:
          "Starting point. The former Liu Jisheng Apartments, built 1929 — three-storey neoclassical. A florist now occupies the ground floor; the marble entrance tiles are original Republican-era stone.",
        photos: [],
      },
      {
        name: "愚园路 749 弄 · 涌泉坊",
        name_en: "Lane 749 · Yongquan Fang",
        coords: [31.2231, 121.4368],
        story:
          "1934 年华籍设计师奚福泉作品,Art Deco 立面+中式坡顶。弄内九栋单元楼,每栋外立面纹饰不同。",
        story_en:
          "Designed in 1934 by Chinese architect Hsi Fu-chuan — Art Deco façade meets Chinese pitched roof. Nine units inside the lane, each with distinct exterior ornament.",
        photos: [],
      },
      {
        name: "愚园路 1032 弄 · 岐山村",
        name_en: "Lane 1032 · Qishan Village",
        coords: [31.2218, 121.4282],
        story:
          "钱学森旧居所在。1925–1928 年建,英式假四层联排。弄堂口的水泥拱门刻 '岐山邨' 三字。",
        story_en:
          "Former residence of rocket scientist Qian Xuesen. Built 1925–1928 as English-style mock four-storey terraces. The cement archway at the lane entrance still bears the carved name '岐山邨'.",
        photos: [],
      },
      {
        name: "愚园路 1136 弄 · 王伯群住宅",
        name_en: "Lane 1136 · Wang Boqun House",
        coords: [31.2211, 121.4243],
        story:
          "1934 年建,城堡式哥特别墅,据传为王伯群献给保志宁的婚房。如今是长宁区少年宫,周末可入园。",
        story_en:
          "Built 1934 — a castle-like Gothic villa, said to be Wang Boqun's wedding gift to Bao Zhining. Now the Changning District Children's Palace; open to visitors on weekends.",
        photos: [],
      },
      {
        name: "愚园路 1352 弄 · 宏业花园",
        name_en: "Lane 1352 · Hongye Garden",
        coords: [31.2204, 121.4198],
        story:
          "三十年代英式花园里弄,弄内每户花园仍有原种香樟。从弄底可穿出至定西路,接近终点。",
        story_en:
          "An English-style 1930s garden lane — the original camphor trees still stand in each household's plot. The lane's far end opens onto Dingxi Road, near the finish.",
        photos: [],
      },
      {
        name: "中山公园西门",
        name_en: "Zhongshan Park West Gate",
        coords: [31.2191, 121.4159],
        story:
          "终点。原兆丰公园,1914 年英商资助建。西门进去左转是大悬铃木,树龄 105 年,挂铭牌。",
        story_en:
          "Endpoint. The former Jessfield Park, funded by British merchants in 1914. Just inside the west gate, turn left for the great plane tree — 105 years old, with a heritage plaque.",
        photos: [],
      },
    ],
  },
  {
    id: "longhua-tushanwan",
    name: "龙华-土山湾:晚清教堂与翻译",
    name_en: "Longhua–Tushanwan: late-Qing churches and translators",
    hook: "中国第一批留学生从这里出发",
    hook_en: "Where China's first generation of overseas students set out",
    theme: "宗教与翻译",
    atmosphere: "适合独自",
    distanceKm: 6.3,
    durationMin: 220,
    publishedAt: "2026-03-02",
    district: "徐汇",
    tags: ["宗教", "翻译", "晚清"],
    coverColor: "#566a3b",
    stops: [
      {
        name: "龙华寺",
        name_en: "Longhua Temple",
        coords: [31.1718, 121.4477],
        story:
          "起点。242 年孙吴时期始建,现存建筑为光绪年间。塔身倾斜 38 厘米,1985 年纠偏过一次。早 6 点开门,香火免费。",
        story_en:
          "Starting point. Founded in 242 CE under the Wu kingdom; today's structures date to the Guangxu reign. The pagoda leans 38 cm — corrected once in 1985. Opens 6 a.m., incense is free.",
        photos: [],
      },
      {
        name: "龙华烈士陵园西墙",
        name_en: "Longhua Martyrs' Cemetery — west wall",
        coords: [31.1734, 121.4441],
        story:
          "陵园不必走完,但西墙外那段沟渠是 1927 年枫林桥监狱的旧排水道。本地老人称 '红墙根'。",
        story_en:
          "No need to walk the whole memorial — but the ditch outside the west wall is the old drainage channel of the 1927 Fenglin Bridge Prison. Locals call it 'the red wall foot'.",
        photos: [],
      },
      {
        name: "徐家汇藏书楼",
        name_en: "Bibliotheca Zikawei",
        coords: [31.1936, 121.4374],
        story:
          "1847 年法国耶稣会建,中国近代第一座公共图书馆。藏书 56 万册,中西文各半。需预约,但门外可看西式柱廊。",
        story_en:
          "Built in 1847 by the French Jesuits — modern China's first public library. 560,000 volumes, half in Chinese and half in Western languages. Visit by appointment, but the colonnade outside is open to view.",
        photos: [],
      },
      {
        name: "徐家汇天主堂",
        name_en: "St. Ignatius Cathedral",
        coords: [31.1939, 121.4368],
        story:
          "1910 年建,哥特复兴式,双钟楼 56 米。彩色玻璃 1987 年重做,但东侧三扇是 1925 年原物。",
        story_en:
          "Built 1910 — Gothic Revival with twin 56-metre bell towers. The stained glass was remade in 1987, but the three eastern panels are original from 1925.",
        photos: [],
      },
      {
        name: "土山湾博物馆",
        name_en: "Tushanwan Museum",
        coords: [31.1881, 121.4338],
        story:
          "1864–1960 年的土山湾孤儿工艺院旧址。展厅有当年木雕牌楼,曾参加 1915 年巴拿马万国博览会获金奖。",
        story_en:
          "Site of the Tushanwan Orphanage workshops, 1864–1960. Inside is the carved wooden pailou that won gold at the 1915 Panama–Pacific International Exposition.",
        photos: [],
      },
      {
        name: "南丹路 · 光启公园",
        name_en: "Nandan Road · Guangqi Park",
        coords: [31.1905, 121.4351],
        story:
          "终点。徐光启墓所在地。徐光启与利玛窦合译《几何原本》前六卷,中文 '点、线、面' 译名都出自此人。",
        story_en:
          "Endpoint. Tomb of Xu Guangqi, who co-translated the first six books of Euclid's Elements with Matteo Ricci. The Chinese terms for 'point', 'line' and 'plane' all come from him.",
        photos: [],
      },
    ],
  },
  {
    id: "julu-fumin-changle",
    name: "巨鹿路-富民路-长乐路:网红梧桐区的另一面",
    name_en: "Julu–Fumin–Changle: the other side of Insta-famous lanes",
    hook: "小红书最热的几条街,绕开机位走背面",
    hook_en: "Skip the photo spots, walk the back streets",
    theme: "梧桐区老洋房",
    atmosphere: "适合朋友",
    distanceKm: 3.6,
    durationMin: 130,
    publishedAt: "2026-05-11",
    district: "静安",
    tags: ["梧桐", "老洋房", "网红"],
    coverColor: "#a06b3c",
    stops: [
      {
        name: "巨鹿路 675 号 · 上海作家协会",
        name_en: "675 Julu Road · Shanghai Writers' Association",
        coords: [31.2202, 121.4514],
        story:
          "起点。原刘吉生住宅,1931 年邬达克设计,意大利文艺复兴式。门口铁艺花纹是邬达克手稿原件复刻。开放日(每月一次)可入园。",
        story_en:
          "Starting point. The former Liu Jisheng residence, designed in 1931 by László Hudec in Italian Renaissance style. The wrought-iron gate ornament is replicated from Hudec's original drawings. Open one day a month.",
        photos: [],
      },
      {
        name: "巨鹿路 889 弄 · 景华新村",
        name_en: "Lane 889 Julu Road · Jinghua New Village",
        coords: [31.2196, 121.4471],
        story:
          "1937 年新式里弄,英商投资。弄底 5 号是宋庆龄秘书黎沛华旧居。整条弄被 2018 年的市政更新清理过,但门牌号、转角小铺都保留。",
        story_en:
          "A 1937 'new-style lane' built by British investors. No. 5 at the back was once home to Soong Ching-ling's secretary Li Peihua. A 2018 cleanup spared the door numbers and the corner shops.",
        photos: [],
      },
      {
        name: "富民路 182 弄 · 富民新邨",
        name_en: "Lane 182 Fumin Road · Fumin New Village",
        coords: [31.2208, 121.4496],
        story:
          "1942 年建,典型新式里弄。弄口的'富民新邨'四字是民国书法家邓散木所题。弄内门洞砖砌花式至今未被涂白。",
        story_en:
          "Built 1942, a textbook new-style lane. The four characters at the entrance were calligraphed by Republican-era master Deng Sanmu. The brick patterns inside the doorways remain unwhitewashed.",
        photos: [],
      },
      {
        name: "长乐路 570 弄 · 蒲园",
        name_en: "Lane 570 Changle Road · Pu Garden",
        coords: [31.2156, 121.4509],
        story:
          "1942 年建的西班牙式公寓群,8 栋楼,弧形阳台。早年聚居过梅兰芳的弟子。现在弄堂里咖啡店混着原住民晾衣杆。",
        story_en:
          "A 1942 Spanish-style apartment cluster — eight buildings with curved balconies. Early residents included disciples of Peking Opera star Mei Lanfang. Cafes now share the lane with longtime residents' laundry poles.",
        photos: [],
      },
      {
        name: "长乐路 672 弄 · 觉民坊",
        name_en: "Lane 672 Changle Road · Juemin Lane",
        coords: [31.2153, 121.4478],
        story:
          "1928 年广式石库门,门头雕有'觉民'两字。弄堂深处有间裁缝铺,做了三代,只接老主顾。",
        story_en:
          "1928 Cantonese-style shikumen, with '觉民' carved into the door lintel. Deep in the lane, a tailor's shop has run three generations and only takes regular customers.",
        photos: [],
      },
      {
        name: "陕西南路口 · 长乐路尾",
        name_en: "Shaanxi South Road junction · end of Changle",
        coords: [31.2152, 121.4445],
        story:
          "终点。陕西南路在民国时是法租界霞飞路的延伸,梧桐密度仍是全市最高。可在街角的小酒馆收尾。",
        story_en:
          "Endpoint. Shaanxi South Road continues the old French Concession's Avenue Joffre — still the city's densest plane-tree canopy. Wrap up at any of the corner bars.",
        photos: [],
      },
    ],
  },
  {
    id: "wukang-anfu-classic",
    name: "武康-安福路:经典段一次走完",
    name_en: "Wukang–Anfu Road: the classic stretch",
    hook: "网红打卡地图正面版,一次性看完",
    hook_en: "The famous photo route, done in one go",
    theme: "梧桐区老洋房",
    atmosphere: "适合朋友",
    distanceKm: 3.2,
    durationMin: 120,
    publishedAt: "2026-05-08",
    district: "徐汇",
    tags: ["梧桐", "老洋房", "网红"],
    coverColor: "#8e5a3a",
    stops: [
      {
        name: "武康大楼",
        name_en: "Wukang Mansion",
        coords: [31.2118, 121.4258],
        story:
          "起点。1924 年邬达克设计,法国文艺复兴式船型公寓。原名诺曼底公寓。底楼的咖啡馆地砖是 1924 年原物。最佳机位在淮海中路对面街角。",
        story_en:
          "Starting point. Designed in 1924 by László Hudec — a French Renaissance ship-shaped apartment originally named Normandie Apartments. The ground-floor cafe still has its 1924 floor tiles. The famous photo angle is at the corner across Huaihai Road.",
        photos: [],
      },
      {
        name: "巴金故居",
        name_en: "Ba Jin's Former Residence",
        coords: [31.2103, 121.4291],
        story:
          "武康路 113 号。1955 年起巴金在此住了近 50 年,《随想录》在此完成。花园里的玉兰是夫人萧珊亲手种的。免费开放,周一闭馆。",
        story_en:
          "113 Wukang Road. Writer Ba Jin lived here for nearly 50 years from 1955; his Random Thoughts was completed in this house. The magnolia in the garden was planted by his wife Xiao Shan. Free entry, closed Mondays.",
        photos: [],
      },
      {
        name: "黄兴故居",
        name_en: "Huang Xing's Former Residence",
        coords: [31.2095, 121.4276],
        story:
          "武康路 393 号。辛亥革命元勋黄兴 1916 年至此养病并去世。三层西班牙式,二楼阳台是他临终前最后凭栏的地方。",
        story_en:
          "393 Wukang Road. Revolutionary leader Huang Xing came here in 1916 to recuperate and died in this house. A three-storey Spanish-style villa — the second-floor balcony was where he stood for the last time before passing.",
        photos: [],
      },
      {
        name: "宋庆龄故居",
        name_en: "Soong Ching-ling's Former Residence",
        coords: [31.2076, 121.4262],
        story:
          "淮海中路 1843 号。1948 年起宋庆龄主要住所,直到 1981 年。她的卧室和书房保持原貌,书桌上还摆着她最后批改的文件。门票 20 元。",
        story_en:
          "1843 Huaihai Road. Soong Ching-ling's main residence from 1948 until her death in 1981. Bedroom and study remain as she left them — the last document she worked on still sits on the desk. Tickets ¥20.",
        photos: [],
      },
      {
        name: "安福路 · 上戏门口",
        name_en: "Anfu Road · Shanghai Theatre Academy",
        coords: [31.2128, 121.4318],
        story:
          "上海戏剧学院位于华山路口,但安福路才是学生真正出没的地方。一条街上 30 多家小店,半数是 2018 年后开的。",
        story_en:
          "The Shanghai Theatre Academy gate is on Huashan Road, but Anfu Road is where the students actually hang out. Over 30 small shops on one street — half opened after 2018.",
        photos: [],
      },
      {
        name: "永福路口 · 上影演员剧团旧址",
        name_en: "Yongfu Road junction · old SFA actors' studio",
        coords: [31.2134, 121.4342],
        story:
          "终点。永福路 52 号是 1957 年起的上海电影演员剧团驻地,赵丹、白杨都在这里排过戏。现在改作美术馆,周末开放。",
        story_en:
          "Endpoint. 52 Yongfu Road housed the Shanghai Film Actors' Troupe from 1957 — Zhao Dan and Bai Yang both rehearsed here. Now an art museum, open weekends.",
        photos: [],
      },
    ],
  },
  {
    id: "bund-22-buildings",
    name: "外滩万国建筑:22 栋的来历",
    name_en: "The Bund: stories behind 22 buildings",
    hook: "经典必走,但每栋楼都有讲法",
    hook_en: "The must-do route, with a real story per building",
    theme: "外滩与万国建筑",
    atmosphere: "适合朋友",
    distanceKm: 1.8,
    durationMin: 110,
    publishedAt: "2026-05-01",
    district: "黄浦",
    tags: ["外滩", "万国建筑", "经典"],
    coverColor: "#3a4960",
    stops: [
      {
        name: "外滩源 · 英国领事馆旧址",
        name_en: "Bund Source · former British Consulate",
        coords: [31.2456, 121.4901],
        story:
          "起点。中山东一路 33 号,1873 年建,外滩最早的西式建筑。文艺复兴式,外滩唯一带英式花园的楼。现属洛克·外滩源,可入园。",
        story_en:
          "Starting point. 33 Zhongshan East Road No. 1, built 1873 — the Bund's earliest Western building. Renaissance-style, the only Bund building with an English garden. Now part of Rockbund; the garden is open.",
        photos: [],
      },
      {
        name: "中山东一路 12 号 · 汇丰银行大楼",
        name_en: "12 Zhongshan East 1 · HSBC Building",
        coords: [31.2399, 121.4901],
        story:
          "1923 年公和洋行设计,新古典折衷主义。曾被誉为'从苏伊士运河到白令海峡间最讲究的建筑'。门厅马赛克穹顶 1956 年被石灰封住,1997 年才重见天日。",
        story_en:
          "Designed in 1923 by Palmer & Turner, neoclassical eclectic. Once called 'the finest building between the Suez Canal and the Bering Strait'. The lobby's mosaic dome was covered with lime in 1956 and only uncovered again in 1997.",
        photos: [],
      },
      {
        name: "中山东一路 13 号 · 海关大楼",
        name_en: "13 Zhongshan East 1 · Customs House",
        coords: [31.2397, 121.4900],
        story:
          "1927 年公和洋行设计,90 米钟楼是外滩天际线核心。钟为英国制造,与伦敦大本钟为同一款。整点报时是外滩最准的钟。",
        story_en:
          "Also Palmer & Turner, 1927. Its 90-metre clock tower anchors the Bund skyline. The clock — British-made, same model as Big Ben — chimes the most reliable hour on the Bund.",
        photos: [],
      },
      {
        name: "中山东一路 18 号",
        name_en: "18 Zhongshan East 1",
        coords: [31.2384, 121.4892],
        story:
          "1923 年原渣打银行,新古典样式。2004 年改造,顶层是露台酒吧,角度正对浦东陆家嘴。底楼意大利餐厅是上海最早一批 fine dining。",
        story_en:
          "1923, originally Chartered Bank — neoclassical. After a 2004 renovation, the top floor became a rooftop bar facing the Lujiazui skyline. The Italian restaurant on the ground floor was among Shanghai's first fine-dining venues.",
        photos: [],
      },
      {
        name: "中山东一路 20 号 · 和平饭店北楼",
        name_en: "20 Zhongshan East 1 · Peace Hotel North",
        coords: [31.2374, 121.4882],
        story:
          "1929 年沙逊大厦,装饰艺术风格,77 米尖顶绿铜帽是外滩标志。八楼老年爵士乐队 1980 年起开演,平均年龄超 75 岁。",
        story_en:
          "1929 Sassoon House, Art Deco — its 77-metre green-copper pyramid roof is a Bund icon. The Old Jazz Band on the eighth floor has played since 1980; the members average over 75.",
        photos: [],
      },
      {
        name: "中山东一路 23 号 · 中国银行大楼",
        name_en: "23 Zhongshan East 1 · Bank of China Building",
        coords: [31.2363, 121.4870],
        story:
          "1937 年陆谦受设计,外滩唯一中国设计师作品。原计划 34 层,被沙逊压制不得超过和平饭店,最终 17 层。屋顶四角中式攒尖,是中国近代建筑师的妥协样本。",
        story_en:
          "Designed in 1937 by Luke Him Sau — the only Bund building by a Chinese architect. Originally planned for 34 storeys, but Sassoon insisted nothing top his hotel, so it ended at 17. The four Chinese pyramidal corners at the roof are a textbook compromise of early modern Chinese architects.",
        photos: [],
      },
      {
        name: "金陵东路口 · 外滩南端",
        name_en: "Jinling East Road junction · south end of the Bund",
        coords: [31.2330, 121.4854],
        story:
          "终点。1862 年外滩最早的码头一带。再往南就是十六铺,可接下一条路线。",
        story_en:
          "Endpoint. Around 1862, the Bund's earliest piers stood here. Further south is Shiliupu — the next route can be picked up here.",
        photos: [],
      },
    ],
  },
  {
    id: "bund-source-to-shiliupu",
    name: "外滩源到十六铺:沿江完整版",
    name_en: "Bund Source to Shiliupu: the full waterfront",
    hook: "把外滩的北端教堂和南端老码头一次串起来",
    hook_en: "From the northern church to the southern docks in one walk",
    theme: "外滩与万国建筑",
    atmosphere: "适合独自",
    distanceKm: 4.8,
    durationMin: 180,
    publishedAt: "2026-04-30",
    district: "黄浦",
    tags: ["外滩", "码头", "黄浦江"],
    coverColor: "#34526a",
    stops: [
      {
        name: "圆明园路 · 划船俱乐部旧址",
        name_en: "Yuanmingyuan Road · old Shanghai Rowing Club",
        coords: [31.2467, 121.4895],
        story:
          "起点。1905 年英商划船俱乐部,圆明园路 76 号。红砖维多利亚式,游泳池是上海最早的室内泳池。2013 年修缮后改作展厅。",
        story_en:
          "Starting point. The 1905 British Rowing Club at 76 Yuanmingyuan Road. Red-brick Victorian — its swimming pool was the city's first indoor pool. Restored in 2013 and reopened as an exhibition hall.",
        photos: [],
      },
      {
        name: "新天安堂",
        name_en: "Union Church",
        coords: [31.2456, 121.4878],
        story:
          "1886 年建,英国侨民混合教派教堂。原塔被 2007 年大火烧毁,2010 年按原图重建。砖缝里还能看到老砖与新砖的颜色差。",
        story_en:
          "Built 1886 as a non-denominational church for British residents. The original tower burned down in a 2007 fire and was rebuilt in 2010 from the original drawings. Look closely at the brickwork — old and new bricks differ in tone.",
        photos: [],
      },
      {
        name: "外白渡桥",
        name_en: "Garden Bridge / Waibaidu Bridge",
        coords: [31.2460, 121.4876],
        story:
          "1907 年建,中国第一座全钢结构铆接桥。2008 年整桥被船运到船厂大修,3 个月后送回原位。栏杆原色是深绿,1980 年代被改成银灰。",
        story_en:
          "Built 1907 — China's first all-steel riveted bridge. In 2008 the entire bridge was floated downriver to a shipyard, refurbished, and returned three months later. The rails were originally dark green; they were repainted silver in the 1980s.",
        photos: [],
      },
      {
        name: "外滩中段 · 万国建筑群",
        name_en: "Mid-Bund · Foreign Buildings",
        coords: [31.2399, 121.4901],
        story:
          "汇丰银行、海关大楼、和平饭店一段。如果时间紧,这段可一带而过;若有兴趣,见'外滩万国建筑'专题。",
        story_en:
          "The HSBC, Customs House and Peace Hotel stretch. Skim it if pressed for time, or see our dedicated 'Bund 22 Buildings' route for the full story.",
        photos: [],
      },
      {
        name: "金陵东路 · 老外滩骑楼",
        name_en: "Jinling East Road · old colonnaded street",
        coords: [31.2330, 121.4854],
        story:
          "上海唯一一段骑楼街,1900 年代法租界与公共租界交界处商业模仿广州。2017 年修缮但未拆,街铺仍营业。",
        story_en:
          "Shanghai's only stretch of qilou colonnaded street, an early-1900s commercial imitation of Guangzhou at the boundary of the French and International Settlements. Restored in 2017 without demolition; shops still trade.",
        photos: [],
      },
      {
        name: "十六铺 · 老码头",
        name_en: "Shiliupu · old docks",
        coords: [31.2236, 121.4906],
        story:
          "1862 年起的上海最大客货码头,百年中是江浙人来沪的第一脚。现存一栋 1947 年候船楼,被改成餐饮区。江风一上来仍能闻到柴油味。",
        story_en:
          "From 1862, Shanghai's largest passenger and cargo dock — for a century, the first step ashore for migrants from Jiangsu and Zhejiang. The 1947 waiting hall survives, repurposed as a dining strip. With the river wind, you can still smell diesel.",
        photos: [],
      },
      {
        name: "董家渡天主堂",
        name_en: "Dongjiadu Catholic Church",
        coords: [31.2184, 121.4925],
        story:
          "终点。1853 年法国耶稣会建,上海最早的西式天主堂,比徐家汇天主堂早 57 年。巴洛克立面但内部为中式木构,十字架由中国木匠打。",
        story_en:
          "Endpoint. Built 1853 by French Jesuits — Shanghai's earliest Western-style Catholic church, 57 years older than St. Ignatius. Baroque facade but Chinese timber-frame interior; the cross was cut by local carpenters.",
        photos: [],
      },
    ],
  },
  {
    id: "hengshan-fenyang-baoqing",
    name: "衡山-汾阳-宝庆:领事馆与音乐学院",
    name_en: "Hengshan–Fenyang–Baoqing: consulates and the conservatory",
    hook: "音乐声从老洋房窗户飘出来",
    hook_en: "Music drifts out of the old villas' windows",
    theme: "梧桐区老洋房",
    atmosphere: "适合 date",
    distanceKm: 4.0,
    durationMin: 150,
    publishedAt: "2026-04-23",
    district: "徐汇",
    tags: ["梧桐", "音乐", "领事馆"],
    coverColor: "#5d6c4a",
    stops: [
      {
        name: "衡山路 · 桃江路口",
        name_en: "Hengshan Road · Taojiang Road junction",
        coords: [31.2098, 121.4439],
        story:
          "起点。衡山路是上海老法租界的西延伸,1922 年贝当路。这一带保留了民国时期最完整的悬铃木林荫道。",
        story_en:
          "Starting point. Hengshan Road extends the old French Concession west — laid out in 1922 as Avenue Pétain. The plane-tree avenue here is the most intact stretch from the Republican era.",
        photos: [],
      },
      {
        name: "汾阳路 79 号 · 工艺美术博物馆",
        name_en: "79 Fenyang Road · Arts and Crafts Museum",
        coords: [31.2079, 121.4435],
        story:
          "1905 年法租界公董局总董官邸,法国文艺复兴式。门票 25 元,展品多但更值的是楼本身:大理石楼梯、彩色玻璃天井。",
        story_en:
          "The 1905 official residence of the French Concession's Council director. French Renaissance style. Tickets ¥25 — the exhibits are decent, but the building itself is the draw: marble stairs, stained-glass atrium.",
        photos: [],
      },
      {
        name: "汾阳路 20 号 · 上海音乐学院",
        name_en: "20 Fenyang Road · Shanghai Conservatory",
        coords: [31.2095, 121.4424],
        story:
          "1927 年蔡元培、萧友梅创办,中国最早的高等音乐学府。校园开放,工作日下午 4 点后能听到练琴声从各栋楼飘出。",
        story_en:
          "Founded in 1927 by Cai Yuanpei and Xiao Youmei — China's earliest higher-education music school. The campus is open; after 4 p.m. on weekdays you can hear practice music drifting from every building.",
        photos: [],
      },
      {
        name: "汾阳路 150 号 · 白公馆",
        name_en: "150 Fenyang Road · Bai Mansion",
        coords: [31.2068, 121.4442],
        story:
          "1919 年建,法式古典主义。曾是民国海军部长白崇禧官邸,后归徐汇区政府接待用。现作为西餐厅,可入园。",
        story_en:
          "Built 1919, French classical. Once the residence of Republican navy minister Bai Chongxi; later used by the Xuhui District government for receptions. Now a Western restaurant — the garden is open.",
        photos: [],
      },
      {
        name: "宝庆路 3 号",
        name_en: "3 Baoqing Road",
        coords: [31.2123, 121.4435],
        story:
          "1925 年染料大王周宗良私宅,五栋楼围合的花园别墅。修缮花了 5 年,2017 年作为'网红艺术空间'对外。展览质量一般,但花园是徐汇最美。",
        story_en:
          "1925 estate of dye magnate Zhou Zongliang — five buildings around a garden. Restoration took five years; reopened in 2017 as an art space. The exhibitions are average; the garden is Xuhui's loveliest.",
        photos: [],
      },
      {
        name: "宝庆路口 · 衡山路尾",
        name_en: "Baoqing junction · end of Hengshan",
        coords: [31.2129, 121.4459],
        story:
          "终点。这里曾是法租界最热闹的酒吧街,2010 年后大多迁走。剩下几家咖啡馆做完收尾再合适不过。",
        story_en:
          "Endpoint. This was the busiest bar street in the old French Concession; most moved out after 2010. The few remaining cafes are perfect for wrapping up.",
        photos: [],
      },
    ],
  },
  {
    id: "hengfu-deep",
    name: "衡复深部:高安-康平-余庆",
    name_en: "Deep Hengfu: Gao'an–Kangping–Yuqing",
    hook: "无商业,纯洋房,本地人遛弯儿的路",
    hook_en: "No shops, just villas — where locals walk their dogs",
    theme: "梧桐区老洋房",
    atmosphere: "适合独自",
    distanceKm: 3.4,
    durationMin: 120,
    publishedAt: "2026-04-16",
    district: "徐汇",
    tags: ["梧桐", "老洋房", "安静"],
    coverColor: "#475d4a",
    stops: [
      {
        name: "高安路 · 康平路口",
        name_en: "Gao'an Road · Kangping Road junction",
        coords: [31.2003, 121.4395],
        story:
          "起点。高安路 1949 年前叫高恩路,法租界最西的支线。沿街洋房早年是法商住宅,90 年代开始作为市府家属区。",
        story_en:
          "Starting point. Gao'an Road was Avenue Cohen before 1949 — the westernmost spur of the French Concession. The villas along it once housed French merchants; from the 1990s they became municipal-government family quarters.",
        photos: [],
      },
      {
        name: "康平路 100 弄",
        name_en: "Lane 100 Kangping Road",
        coords: [31.2011, 121.4378],
        story:
          "1930 年代法商建造的双拼别墅群,清水红砖、木质百叶窗。整条弄被市府保护,至今未做沿街商业。日落时光线最好。",
        story_en:
          "A cluster of 1930s French semi-detached villas — bare red brick, wooden louvres. The entire lane is municipally protected; no street-level shops have ever been allowed. Best light at sunset.",
        photos: [],
      },
      {
        name: "余庆路 190 弄 · 邹韬奋旧居",
        name_en: "Lane 190 Yuqing Road · Zou Taofen's residence",
        coords: [31.2032, 121.4357],
        story:
          "1934 年新闻人邹韬奋在此办《生活》周刊,被国民党查封。三层西班牙式,二楼书房保持原貌。免费,周一闭馆。",
        story_en:
          "Journalist Zou Taofen ran Life Weekly here from 1934 until the Nationalists shut it down. A three-storey Spanish-style villa; the second-floor study is kept as it was. Free, closed Mondays.",
        photos: [],
      },
      {
        name: "湖南路 105 号 · 周信芳旧居",
        name_en: "105 Hunan Road · Zhou Xinfang's residence",
        coords: [31.2044, 121.4373],
        story:
          "1955 年至 1968 年京剧大师周信芳住所,英式假四层。一楼仍保留他练功的木地板,有他练功踏出的浅槽。",
        story_en:
          "Home of Peking Opera master Zhou Xinfang from 1955 to 1968. English mock-four-storey. The ground-floor wooden practice floor still bears the shallow grooves worn in by his daily training.",
        photos: [],
      },
      {
        name: "复兴西路 26 号 · 柯灵故居",
        name_en: "26 Fuxing West Road · Ke Ling's residence",
        coords: [31.2077, 121.4410],
        story:
          "作家柯灵从 1959 年住到 2000 年。三层西班牙式,二楼是他的写作室,《不夜城》在此完成。门票 8 元。",
        story_en:
          "Writer Ke Ling lived here from 1959 to 2000 — a three-storey Spanish-style villa. His study on the second floor is where he wrote The Sleepless City. Tickets ¥8.",
        photos: [],
      },
      {
        name: "高邮路 · 复兴西路口",
        name_en: "Gaoyou Road · Fuxing West junction",
        coords: [31.2083, 121.4427],
        story:
          "终点。这里是衡复地区最安静的角落,1923 年起的洋房保留度最高。没有商业,只有树荫。",
        story_en:
          "Endpoint. The quietest corner of Hengfu — villas from 1923 onward remain most intact here. No shops, just shade.",
        photos: [],
      },
    ],
  },
  {
    id: "tianzifang",
    name: "田子坊:被改造的石库门",
    name_en: "Tianzifang: shikumen, commercialised",
    hook: "看老石库门怎么变成网红市集",
    hook_en: "How an old shikumen lane became a tourist market",
    theme: "老石库门",
    atmosphere: "适合朋友",
    distanceKm: 1.8,
    durationMin: 100,
    publishedAt: "2026-04-09",
    district: "黄浦",
    tags: ["石库门", "改造", "网红"],
    coverColor: "#9c4f3a",
    stops: [
      {
        name: "泰康路 210 弄入口",
        name_en: "Lane 210 Taikang Road · entrance",
        coords: [31.2105, 121.4690],
        story:
          "起点。泰康路 210 弄,原 1933 年志成坊。2000 年画家陈逸飞、尔东强、王劼音陆续进驻,以艺术工作室带动改造。",
        story_en:
          "Starting point. Lane 210, originally Zhicheng Lane built in 1933. From 2000 painters Chen Yifei, Er Dongqiang and Wang Jieyin moved in, opening studios that triggered the makeover.",
        photos: [],
      },
      {
        name: "陈逸飞工作室旧址",
        name_en: "Chen Yifei's former studio",
        coords: [31.2107, 121.4691],
        story:
          "210 弄 4 号。陈逸飞 2002 年至 2005 年的工作室。门头保留'陈逸飞工作室'铜牌。现为画廊兼咖啡店。",
        story_en:
          "No. 4 in Lane 210. Painter Chen Yifei's studio from 2002 to 2005. The bronze 'Chen Yifei Studio' plate at the door remains. Now a gallery-cafe.",
        photos: [],
      },
      {
        name: "210 弄主弄",
        name_en: "Main artery of Lane 210",
        coords: [31.2103, 121.4692],
        story:
          "弄堂宽 3 米,两侧三层石库门改成 200 多间小铺。抬头看,二三层仍有原住民居住,晾衣杆和招牌共存,是田子坊最矛盾的画面。",
        story_en:
          "The lane is three metres wide, with two-storey shikumen on both sides converted into more than 200 small shops. Look up: the second and third floors are still residential — laundry poles and shop signs share the air, the most contradictory image at Tianzifang.",
        photos: [],
      },
      {
        name: "248 弄",
        name_en: "Lane 248",
        coords: [31.2098, 121.4694],
        story:
          "248 弄是 2005 年才并入田子坊的支线,商业化程度比 210 弄稍低。弄底有几家做了十几年的小店,价格仍是 2010 年水平。",
        story_en:
          "Lane 248 was only folded into Tianzifang in 2005 and is a touch less commercialised than Lane 210. A few shops at the back of the lane have run for over a decade — prices still at 2010 levels.",
        photos: [],
      },
      {
        name: "274 弄 · 工作室区",
        name_en: "Lane 274 · studios cluster",
        coords: [31.2100, 121.4697],
        story:
          "274 弄保留了画家工作室原貌,有 5 家作家、设计师驻留型空间。可推开门看,但请别打扰创作。",
        story_en:
          "Lane 274 keeps the original painter studios — five resident artist/designer spaces. You can push the door open to look, just don't interrupt the work.",
        photos: [],
      },
      {
        name: "建国中路口",
        name_en: "Jianguo Middle Road junction",
        coords: [31.2095, 121.4692],
        story:
          "终点。出弄就是建国中路。如果想看未被改造的石库门版本,可接'步高里-建国西路'路线。",
        story_en:
          "Endpoint. Step out of the lane onto Jianguo Middle Road. To see shikumen that hasn't been remade, pick up the Bugaoli–Jianguo West route from here.",
        photos: [],
      },
    ],
  },
  {
    id: "bugaoli-jianguo-west",
    name: "步高里-建国西路:未被改造的石库门",
    name_en: "Bugaoli–Jianguo West: shikumen as it was",
    hook: "和田子坊对比着走,看商业化前的样子",
    hook_en: "Pair with Tianzifang to see what shikumen looked like before",
    theme: "老石库门",
    atmosphere: "适合独自",
    distanceKm: 2.6,
    durationMin: 110,
    publishedAt: "2026-04-02",
    district: "黄浦",
    tags: ["石库门", "原汁原味", "对比"],
    coverColor: "#7a3a2a",
    stops: [
      {
        name: "陕西南路 287 弄 · 步高里",
        name_en: "Lane 287 Shaanxi South · Bugaoli",
        coords: [31.2128, 121.4501],
        story:
          "起点。1930 年法商建造,中法合璧式石库门。弄口有'BOUGEOIS'法文铭牌(中译'步高'),全城仅此一处。整条弄堂结构 95% 保留。",
        story_en:
          "Starting point. Built 1930 by French investors — a Sino-French shikumen hybrid. The lane entrance bears a French plate reading 'BOUGEOIS' (rendered as '步高'), the only one in the city. About 95% of the original layout is intact.",
        photos: [],
      },
      {
        name: "步高里 79 号 · 巴金旧居",
        name_en: "79 Bugaoli · Ba Jin's old residence",
        coords: [31.2126, 121.4504],
        story:
          "巴金 1937 至 1955 年住此。两层石库门,门头雕花是上海石库门最典型的'雕梁画栋'样式。仅外观可看,内仍居民。",
        story_en:
          "Ba Jin lived here from 1937 to 1955. A two-storey shikumen — the carved door lintel is the most textbook Shanghai shikumen ornament. Exterior only; still inhabited.",
        photos: [],
      },
      {
        name: "陕西南路 39 弄",
        name_en: "Lane 39 Shaanxi South Road",
        coords: [31.2155, 121.4519],
        story:
          "1925 年广式石库门,弄堂宽窄不一,煤球炉、晾衣杆、自行车堆积。这是上海石库门日常状态,而不是博物馆状态。",
        story_en:
          "1925 Cantonese-style shikumen — uneven lane widths, coal stoves, laundry poles, bicycles piled up. This is shikumen as daily life, not as museum exhibit.",
        photos: [],
      },
      {
        name: "建国西路 365 弄",
        name_en: "Lane 365 Jianguo West Road",
        coords: [31.2112, 121.4529],
        story:
          "1932 年新式里弄,弄底有 1947 年的水井(铁盖封住)。整条弄堂有三家做了三代的修鞋、配钥匙、裁缝铺,本地人口中的'三老爷'。",
        story_en:
          "1932 new-style lane. A 1947 well (iron-capped) sits at the back. Three shops — a cobbler, a key-cutter and a tailor — have all run three generations; locals know them as 'the three old masters'.",
        photos: [],
      },
      {
        name: "建国西路 480 弄",
        name_en: "Lane 480 Jianguo West Road",
        coords: [31.2104, 121.4554],
        story:
          "1936 年建,英式联排石库门。这条弄堂入选 2019 年上海历史风貌区扩展名单,这意味着至少 30 年内不会被拆。可以慢慢看。",
        story_en:
          "Built 1936 — English-style terraced shikumen. The lane was added to Shanghai's protected historic precincts in 2019, meaning no demolition for at least 30 years. Take your time.",
        photos: [],
      },
      {
        name: "瑞金二路口",
        name_en: "Ruijin No. 2 Road junction",
        coords: [31.2108, 121.4575],
        story:
          "终点。建国西路这一段没有任何商业改造,菜场、杂货铺都是给本地人。如果想吃午饭,转角的牛肉面店开了 25 年。",
        story_en:
          "Endpoint. This stretch of Jianguo West has had no commercial makeover — wet markets and grocery shops still serve the residents. For lunch, the beef-noodle shop on the corner has been open 25 years.",
        photos: [],
      },
    ],
  },
];

export function getRouteById(id) {
  return ROUTES.find((r) => r.id === id);
}

// haversine 球面距离(km)
export function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function nearestStopDistanceKm(route, point) {
  if (!route?.stops?.length || !point) return Infinity;
  let min = Infinity;
  for (const s of route.stops) {
    const d = haversineKm(s.coords, point);
    if (d < min) min = d;
  }
  return min;
}

// 路线之间点位重合检查(开发期 sanity check,不在 UI 调用)
export function _devOverlapCheck() {
  const result = [];
  for (let i = 0; i < ROUTES.length; i++) {
    for (let j = i + 1; j < ROUTES.length; j++) {
      const a = new Set(ROUTES[i].stops.map((s) => s.name));
      const overlap = ROUTES[j].stops.filter((s) => a.has(s.name));
      if (overlap.length > 1) {
        result.push({ a: ROUTES[i].id, b: ROUTES[j].id, overlap });
      }
    }
  }
  return result;
}
