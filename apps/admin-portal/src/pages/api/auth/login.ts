import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { createSession, writeAudit } from '../../../lib/auth';
import { db } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const result = await db.query(
    'SELECT id, password_hash FROM users WHERE LOWER(email) = $1 AND active = TRUE',
    [email],
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return context.redirect('/login?error=credentials', 303);
  }
  await createSession(user.id, context);
  await writeAudit(user.id, 'session', null, 'signed_in', { email });
  return context.redirect('/', 303);
};
