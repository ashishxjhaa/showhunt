# showhunt

Showcase, discover, and upvote indie products. Turborepo monorepo.

## Structure

- `apps/web`: Next.js frontend (app router, Tailwind, shadcn/ui)
- `apps/server`: Bun + Express API (`/api/v1/*`), Prisma 7 + PostgreSQL (Neon)
- `apps/voice`: Pipecat voice agent (Sarvam STT/TTS + DeepSeek) on WebRTC

## Getting started

```bash
bun install

# Python voice worker (once)
cd apps/voice && uv sync && cd ../..

# dev (web + server via turbo)
bun run dev

# voice agent in a separate terminal
bun run voice:dev
```

Or individually:

```bash
bun run web:dev     # http://localhost:3000
bun run server:dev  # http://localhost:4000
bun run voice:dev   # http://localhost:7860
```

Environment: copy `.env.example` entries into `apps/web/.env`, `apps/server/.env`, and `apps/voice/.env`.

Required for voice:

- `SARVAM_API_KEY`
- `DEEPSEEK_API_KEY`
- `NEXT_PUBLIC_VOICE_URL=http://localhost:7860` (in `apps/web/.env`)

Database:

```bash
bun run db:migrate
```

## Voice agent

Cody the pet sits bottom-right. Press **F2** to start a conversation (mic + notify sound). Talk freely after that; VAD handles turns. Press **Escape** to hang up.

The agent can navigate, smooth-scroll sections, search listings, open builders, fill auth/listing/profile forms, and answer ShowHunt FAQ. It only uses allowlisted tools (no arbitrary DOM clicks).

## Docker

```bash
docker compose up --build
```

Web: http://localhost:3000 · API: http://localhost:4000 · Voice: http://localhost:7860
