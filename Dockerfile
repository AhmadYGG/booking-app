FROM oven/bun:latest AS builder

WORKDIR /app

COPY bun.lock package.json ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

EXPOSE 3000 

CMD [ "./app" ]

# FROM debian:bookworm-slim AS runner
#
# WORKDIR /app
#
# COPY --from=builder /app .
#
# EXPOSE 3000
#
# CMD [ "./app" ]
