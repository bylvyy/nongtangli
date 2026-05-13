import { badRequest, getEnv, json, serverError } from "@/lib/server/db";

export const runtime = "edge";

const ALLOWED_CATEGORIES = new Set(["bug", "suggestion", "general"]);

export async function POST(request) {
  const env = getEnv();
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid json");
  }
  const message = String(body.message || "").trim();
  if (!message) return badRequest("message required");
  if (message.length > 2000) return badRequest("message too long");

  const category = ALLOWED_CATEGORIES.has(body.category)
    ? body.category
    : "general";
  const contact = body.contact ? String(body.contact).slice(0, 200) : null;
  const page = body.page ? String(body.page).slice(0, 200) : null;
  const clientId = body.clientId ? String(body.clientId).slice(0, 64) : null;
  const ua = request.headers.get("user-agent") || null;

  try {
    const res = await env.DB.prepare(
      "INSERT INTO feedback (category, message, contact, page, client_id, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(category, message, contact, page, clientId, ua)
      .run();
    return json({ ok: true, id: res.meta?.last_row_id ?? null });
  } catch (e) {
    return serverError(e.message);
  }
}
