FROM oven/bun:latest AS builder

WORKDIR /app

COPY bun.lock package.json ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:distroless AS runner

WORKDIR /app

COPY --from=builder /app/app .
COPY --from=builder /app/.env.example ./.env

EXPOSE 3000

CMD [ "./app" ]
