// Shared Basic Auth gate. Reads ADMIN_PASSWORD (and optional ADMIN_USERNAME)
// from Pages env vars / .dev.vars. Reject early so admin handlers never see
// unauthenticated requests.

const REALM = "Nongtangli admin";

export function requireBasicAuth(request, env) {
  const expectedPass = env.ADMIN_PASSWORD;
  if (!expectedPass) {
    return new Response("admin password not configured", { status: 500 });
  }
  const expectedUser = env.ADMIN_USERNAME || "admin";

  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) {
    return challenge();
  }
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
  return null;
}

function challenge() {
  return new Response("Authentication required", {
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
