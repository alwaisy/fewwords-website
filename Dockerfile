# Use Node 22 Alpine as the base
FROM node:22-alpine
WORKDIR /app

# Install Bun
RUN npm install -g bun@1.2.4

# Copy project files
COPY . .

# Build-time environment variables
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

# Set Nitro preset to bun and install with your original command
ENV NITRO_PRESET=bun
ENV NODE_ENV=production
RUN bun install --frozen-lockfile
RUN bun run build

# Expose port and run with bun
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
