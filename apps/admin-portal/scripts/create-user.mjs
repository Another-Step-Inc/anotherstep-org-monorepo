import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;
const [emailArg, nameArg, roleArg, password] = process.argv.slice(2);
const allowedRoles = new Set(['admin', 'lead', 'developer', 'qa', 'security', 'release', 'content_author', 'content_reviewer']);
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before creating a portal user.');
if (!emailArg || !nameArg || !allowedRoles.has(roleArg) || !password || password.length < 12) {
  throw new Error('Usage: pnpm --filter admin-portal db:user -- <email> "<name>" <admin|lead|developer|qa|security|release|content_author|content_reviewer> <password-12+-chars>');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, name, role, password_hash)
     VALUES (LOWER($1), $2, $3, $4)`,
    [emailArg.trim(), nameArg.trim(), roleArg, hash],
  );
  console.log(`Created ${roleArg} account for ${emailArg.trim().toLowerCase()}.`);
} finally {
  await pool.end();
}
