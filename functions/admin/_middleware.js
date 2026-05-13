// Gate every /admin/* page behind Basic Auth.
// The admin UI itself is still served as static HTML from Next's export —
// this middleware only adds the 401 challenge.

import { requireBasicAuth } from '../_lib/auth.js';

export const onRequest = async (context) => {
  const blocked = requireBasicAuth(context);
  if (blocked) return blocked;
  return context.next();
};
