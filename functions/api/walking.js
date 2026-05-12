// Cloudflare Pages Function: 高德步行规划代理
// 浏览器调 /api/walking?origin=lng,lat&destination=lng,lat
// 我们在服务端拼上 key 转发给高德,绕开浏览器侧的 CORS 和域名校验
//
// key 通过 Cloudflare Pages 环境变量 AMAP_SERVER_KEY 注入(不带 NEXT_PUBLIC_ 前缀,只在服务端可见)

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.searchParams.get("origin");
  const destination = url.searchParams.get("destination");

  if (!origin || !destination) {
    return json({ error: "missing origin or destination" }, 400);
  }

  const key = env.AMAP_SERVER_KEY;
  if (!key) {
    return json({ error: "server key not configured" }, 500);
  }

  const upstream = `https://restapi.amap.com/v3/direction/walking?key=${encodeURIComponent(
    key,
  )}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

  try {
    const res = await fetch(upstream, {
      headers: { "Accept-Encoding": "gzip" },
      cf: { cacheTtl: 60 * 60 * 24 * 7, cacheEverything: true },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return json({ error: "upstream fetch failed" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
