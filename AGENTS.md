# Tidlogg Engineering Guide for AI Agents

This guide is the source of truth for safely extending Tidlogg. Follow it for every code change.

## 1) Architecture overview

Tidlogg is a Next.js App Router SaaS for multi-tenant time tracking.

- **UI layer**: `app/(app)` pages + reusable `components/*`.
- **API layer**: `app/api/**/route.ts`.
- **Domain services**: `lib/services/*` for business-critical logic (timer, reports, constraints).
- **Auth & tenancy**: `lib/auth/*` with workspace context resolution + membership enforcement.
- **Data layer**: Prisma (`lib/db/prisma.ts`, `prisma/schema.prisma`).

### Design principles

1. Mutations must be enforced on the server.
2. Multi-tenant boundaries are mandatory, never optional.
3. Timer logic must preserve invariants even under retries/races.
4. Query shape should scale to large datasets (thousands+ entries/workspace).
5. Keep route handlers thin; move business rules to `lib/services`/`lib/auth`.

---

## 2) Folder structure

- `app/(app)/*`: authenticated pages (dashboard, entries, projects, reports, settings).
- `app/api/*`: HTTP endpoints.
- `components/*`: UI and client-side interaction components.
- `lib/auth/*`: session, workspace resolution, permission checks.
- `lib/services/*`: domain/business logic.
- `lib/validations/*`: Zod schemas (shared server/client contracts).
- `prisma/schema.prisma`: tenant-aware data model + indexes.

When adding behavior:

- Validation in `lib/validations`.
- Authorization in `lib/auth/permissions.ts`.
- Core invariants in `lib/services`.
- Route only orchestrates request/response.

---

## 3) Domain model and tenant boundaries

Core entities are workspace-scoped: `Client`, `Project`, `Tag`, `TimeEntry`, invites, memberships.

### Required multi-tenant isolation rules

- Every query touching workspace data must include `workspaceId` filter.
- Never trust client-provided identifiers alone (`projectId`, `tagId`, etc.). Validate they belong to active workspace.
- Membership must be checked server-side (`assertWorkspaceMembership` / `ensureWorkspaceAccess`) for all workspace-bound mutations.
- Admin-only behavior must use explicit role checks (do not infer from UI visibility).

---

## 4) Timer invariants (non-negotiable)

Timer and manual entries must preserve:

1. At most one running entry (`endedAt = null`) per `(workspaceId, userId)`.
2. No overlapping intervals for a user inside a workspace.
3. `durationSec = floor(max(0, endedAt - startedAt))` for closed entries.
4. Archived projects cannot receive new time.
5. Project budget (when set) cannot be exceeded by new tracked time.

### Timer mutation safety pattern

- Use a Prisma transaction.
- Validate project/workspace ownership before write.
- For start retries, apply idempotency handling (same project+description started moments ago returns existing running entry).
- Close current timer before starting a new one.
- Re-check overlap constraints in-transaction.

---

## 5) Permissions and enforcement model

Use centralized guards in `lib/auth/permissions.ts`:

- `assertWorkspaceMembership(userId, workspaceId)`
- `assertWorkspaceAdmin(userId, workspaceId)`
- `assertProjectInWorkspace(projectId, workspaceId)`
- `assertTagsInWorkspace(tagIds, workspaceId)`
- `assertClientInWorkspace(clientId, workspaceId)`

Do not duplicate permission logic in route handlers.

---

## 6) Transaction and mutation patterns

All critical writes should follow this order:

1. Parse/validate with Zod.
2. Resolve workspace context from authenticated user.
3. Validate referenced entities are in the same workspace.
4. Execute a single transaction for read-check-write sequences.
5. Return normalized API response / errors.

If an operation can race (timer start/stop, manual entry insert), it must be transactional.

---

## 7) Query patterns and performance constraints

### Query best practices

- Prefer `select` over broad `include` when possible.
- Use `groupBy`/`aggregate` for totals (avoid loading all rows to sum in JS).
- Avoid N+1 by batching related lookups.
- Limit list APIs (`take`, pagination where necessary).

### Current performance-sensitive areas

- Reports (`loadReportSummary`) should aggregate totals with Prisma aggregate APIs.
- Project totals should use grouped duration queries, not per-project entry scans.
- Time-entry indexes are required for common filters and overlap checks.

### Index expectations

Maintain indexes for:

- `(workspaceId, userId, startedAt)`
- `(workspaceId, userId, endedAt, startedAt)`
- `(workspaceId, projectId, startedAt)`
- `(projectId, endedAt)`
- `(workspaceId, endedAt)`

---

## 8) Reporting and export safety

- Report filters are workspace-scoped and role-aware.
- Non-admin users must never export others' data.
- CSV export must neutralize formula injection (`=`, `+`, `-`, `@` prefixes).
- Support grouped summaries (`day`, `week`, `month`) without exploding query volume.

---

## 9) Prisma, migrations, and environments

### Local development

- SQLite default (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`).
- Use `npx prisma migrate dev` for schema evolution.
- `prisma/dev.db` should remain uncommitted.

### Production target

- PostgreSQL.
- Keep schema compatible where possible.

### Migration rules

- Any model/index change must be accompanied by a Prisma migration.
- Do not hand-edit generated migration SQL unless absolutely required and reviewed.
- After schema updates, run generate + type checks.

---

## 10) Coding standards

- TypeScript strictness first; avoid `any`.
- Keep functions focused and composable.
- Use shared helpers instead of duplicated logic.
- Error messages should be user-safe and deterministic.
- Never add try/catch around imports.

---

## 11) UI/UX philosophy

- Consistent loading and error states.
- Useful empty states for first-run experience.
- Avoid full page reloads; prefer `router.refresh()` where appropriate.
- Mobile-first responsive layouts for dense lists/forms.
- Toasts should provide actionable, clear feedback.

---

## 12) Common pitfalls to avoid

- Missing `workspaceId` in where clause.
- Creating time entries against archived projects.
- Allowing overlap between manual and running entries.
- Returning oversized payloads where aggregate is enough.
- Assuming client-side visibility equals permission.

---

## 13) Extension guidelines

When adding new workspace-scoped entity:

1. Add `workspaceId` relation + useful indexes.
2. Add workspace ownership assertion helper.
3. Update API validation schema.
4. Enforce checks in transaction-backed mutations.
5. Add list pagination strategy if large cardinality expected.

When adding new report metric:

1. Keep base filter object tenant-safe.
2. Aggregate in DB first.
3. Add role scoping for member/admin visibility.
4. Ensure export path remains safe.

---

## 14) Deployment and operations notes

- Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set.
- Run migrations during deploy before serving traffic.
- Monitor slow queries around reports and entries listing.
- Back up production DB before destructive migrations.
