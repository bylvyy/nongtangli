// Basic Auth gate for /admin/* pages and /api/admin/* APIs.
// Replaces the old functions/admin/_middleware.js + functions/api/admin/_middleware.js.
// Runs at the edge — env vars come from Cloudflare Pages bindings (or .dev.vars locally).

import { NextResponse } from "next/server";

const REALM = "Nongtangli admin";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(request) {
  // Pull env via getRequestContext when available; fall back to process.env
  // for `next dev` so the middleware doesn't crash without bindings.
  let env = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("@cloudflare/next-on-pages");
    if (typeof mod.getRequestContext === "function") {
      env = mod.getRequestContext().env;
    }
  } catch {
    env = process.env;
  }

  const expectedPass = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const expectedUser =
    env.ADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";

  if (!expectedPass) {
    return new NextResponse("admin password not configured", { status: 500 });
  }

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return challenge();

  let decoded = "";
  try {
    decoded = atob(header.slice("Basic ".length).trim());
  } catch {
    return challenge();
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return challenge();
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  if (!safeEqual(user, expectedUser) || !safeEqual(pass, expectedPass)) {
    return challenge();
  }
  return NextResponse.next();
}

function challenge() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
