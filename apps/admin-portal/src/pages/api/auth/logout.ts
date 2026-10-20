import type { APIRoute } from 'astro';
import { destroySession, writeAudit } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const user = context.locals.user;
  if (user) await writeAudit(user.id, 'session', null, 'signed_out', {});
  await destroySession(context);
  return context.redirect('/login', 303);
};
