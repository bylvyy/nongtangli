// GET    /api/admin/routes/:id  — single route incl. drafts
// DELETE /api/admin/routes/:id

import { json, rowsToRoute, serverError } from '../../../_lib/db.js';

export async function onRequestGet({ env, params }) {
  const id = params.id;
  try {
    const route = await env.DB.prepare('SELECT * FROM routes WHERE id = ?')
      .bind(id)
      .first();
    if (!route) return json({ error: 'not found' }, 404);
    const stops = await env.DB.prepare(
      'SELECT * FROM stops WHERE route_id = ? ORDER BY ord',
    )
      .bind(id)
      .all();
    return json({ route: rowsToRoute(route, stops.results) });
  } catch (e) {
    return serverError(e.message);
  }
}

export async function onRequestDelete({ env, params }) {
  const id = params.id;
  try {
    // ON DELETE CASCADE on stops handles the children.
    await env.DB.prepare('DELETE FROM routes WHERE id = ?').bind(id).run();
    return json({ ok: true });
  } catch (e) {
    return serverError(e.message);
  }
}
