import type { APIRoute } from 'astro';
import { db, isUuid } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  const user = context.locals.user!;
  const form = await context.request.formData();
  const notificationId = String(form.get('notification_id') ?? '');
  if (!notificationId) {
    await db.query('UPDATE notifications SET "read" = TRUE WHERE user_id = $1', [user.id]);
  } else if (isUuid(notificationId)) {
    await db.query('UPDATE notifications SET "read" = TRUE WHERE id = $1 AND user_id = $2', [notificationId, user.id]);
  } else {
    return context.redirect('/notifications', 303);
  }
  return context.redirect('/notifications', 303);
};
