# ChangeDesk Admin Portal

ChangeDesk is an Astro server-rendered admin portal for Development Change Requests. It uses PostgreSQL, local bcrypt authentication, revocable sessions, and a four-stage approval workflow. Portal UI components and styles are shared from `packages/ui`.

## Local setup

### 1. Configure environment

From the repository root, copy the local-development defaults:

```powershell
Copy-Item .env.example .env
```

Update the passwords in `.env` before using anything other than a disposable local database. The host `DATABASE_URL` uses `localhost`; Compose uses `ADMIN_PORTAL_DATABASE_URL` to connect to the `postgres` service.

### 2. Start PostgreSQL

Start only PostgreSQL when running the commands below on your host:

```powershell
docker compose up -d postgres
```

The Compose service publishes port `5432` by default. Set `POSTGRES_PORT` in `.env` if that port is already in use.

### 3. Install, migrate, seed, and run

Run these commands from the repository root:

```powershell
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm dev` runs the monorepo development servers. The admin portal is at `http://localhost:4323`.

Alternatively, `docker compose up` starts PostgreSQL and the development container, then automatically runs dependency installation, `pnpm db:migrate`, `pnpm db:seed`, and the development servers.

The admin portal uses polling for source-file watching because Docker Desktop bind mounts on Windows do not always forward file-system events to Vite. Saved portal and shared UI changes are picked up by the running dev server. If you have an older container that started before this watcher configuration, restart it once with `docker compose restart dev`.

## Seed data

Seeding is repeatable: it upserts the three demo users and ten `CR-SEED-*` requests, updates their four-stage sample approvals, and avoids duplicating seeded notifications and audit events. The three seed logins use `ADMIN_EMAIL` / `ADMIN_PASSWORD`, `SEED_LEAD_EMAIL` / `SEED_LEAD_PASSWORD`, and `SEED_DEVELOPER_EMAIL` / `SEED_DEVELOPER_PASSWORD` from `.env`. The example defaults are for local development only.

The requests cover all four pending review stages, released changes, and a rejected request. Each sample has an approval record for Lead Code Review, QA & Responsive Test, Security & API Audit, and Release Sign-off.

## Content approvals

Content approvals use the WordPress staging API at `WORDPRESS_API_URL` (defaults to `http://localhost:8050` on the host). Configure `WORDPRESS_API_USERNAME` and `WORDPRESS_API_APPLICATION_PASSWORD` in `.env`; do not commit real credentials. Docker Compose uses `WORDPRESS_API_URL_DOCKER` (defaults to `http://host.docker.internal:8050`) because `localhost` inside the container does not point to the host machine.

The `content_author` portal role can submit an existing WordPress post ID with its proposed title and content. The `content_reviewer` role sees the `/staging/pending` queue and can compare the staged version with the current WordPress post, then approve, reject, or request changes. Review actions are sent to `/staging/{post_id}/decision`; the backend owns staging and publication. Existing portal administrators do not automatically receive content review permissions. The configured WordPress Application Password account must be allowed by the backend's `can_edit_post` and `can_approve` permission callbacks.

Create content workflow accounts with:

```powershell
pnpm --filter admin-portal db:user -- author@example.com "Content Author" content_author "use-a-unique-password-of-at-least-12-characters"
pnpm --filter admin-portal db:user -- reviewer@example.com "Content Reviewer" content_reviewer "use-a-unique-password-of-at-least-12-characters"
```

Apply database migrations after pulling the workflow roles:

```powershell
pnpm db:migrate
```

## Creating reviewer accounts

The seed data includes an administrator, lead reviewer, and developer. To create additional stage reviewers, use:

```powershell
pnpm --filter admin-portal db:user -- qa@example.com "QA Reviewer" qa "use-a-unique-password-of-at-least-12-characters"
```

Supported roles are `admin`, `lead`, `developer`, `qa`, `security`, and `release`.

## Database and authentication

Versioned PostgreSQL migrations are in `database/migrations`; `pnpm db:migrate` records applied filenames in `schema_migrations` and safely skips migrations already applied. Seed data is implemented in `scripts/seed.mjs`.

Local sessions use random tokens stored as SHA-256 hashes, `HttpOnly`/`SameSite=Lax` cookies, and a seven-day expiry. Passwords use bcrypt. Astro's same-origin form protection remains enabled. When deploying behind a reverse proxy, set `ADMIN_PORTAL_HOST` to the public hostname (without scheme or port).
