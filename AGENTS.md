# AI agent notes (Tidlogg)

This file helps AI agents (Cursor, Codex, etc.) understand how the project is set up and what has been changed so edits stay consistent.

## Database & Prisma

- **Local development** uses **SQLite** by default. The schema is in `prisma/schema.prisma` with `provider = "sqlite"` and `DATABASE_URL="file:./dev.db"` in `.env`. The database file lives at `prisma/dev.db` (path is relative to the schema directory). No database server is required.
- **Production** is intended to use **PostgreSQL**. To switch back, set `provider = "postgresql"` in the schema and use a Postgres `DATABASE_URL`; use `prisma migrate dev` instead of `prisma db push` for migrations.
- **Schema relation**: The `Workspace` model **must** include the back-relation to `UserActiveWorkspace`: `activeWorkspaces UserActiveWorkspace[]`. Without it, Prisma validation fails (missing opposite relation on `Workspace` for `UserActiveWorkspace.workspace`).
- **Decimal**: For SQLite compatibility, `Project.billableRate` uses `Decimal?` without `@db.Decimal(10, 2)`. If you switch to PostgreSQL only, you can add `@db.Decimal(10, 2)` back.
- **Env loading**: Next.js loads `.env` from the project root at runtime. The Prisma CLI loads `.env` via `import "dotenv/config"` at the top of `prisma.config.ts`, so commands like `npx prisma db push` and `npx prisma db seed` work without setting `DATABASE_URL` in the shell.
- **Creating/syncing DB**: For SQLite use `npx prisma db push`. For PostgreSQL use `npx prisma migrate dev`.
- **Demo data**: Run `npx prisma db seed` (or `npx tsx prisma/seed.ts`) to create the demo user `demo@tidlogg.se` / `password123`.

## App behavior

- Home `/` redirects to `/dashboard`. Dashboard requires auth and redirects to `/auth/login` if there is no session.
- Workspace context is resolved in `lib/auth/workspace.ts`; if the user has no workspace, a default "My Workspace" is created and set as active.
- Protected routes are listed in `middleware.ts` (next-auth matcher).

## Files to be aware of

- `prisma/schema.prisma` – datasource provider (sqlite vs postgresql), `Workspace.activeWorkspaces` relation, and no `@db.Decimal` on SQLite.
- `prisma.config.ts` – loads `dotenv/config` so Prisma CLI sees `.env`.
- `.env` – not committed; copy from `.env.example`. Default local: `DATABASE_URL="file:./dev.db"`, plus `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
- `.gitignore` – includes `prisma/dev.db` and `prisma/*.db` so the SQLite DB is not committed.

When suggesting schema changes, new env vars, or DB commands, keep the above in mind so local dev (SQLite) and production (PostgreSQL) paths stay valid.
