// One-shot: push the 5 route fixes from data/routes.seed.json into the live D1
// via the /api/admin/routes endpoint, preserving walking_path where stops are
// unchanged and regenerating it where they aren't.
//
// Usage:
//   ADMIN_USER=admin ADMIN_PASS=... \
//   BASE_URL=https://nongtangli.pages.dev \
//   node scripts/sync-route-fixes.mjs
//
// Falls back to .dev.vars for credentials if env vars aren't set.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function readDevVars() {
  const out = {};
  try {
    const txt = fs.readFileSync(path.join(ROOT, ".dev.vars"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch {}
  return out;
}

const dv = readDevVars();
const BASE_URL = process.env.BASE_URL || "https://nongtangli.pages.dev";
const ADMIN_USER = process.env.ADMIN_USER || dv.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || dv.ADMIN_PASSWORD;

if (!ADMIN_PASS) {
  console.error("ADMIN_PASS missing (env or .dev.vars)");
  process.exit(1);
}

const auth =
  "Basic " + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString("base64");

const SEED = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "routes.seed.json"), "utf8"),
);
const seedById = Object.fromEntries(SEED.map((r) => [r.id, r]));

// id → which fields to copy from seed onto current DB row
// stopsChanged: true means rebuild walking_path after the POST
const PLAN = [
  { id: "hengfu-deep", fields: ["stops"], stopsChanged: true },
  { id: "wukang-anfu-classic", fields: ["stops"], stopsChanged: false },
  { id: "bund-source-to-shiliupu", fields: ["stops"], stopsChanged: false },
  {
    id: "bund-22-buildings",
    fields: ["name", "name_en", "hook", "hook_en"],
    stopsChanged: false,
  },
  {
    id: "yangpu-riverside",
    fields: ["name", "name_en", "stops"],
    stopsChanged: true,
  },
];

async function getRoute(id) {
  const r = await fetch(`${BASE_URL}/api/admin/routes`, {
    headers: { authorization: auth },
  });
  if (!r.ok) throw new Error(`GET routes ${r.status}`);
  const { routes } = await r.json();
  const found = routes.find((x) => x.id === id);
  if (!found) throw new Error(`route ${id} not found in DB`);
  return found;
}

async function postRoute(payload) {
  const r = await fetch(`${BASE_URL}/api/admin/routes`, {
    method: "POST",
    headers: {
      authorization: auth,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`POST ${r.status}: ${txt}`);
  return txt;
}

async function rebuildPath(id) {
  const r = await fetch(
    `${BASE_URL}/api/admin/routes/${encodeURIComponent(id)}/build-path`,
    { method: "POST", headers: { authorization: auth } },
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`build-path ${r.status}: ${data.error || ""}`);
  return data;
}

let allRoutesCache = null;
async function loadAllRoutes() {
  if (allRoutesCache) return allRoutesCache;
  const r = await fetch(`${BASE_URL}/api/admin/routes`, {
    headers: { authorization: auth },
  });
  if (!r.ok) throw new Error(`GET routes ${r.status}`);
  allRoutesCache = (await r.json()).routes;
  return allRoutesCache;
}

(async () => {
  const all = await loadAllRoutes();
  const byId = Object.fromEntries(all.map((r) => [r.id, r]));

  for (const { id, fields, stopsChanged } of PLAN) {
    const current = byId[id];
    if (!current) {
      console.warn(`SKIP ${id} — not in DB`);
      continue;
    }
    const seed = seedById[id];
    if (!seed) {
      console.warn(`SKIP ${id} — not in seed file`);
      continue;
    }

    const payload = { ...current };
    for (const f of fields) {
      payload[f] = seed[f];
    }
    // Preserve walking_path only when stops unchanged
    if (stopsChanged) {
      payload.walkingPath = null;
    }

    process.stdout.write(`→ ${id} (${fields.join(",")})... `);
    try {
      await postRoute(payload);
      console.log("ok");
    } catch (e) {
      console.log("FAIL:", e.message);
      continue;
    }

    if (stopsChanged) {
      process.stdout.write(`  rebuilding path... `);
      try {
        const r = await rebuildPath(id);
        console.log(`ok (${r.segments} 段, ${r.points} 点)`);
      } catch (e) {
        console.log("FAIL:", e.message);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  console.log("done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
