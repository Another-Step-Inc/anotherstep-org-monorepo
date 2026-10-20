import type { APIRoute } from 'astro';
import { approvalStages, db, isUuid } from '../../../../lib/db';

export const POST: APIRoute = async (context) => {
  const user = context.locals.user!;
  const requestId = context.params.id;
  const form = await context.request.formData();
  const outcome = String(form.get('outcome') ?? '');
  const comments = String(form.get('comments') ?? '').trim();
  if (!isUuid(requestId) || !['approved', 'rejected'].includes(outcome)) {
    return context.redirect('/change', 303);
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const request = await client.query(
      'SELECT id, request_number, status, created_by FROM change_requests WHERE id = $1 FOR UPDATE',
      [requestId],
    );
    if (!request.rowCount) {
      await client.query('ROLLBACK');
      return context.redirect('/change', 303);
    }
    const record = request.rows[0];
    const stageIndex = approvalStages.findIndex((stage) => `pending_${stage.role === 'lead' ? 'lead_review' : stage.role}` === record.status);
    const stage = approvalStages[stageIndex];
    if (!stage || (user.role !== stage.role && user.role !== 'admin')) {
      await client.query('ROLLBACK');
      return context.redirect(`/change/${requestId}?error=not-authorized`, 303);
    }
    if (stageIndex > 0) {
      const preceding = await client.query(
        'SELECT status FROM change_request_approvals WHERE change_request_id = $1 AND approval_level = $2',
        [requestId, stage.level - 1],
      );
      if (preceding.rows[0]?.status !== 'approved') {
        await client.query('ROLLBACK');
        return context.redirect(`/change/${requestId}?error=stage-order`, 303);
      }
    }

    const approvalUpdate = await client.query(
      `UPDATE change_request_approvals
          SET status = $1, approver_id = $2, comments = $3, approved_at = NOW()
        WHERE change_request_id = $4 AND approval_level = $5 AND status = 'pending'`,
      [outcome, user.id, comments || null, requestId, stage.level],
    );
    if (!approvalUpdate.rowCount) {
      await client.query('ROLLBACK');
      return context.redirect(`/change/${requestId}?error=stage-order`, 303);
    }
    const nextStatus = outcome === 'rejected'
      ? 'rejected'
      : stageIndex === approvalStages.length - 1
        ? 'released'
        : `pending_${approvalStages[stageIndex + 1].role === 'lead' ? 'lead_review' : approvalStages[stageIndex + 1].role}`;
    await client.query(
      `UPDATE change_requests
          SET status = $1, updated_at = NOW(),
              released_at = CASE WHEN $1 = 'released' THEN NOW() ELSE released_at END
        WHERE id = $2`,
      [nextStatus, requestId],
    );
    await client.query(
      `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, details)
       VALUES ($1, 'change_request', $2, $3, $4::jsonb)`,
      [user.id, requestId, outcome, JSON.stringify({ request_number: record.request_number, stage: stage.label, comments })],
    );
    const message = outcome === 'rejected'
      ? `${record.request_number} was rejected during ${stage.label}.`
      : `${record.request_number} passed ${stage.label}${nextStatus === 'released' ? ' and was released' : ''}.`;
    await client.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [record.created_by, outcome === 'rejected' ? 'Change request rejected' : 'Approval updated', message, outcome],
    );
    if (outcome === 'approved' && nextStatus !== 'released') {
      const nextRole = approvalStages[stageIndex + 1].role;
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         SELECT id, 'Review needed', $1, 'review' FROM users WHERE active = TRUE AND role = $2`,
        [`${record.request_number} is ready for ${approvalStages[stageIndex + 1].label}.`, nextRole],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return context.redirect(`/change/${requestId}`, 303);
};
