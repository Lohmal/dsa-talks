# DSATalks – production image. Secrets (DATABASE_URL, AUTH_SECRET, SMTP_*) are not built in;
# docker-compose passes .env when the container starts.
FROM node:24-alpine

# Prisma's database engine needs OpenSSL on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app

# Dependencies first, so they are only reinstalled when package*.json or the schema change.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# The site's public address is built into the pages (sitemap, link previews);
# docker-compose passes it from NEXT_PUBLIC_SITE_URL in .env.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
