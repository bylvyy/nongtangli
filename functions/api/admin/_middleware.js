// Same gate, but for the admin write APIs.
import { requireBasicAuth } from '../../_lib/auth.js';

export const onRequest = async (context) => {
  const blocked = requireBasicAuth(context);
  if (blocked) return blocked;
  return context.next();
};
