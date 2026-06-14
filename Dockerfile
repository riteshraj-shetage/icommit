FROM oven/bun:1.3-slim AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

FROM oven/bun:1.3-slim AS runner
WORKDIR /app

COPY --from=builder /app /app

ENTRYPOINT ["sh", "-c", "bun run /app/scripts/engine.ts && cd /app/frontend && bun install && bun run build"]