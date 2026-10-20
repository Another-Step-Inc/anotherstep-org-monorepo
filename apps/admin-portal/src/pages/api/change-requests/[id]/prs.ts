import type { APIRoute } from 'astro';
import { db, isUuid } from '../../../../lib/db';
import { writeAudit } from '../../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const user = context.locals.user!;
  const form = await context.request.formData();
  const requestId = context.params.id;
  if (!isUuid(requestId)) return context.redirect('/change', 303);
  const prNumber = String(form.get('pr_number') ?? '').trim();
  const repository = String(form.get('repository') ?? '').trim();
  const prUrl = String(form.get('pr_url') ?? '').trim();
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(prUrl);
  } catch {
    return context.redirect(`/change/${requestId}?error=pr`, 303);
  }
  if (!prNumber || !repository || !['http:', 'https:'].includes(parsedUrl.protocol)) {
    return context.redirect(`/change/${requestId}?error=pr`, 303);
  }

  const result = await db.query(
    `INSERT INTO change_request_prs (change_request_id, pr_number, pr_url, repository)
     SELECT id, $2, $3, $4 FROM change_requests WHERE id = $1
     RETURNING change_request_id`,
    [requestId, prNumber, parsedUrl.toString(), repository],
  );
  if (!result.rowCount) return context.redirect('/change', 303);
  await writeAudit(user.id, 'change_request', requestId, 'pull_request_linked', { pr_number: prNumber, repository });
  return context.redirect(`/change/${requestId}`, 303);
};
