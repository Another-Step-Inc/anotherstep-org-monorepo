import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;
const environment = process.env;
const users = [
  {
    email: environment.ADMIN_EMAIL ?? 'admin@localhost',
    name: environment.ADMIN_NAME ?? 'Portal Admin',
    role: 'admin',
    password: environment.ADMIN_PASSWORD ?? 'AdminPortal-Local-Only-123!',
  },
  {
    email: environment.SEED_LEAD_EMAIL ?? 'lead@localhost',
    name: environment.SEED_LEAD_NAME ?? 'Lead Reviewer',
    role: 'lead',
    password: environment.SEED_LEAD_PASSWORD ?? 'Lead-Local-Only-123!',
  },
  {
    email: environment.SEED_DEVELOPER_EMAIL ?? 'developer@localhost',
    name: environment.SEED_DEVELOPER_NAME ?? 'Developer User',
    role: 'developer',
    password: environment.SEED_DEVELOPER_PASSWORD ?? 'Developer-Local-Only-123!',
  },
];
if (!environment.DATABASE_URL) throw new Error('Set DATABASE_URL before seeding the admin portal.');
for (const user of users) {
  if (!user.email.trim() || !user.name.trim() || user.password.length < 12) {
    throw new Error(`Seed user ${user.role} needs a name, email, and password with at least 12 characters.`);
  }
}

const stages = [
  { level: 1, role: 'lead' },
  { level: 2, role: 'qa' },
  { level: 3, role: 'security' },
  { level: 4, role: 'release' },
];
const requestSeeds = [
  ['Improve member dashboard loading', 'Reduce dashboard load time with pagination and query optimization.', 'Members need faster access to account information.', 'anotherstep-org/member-portal', 'perf/dashboard-pagination', 'high', 'pending_lead_review', 1],
  ['Add profile contact preferences', 'Allow members to manage their preferred contact methods.', 'Keep contact preferences accurate and accessible.', 'anotherstep-org/member-portal', 'feature/contact-preferences', 'medium', 'pending_lead_review', 3],
  ['Refresh storefront checkout validation', 'Improve validation messages for shipping and billing fields.', 'Reduce checkout errors and support requests.', 'anotherstep-org/store-site', 'fix/checkout-validation', 'high', 'pending_qa', 5],
  ['Add accessible form field hints', 'Add inline hints and error summaries to public forms.', 'Make form completion clearer for assistive technology users.', 'anotherstep-org/main-site', 'feature/form-field-hints', 'medium', 'pending_qa', 7],
  ['Rotate service API credentials', 'Move service API credentials to environment-based configuration.', 'Reduce risk from long-lived credentials in application config.', 'anotherstep-org/integrations', 'security/credential-config', 'urgent', 'pending_security', 9],
  ['Harden webhook signature checks', 'Validate webhook signatures and reject stale delivery timestamps.', 'Protect integrations from forged and replayed events.', 'anotherstep-org/integrations', 'security/webhook-signatures', 'urgent', 'pending_security', 11],
  ['Update production release health checks', 'Add readiness checks and improve deployment rollback signals.', 'Catch unhealthy releases before they affect users.', 'anotherstep-org/platform', 'release/health-checks', 'high', 'pending_release', 13],
  ['Fix member search on smaller screens', 'Correct search layout and keyboard behavior on mobile breakpoints.', 'Ensure the member search experience is usable on mobile.', 'anotherstep-org/member-portal', 'fix/mobile-member-search', 'medium', 'released', 15],
  ['Add donation receipt download', 'Allow donors to download a receipt from their confirmation page.', 'Make donation records easier to retrieve.', 'anotherstep-org/main-site', 'feature/donation-receipts', 'low', 'released', 18],
  ['Correct empty cart recovery state', 'Show helpful next steps when a cart no longer has available items.', 'Help customers recover from inventory changes.', 'anotherstep-org/store-site', 'fix/empty-cart-recovery', 'low', 'rejected', 21],
];

const pool = new Pool({ connectionString: environment.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const accounts = new Map();
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const result = await client.query(
      `INSERT INTO users (email, password_hash, name, role, active)
       VALUES (LOWER($1), $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             name = EXCLUDED.name,
             role = EXCLUDED.role,
             active = TRUE,
             updated_at = NOW()
       RETURNING id`,
      [user.email.trim(), passwordHash, user.name.trim(), user.role],
    );
    accounts.set(user.role, result.rows[0].id);
  }

  const reviewerRoles = new Map(stages.map((stage) => [stage.level, stage.role]));
  const requestIds = [];
  for (let index = 0; index < requestSeeds.length; index++) {
    const [title, description, justification, repository, branch, priority, status, ageDays] = requestSeeds[index];
    const requestNumber = `CR-SEED-${String(index + 1).padStart(3, '0')}`;
    const timestamp = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000);
    const isReleased = status === 'released';
    const result = await client.query(
      `INSERT INTO change_requests
        (request_number, title, description, business_justification, repository, branch_name,
         priority, status, created_by, created_at, updated_at, released_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11)
       ON CONFLICT (request_number) DO UPDATE
         SET title = EXCLUDED.title,
             description = EXCLUDED.description,
             business_justification = EXCLUDED.business_justification,
             repository = EXCLUDED.repository,
             branch_name = EXCLUDED.branch_name,
             priority = EXCLUDED.priority,
             status = EXCLUDED.status,
             created_by = EXCLUDED.created_by,
             created_at = EXCLUDED.created_at,
             updated_at = EXCLUDED.updated_at,
             released_at = EXCLUDED.released_at
       RETURNING id`,
      [
        requestNumber, title, description, justification, repository, branch, priority, status,
        accounts.get('developer'), timestamp, isReleased ? timestamp : null,
      ],
    );
    const requestId = result.rows[0].id;
    requestIds.push(requestId);

    const rejectedAt = status === 'rejected' ? 2 : null;
    const activeStage = {
      pending_lead_review: 1,
      pending_qa: 2,
      pending_security: 3,
      pending_release: 4,
    }[status];
    for (const stage of stages) {
      let approvalStatus = 'pending';
      if (isReleased || (activeStage && stage.level < activeStage) || (rejectedAt && stage.level < rejectedAt)) {
        approvalStatus = 'approved';
      } else if (rejectedAt === stage.level) {
        approvalStatus = 'rejected';
      }
      const approverId = approvalStatus === 'pending'
        ? null
        : accounts.get(reviewerRoles.get(stage.level)) ?? accounts.get('admin');
      const approvedAt = approvalStatus === 'pending'
        ? null
        : new Date(timestamp.getTime() + stage.level * 2 * 60 * 60 * 1000);
      const comments = approvalStatus === 'approved'
        ? `Seed approval for ${stages[stage.level - 1].role} review.`
        : approvalStatus === 'rejected'
          ? 'Seed example: clarify the recovery behavior before resubmitting.'
          : null;
      await client.query(
        `INSERT INTO change_request_approvals
          (change_request_id, approval_level, approver_id, status, comments, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (change_request_id, approval_level) DO UPDATE
           SET approver_id = EXCLUDED.approver_id,
               status = EXCLUDED.status,
               comments = EXCLUDED.comments,
               approved_at = EXCLUDED.approved_at`,
        [requestId, stage.level, approverId, approvalStatus, comments, approvedAt],
      );
    }
  }

  const notificationSeeds = [
    ['admin', 'Seed data ready', 'Ten sample change requests are available in the workspace.', 'info', false],
    ['admin', 'Release sign-off needed', 'CR-SEED-007 is waiting for release sign-off.', 'review', false],
    ['lead', 'Lead review needed', 'CR-SEED-001 is waiting for lead code review.', 'review', false],
    ['lead', 'QA review completed', 'CR-SEED-003 is ready for the next workflow step.', 'info', true],
    ['developer', 'Request released', 'CR-SEED-008 has completed approval and is released.', 'approved', false],
    ['developer', 'Request needs changes', 'CR-SEED-010 was rejected during review. See reviewer comments.', 'rejected', false],
  ];
  for (const [role, title, message, type, read] of notificationSeeds) {
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, "read")
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (
         SELECT 1 FROM notifications WHERE user_id = $1 AND title = $2 AND message = $3
       )`,
      [accounts.get(role), title, message, type, read],
    );
  }

  const auditSeeds = [
    ['admin', 'workspace', null, 'seeded', { seed_key: 'workspace', message: 'Sample workspace data initialized.' }],
    ['developer', 'change_request', requestIds[0], 'created', { seed_key: 'request-001', request_number: 'CR-SEED-001' }],
    ['lead', 'change_request', requestIds[7], 'approved', { seed_key: 'request-008-lead', request_number: 'CR-SEED-008', stage: 'Lead Code Review' }],
    ['developer', 'change_request', requestIds[7], 'released', { seed_key: 'request-008-release', request_number: 'CR-SEED-008' }],
    ['admin', 'change_request', requestIds[9], 'rejected', { seed_key: 'request-010-rejection', request_number: 'CR-SEED-010', stage: 'QA & Responsive Test' }],
  ];
  for (const [role, entityType, entityId, action, details] of auditSeeds) {
    await client.query(
      `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, details)
       SELECT $1, $2, $3, $4, $5::jsonb
       WHERE NOT EXISTS (
         SELECT 1 FROM audit_logs WHERE details->>'seed_key' = $6
       )`,
      [accounts.get(role), entityType, entityId, action, JSON.stringify(details), details.seed_key],
    );
  }

  await client.query('COMMIT');
  console.log(`Seeded ${users.length} users, ${requestSeeds.length} change requests, approvals, notifications, and audit logs.`);
  for (const user of users) console.log(`Seeded ${user.role} account: ${user.email.trim().toLowerCase()}`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
