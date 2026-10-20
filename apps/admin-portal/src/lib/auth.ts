import { createHash, randomBytes } from 'node:crypto';
import type { APIContext } from 'astro';
import { db } from './db';

const sessionCookie = 'admin_session';
const sessionDuration = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const result = await db.query(
    `SELECT users.id, users.email, users.name, users.role
       FROM auth_sessions
       JOIN users ON users.id = auth_sessions.user_id
      WHERE auth_sessions.token_hash = $1
        AND auth_sessions.expires_at > NOW()
        AND users.active = TRUE`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function createSession(userId: string, context: APIContext): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + sessionDuration);
  await db.query(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt],
  );
  context.cookies.set(sessionCookie, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(context: APIContext): Promise<void> {
  const token = context.cookies.get(sessionCookie)?.value;
  if (token) {
    await db.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashToken(token)]);
  }
  context.cookies.delete(sessionCookie, { path: '/' });
}

export async function writeAudit(
  userId: string,
  entityType: string,
  entityId: string | null,
  action: string,
  details: Record<string, unknown>,
): Promise<void> {
  await db.query(
    `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, entityType, entityId, action, JSON.stringify(details)],
  );
}
