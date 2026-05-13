// GET /api/admin/feedback?status=unread|all (default: all)
// PATCH /api/admin/feedback   body: { id, isRead }   → mark read/unread

import { badRequest, json, serverError } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'all';
  const sql =
    status === 'unread'
      ? 'SELECT * FROM feedback WHERE is_read = 0 ORDER BY created_at DESC LIMIT 500'
      : 'SELECT * FROM feedback ORDER BY created_at DESC LIMIT 500';
  try {
    const res = await env.DB.prepare(sql).all();
    return json({ feedback: res.results });
  } catch (e) {
    return serverError(e.message);
  }
}

export async function onRequestPatch({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid json');
  }
  const id = Number(body.id);
  if (!Number.isInteger(id)) return badRequest('id required');
  const isRead = body.isRead ? 1 : 0;
  try {
    await env.DB.prepare('UPDATE feedback SET is_read = ? WHERE id = ?')
      .bind(isRead, id)
      .run();
    return json({ ok: true });
  } catch (e) {
    return serverError(e.message);
  }
}
