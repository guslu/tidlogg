# Tidlogg

Tidlogg is a production-ready SaaS time tracking app for freelancers and small teams, built with Next.js App Router, TypeScript, Tailwind, Prisma, NextAuth credentials auth, and Zod validation.

**Local development** uses **SQLite** (no database server required). **Production** can use PostgreSQL (see `.env.example` and "Deploying" below).

## Features

- Secure registration/login with bcrypt password hashing
- Workspace-based multi-tenancy with role-aware access (`ADMIN`, `MEMBER`)
- One-click timer with server-side duration calculation and single-running-timer enforcement
- Projects, clients, tags, manual entries, and reporting with CSV export
- Seeded demo account for fast local verification

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM (SQLite for local dev; PostgreSQL for production)
- NextAuth (Credentials)
- Zod

---

## Quick start (works on macOS/Linux/Windows)

### 1) Prerequisites

- Node.js 20+
- npm 10+

No database server is required for local dev; the default setup uses a SQLite file (`prisma/dev.db`).

### 2) Install

```bash
npm install
```

> `postinstall` attempts `prisma generate` automatically. If your environment blocks Prisma downloads, run `npx prisma generate` later on a network that allows access to `binaries.prisma.sh`.

### 3) Configure env

```bash
cp .env.example .env
```

The default `.env.example` uses SQLite (`DATABASE_URL="file:./dev.db"`). Ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set. For PostgreSQL instead, set `DATABASE_URL` to your Postgres connection string and switch the Prisma schema `datasource` provider to `postgresql` (see `prisma/schema.prisma`).

### 4) Create database and schema

For **SQLite** (default local dev):

```bash
npx prisma db push
```

For **PostgreSQL**, use migrations instead:

```bash
npx prisma migrate dev --name init
```

### 5) Seed demo data (optional but recommended)

```bash
npx prisma db seed
```

Environment variables are loaded from `.env` (Next.js loads it automatically; Prisma CLI loads it via `dotenv` in `prisma.config.ts`).

### 6) Start app

```bash
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:3000` or `http://localhost:3001` if 3000 is in use).

Demo credentials after seeding:

- Email: `demo@tidlogg.se`
- Password: `password123`

---

## Build & production check

```bash
npm run build
npm run start
```

`npm run build` runs `prisma generate` first, so missing Prisma client issues are surfaced early.

---

## Troubleshooting

### `@prisma/client did not initialize yet`

Run:

```bash
npx prisma generate
```

Then retry build/dev.

If generation fails with `binaries.prisma.sh` errors, your network/proxy/firewall is blocking Prisma engine downloads.

### Prisma schema validation: "missing an opposite relation field on the model Workspace"

The `Workspace` model must include `activeWorkspaces UserActiveWorkspace[]` so that `UserActiveWorkspace.workspace` has a valid back-relation. Do not remove this field when editing the schema. See `AGENTS.md` for details.

### Next.js warning about wrong workspace root / multiple lockfiles

Tidlogg now sets `outputFileTracingRoot` in `next.config.ts` to reduce incorrect root inference when your home directory has another lockfile.

### Lint deprecation message (`next lint`)

This is a Next.js upstream deprecation notice and does not indicate a project error.

---

## Security notes

- Passwords are hashed with bcrypt
- Zod validation is used on API input boundaries
- Workspace membership checks are enforced server-side
- Timer duration and timer state transitions are server-authoritative

## Deploying to Vercel

Use **PostgreSQL** in production. In `prisma/schema.prisma`, set the datasource to `provider = "postgresql"` and ensure migrations have been run. Set the following environment variables:

- `DATABASE_URL` (PostgreSQL connection string)
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Build command: `npm run build`  
Start command: `npm run start`
