# Tidlogg

Tidlogg is a production-ready SaaS time tracking app for freelancers and small teams, built with Next.js App Router, TypeScript, Tailwind, Prisma, PostgreSQL, NextAuth credentials auth, and Zod validation.

## Features

- Secure registration/login with hashed passwords (bcrypt)
- Multi-workspace model with strict data isolation
- One-click start/stop timer with server-side business rules
- Manual entries, projects, clients, tags
- Role model: `ADMIN`, `MEMBER`
- Dashboard with active timer and today's entries
- Reporting summary and CSV export
- Seed script with demo data

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth (Credentials provider)
- Zod

## Setup

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env
```

3. Run migrations

```bash
npx prisma migrate dev --name init
```

4. Seed demo data (optional)

```bash
npx prisma db seed
```

5. Start development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

Demo user from seed:

- email: `demo@tidlogg.se`
- password: `password123`

## Deploying to Vercel

- Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in project environment variables.
- Build command: `npm run build`
- Start command: `npm run start`
