-- D1 schema for Nongtangli citywalk
-- Routes & stops carry the editorial content (formerly in lib/routes.js).
-- Ratings & feedback are write-mostly, read only from /admin.

-- ----- routes -----
CREATE TABLE IF NOT EXISTS routes (
  id              TEXT PRIMARY KEY,           -- slug, e.g. "wukang-wuyuan"
  name            TEXT NOT NULL,
  name_en         TEXT,
  hook            TEXT,
  hook_en         TEXT,
  theme           TEXT NOT NULL,
  atmosphere      TEXT NOT NULL,
  intensity       TEXT,                       -- denormalised; we recompute on write but cache it
  distance_km     REAL NOT NULL,
  duration_min    INTEGER NOT NULL,
  district        TEXT NOT NULL,
  tags            TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  cover_color     TEXT,
  walking_path    TEXT,                       -- JSON array of [lat,lng] pairs; null = not yet computed
  published_at    TEXT NOT NULL,              -- ISO date "2026-05-04"
  is_published    INTEGER NOT NULL DEFAULT 1, -- 0 = draft (admin only)
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_routes_published ON routes(is_published, published_at DESC);

-- ----- stops -----
-- One row per stop. ord defines walking order within a route.
CREATE TABLE IF NOT EXISTS stops (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id    TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  ord         INTEGER NOT NULL,
  name        TEXT NOT NULL,
  name_en     TEXT,
  story       TEXT,
  story_en    TEXT,
  lat         REAL NOT NULL,                  -- WGS84
  lng         REAL NOT NULL,
  photos      TEXT NOT NULL DEFAULT '[]',     -- JSON array
  UNIQUE(route_id, ord)
);

CREATE INDEX IF NOT EXISTS idx_stops_route ON stops(route_id, ord);

-- ----- ratings -----
-- Anonymous; we keep client_id (random localStorage UUID) so admin can spot
-- duplicates but we don't claim to identify users.
CREATE TABLE IF NOT EXISTS ratings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id    TEXT NOT NULL,                  -- intentionally not FK: keep ratings even if route renamed
  stars       INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
  comment     TEXT,                           -- optional, max ~500 chars enforced in API
  client_id   TEXT,                           -- optional anti-spam grouping key
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ratings_route ON ratings(route_id, created_at DESC);

-- ----- feedback -----
CREATE TABLE IF NOT EXISTS feedback (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT NOT NULL DEFAULT 'general',-- 'bug' | 'suggestion' | 'general'
  message     TEXT NOT NULL,
  contact     TEXT,                           -- optional email/wechat the user volunteers
  page        TEXT,                           -- pathname where it was submitted
  client_id   TEXT,
  user_agent  TEXT,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_unread ON feedback(is_read, created_at DESC);
