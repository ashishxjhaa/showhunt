# showhunt

Showcase, discover, and upvote indie products. Turborepo monorepo.

## Structure

- `apps/web`: Next.js frontend (app router, Tailwind, shadcn/ui)
- `apps/server`: Bun + Express API (`/api/v1/*`), Prisma 7 + PostgreSQL (Neon)

## Getting started

```bash
bun install

# dev (runs both apps)
bun run dev

# or individually
bun run web:dev     # http://localhost:3000
bun run server:dev  # http://localhost:4000
```

Environment: copy `.env.example` entries into `apps/web/.env` and `apps/server/.env`.

Database:

```bash
bun run db:migrate
```

## Docker

```bash
docker compose up --build
```

Web: http://localhost:3000 · API: http://localhost:4000
