FROM oven/bun:1.3
WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/server ./apps/server
COPY apps/web/package.json ./apps/web/package.json

RUN bun install --frozen-lockfile
WORKDIR /app/apps/server
RUN bunx prisma generate

EXPOSE 4000
CMD ["bun", "src/index.ts"]
