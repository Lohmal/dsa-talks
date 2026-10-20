# syntax=docker/dockerfile:1
# Production image for the DSATalks website (Next.js standalone output).
# Secrets (DATABASE_URL, AUTH_SECRET, SMTP_*) are not baked in; docker-compose passes .env at runtime.

FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma's query engine needs OpenSSL on Alpine.
RUN apk add --no-cache openssl

# 1. Install dependencies (cached as long as package*.json and the Prisma schema do not change)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# 2. Build the site
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# 3. Minimal runtime: only the standalone server, static assets and public files
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "server.js"]
