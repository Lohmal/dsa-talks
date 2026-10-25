# DSATalks – production image. Secrets (DATABASE_URL, AUTH_SECRET, SMTP_*) are not built in;
# docker-compose passes .env when the container starts.
FROM node:24-alpine

# Prisma's database engine needs OpenSSL on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app

# Dependencies first, so they are only reinstalled when package*.json or the schema change.
# No security audit or funding requests during the install: they only add network round trips.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# The site's public address is built into the pages (sitemap, link previews);
# docker-compose passes it from NEXT_PUBLIC_SITE_URL in .env.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080
# Create the database indexes (unique e-mail per scope, certificate numbers…) if they are
# missing, e.g. on a new empty database, then start the site. If the database cannot be
# reached the site still starts; the indexes are created on the next start.
CMD ["sh", "-c", "npx prisma db push --skip-generate || echo 'Database not reachable; indexes not checked.'; exec npm start"]
