# Stage 1: Base image
FROM oven/bun:1.2.4-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS install
COPY package.json bun.lockb ./
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
RUN bun run build

# Stage 4: Production image
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy build output and migration essentials
COPY --from=build /app/.output .output
COPY --from=build /app/db db
COPY --from=build /app/drizzle.config.ts .
COPY --from=build /app/package.json .
COPY --from=build /app/bun.lockb .

# Install production dependencies + drizzle-kit for migrations
RUN bun install --frozen-lockfile --production && \
    bun add drizzle-kit

EXPOSE 3000

# Default to web server
CMD ["bun", "run", ".output/server/index.mjs"]
