import type { APIRoute } from 'astro';
import { approvalStages, db } from '../../../lib/db';
import { writeAudit } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const user = context.locals.user!;
  const form = await context.request.formData();
  const title = String(form.get('title') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const justification = String(form.get('business_justification') ?? '').trim();
  const repository = String(form.get('repository') ?? '').trim();
  const branchName = String(form.get('branch_name') ?? '').trim();
  const priority = String(form.get('priority') ?? 'medium');
  if (!title || !description || !justification || !repository || !branchName ||
      !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    return context.redirect('/change/new?error=required', 303);
  }

  const client = await db.connect();
  let requestId: string;
  let requestNumber: string;
  try {
    await client.query('BEGIN');
    const created = await client.query(
      `INSERT INTO change_requests
        (request_number, title, description, business_justification, repository, branch_name, priority, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, request_number`,
      [`CR-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
        title, description, justification, repository, branchName, priority, user.id],
    );
    requestId = created.rows[0].id;
    requestNumber = created.rows[0].request_number;
    for (const stage of approvalStages) {
      await client.query(
        'INSERT INTO change_request_approvals (change_request_id, approval_level) VALUES ($1, $2)',
        [requestId, stage.level],
      );
    }
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       SELECT id, 'New change request', $1, 'review'
         FROM users WHERE active = TRUE AND role IN ('lead', 'admin') AND id <> $2`,
      [`${requestNumber} is ready for lead code review.`, user.id],
    );
    await client.query(
      `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, details)
       VALUES ($1, 'change_request', $2, 'created', $3::jsonb)`,
      [user.id, requestId, JSON.stringify({ request_number: requestNumber, title })],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return context.redirect(`/change/${requestId}`, 303);
};
