# Tidlogg

Tidlogg is a production-ready SaaS time tracking app for freelancers and small teams, built with Next.js App Router, TypeScript, Tailwind, Prisma, PostgreSQL, NextAuth credentials auth, and Zod validation.

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
- PostgreSQL
- Prisma ORM
- NextAuth (Credentials)
- Zod

---

## Quick start (works on macOS/Linux/Windows)

### 1) Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+

### 2) Install

```bash
npm install
```

> `postinstall` attempts `prisma generate` automatically. If your environment blocks Prisma downloads, run `npx prisma generate` later on a network that allows access to `binaries.prisma.sh`.

### 3) Configure env

```bash
cp .env.example .env
```

Update `.env` values for your local PostgreSQL.

### 4) Create schema

```bash
npx prisma migrate dev --name init
```

### 5) Seed demo data (optional but recommended)

```bash
npx prisma db seed
```

### 6) Start app

```bash
npm run dev
```

Open `http://localhost:3000`.

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

Set the following environment variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Build command: `npm run build`  
Start command: `npm run start`
