FROM oven/bun:1.3
WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/web ./apps/web
COPY apps/server/package.json ./apps/server/package.json

RUN bun install --frozen-lockfile

WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
