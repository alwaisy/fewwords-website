# Use Node 22 Alpine for stable build tools and native module support
FROM node:22-alpine AS base

# Install Bun globally
RUN npm install -g bun@1.2.4

WORKDIR /app

# Stage 2: Install dependencies
FROM base AS install
# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 3: Build the application
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY . .

# Set environment variables for build
ARG NUXT_SITE_URL
ARG DATABASE_URL
ARG NUXT_SESSION_PASSWORD
ARG JINA_AI_API_KEY
ARG OPENROUTER_API_KEY
ARG OPENAI_API_KEY
ARG ANTHROPIC_API_KEY
ARG YOUTUBE_DATA_API_KEY
ARG REDIS_URL
ARG RESEND_API_KEY
ARG RESEND_FROM_EMAIL
ARG RESEND_FROM_NAME
ARG ADMIN_EMAIL

ENV NODE_ENV=production
# Set Nitro preset to bun to optimize for Bun runtime
ENV NITRO_PRESET=bun
RUN bun run build

# Stage 4: Production image
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy build output and essential files
COPY --from=build /app/.output .output
COPY --from=build /app/db db
COPY --from=build /app/drizzle.config.ts .
COPY --from=build /app/package.json .
COPY --from=build /app/bun.lock .

# Ensure static assets are in the path Bun Nitro preset expects (fixes ENOENT)
RUN mkdir -p .output/server/public && \
    cp -r .output/public/* .output/server/public/ 2>/dev/null || true

# Install production dependencies + drizzle-kit
RUN apk add --no-cache python3 make g++ && \
    bun install --frozen-lockfile --production && \
    bun add drizzle-kit && \
    apk del python3 make g++

EXPOSE 3000

# Run with Bun as requested
CMD ["bun", "run", ".output/server/index.mjs"]
