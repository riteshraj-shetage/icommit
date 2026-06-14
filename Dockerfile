FROM oven/bun:1.1-slim

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

ENTRYPOINT ["sh", "-c", "bun run /app/scripts/engine.ts && cd /app/frontend && bun install && bun run build"]