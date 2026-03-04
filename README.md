# Fewwords

AI-powered content summarization service. Users paste URLs (articles, YouTube, Reddit) and get concise, actionable summaries using intelligent content classification and optimal summarization strategies.

## Features

- **Multi-Platform Summaries** - Articles, YouTube videos, and Reddit threads
- **Intelligent Classification** - Automatically detects content type and selects optimal summarization strategy
- **3-Stage YouTube Pipeline** - Metadata fetch → AI classification → Full summarization with real-time progress
- **Magic Link Auth** - Passwordless authentication with 7-day rolling sessions
- **Shareable Links** - Public summaries accessible via `few-XYZ` IDs
- **Background Processing** - Long-running summaries processed via BullMQ workers
- **Admin Panel** - User and summary management

## Tech Stack

- **Framework:** Nuxt 4 + Vue 3
- **Package Manager:** Bun
- **Database:** PostgreSQL with Drizzle ORM (Docker on port 5433)
- **LLM:** OpenRouter, OpenAI, Anthropic (official SDKs)
- **Background Jobs:** BullMQ with nuxt-processor
- **Real-time Updates:** Upstash Redis + Server-Sent Events
- **UI:** shadcn-vue (New York style) + Reka UI + Tailwind CSS v4
- **Auth:** nuxt-auth-utils (session-based, magic links)
- **Email:** Resend
- **Content Extraction:** Jina AI Reader API

## Quick Start

```bash
# Install dependencies
bun install

# Start local PostgreSQL + Redis
bun run db:start:pg

# Run database migrations
bun run db:push

# Seed database
bun run db:seed

# Start development server (with worker)
bun run dev:full
```

Visit `http://localhost:3000`

## Development Commands

```bash
# Development
bun run dev              # Web server only
bun run dev:full         # Web server + background worker
bun run build            # Production build
bun run preview          # Preview production build

# Code quality
bun run check            # Lint + type check
bun run lint             # ESLint only
bun run lint:fix         # Auto-fix lint issues

# Database
bun run db:push          # Push schema changes
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
bun run db:reset         # Reset database (down -v + up)
bun run db:seed          # Seed database
bun run db:seed:admin    # Seed admin user

# Components
bun run shadcn <name>    # Add shadcn component
```

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://fewwords:password@localhost:5433/fewwords

# Session (min 32 chars)
NUXT_SESSION_PASSWORD=your-secure-session-password

# API Keys
JINA_AI_API_KEY=xxx           # Content extraction
OPENROUTER_API_KEY=xxx        # Default LLM provider
OPENAI_API_KEY=xxx            # Article classification
ANTHROPIC_API_KEY=xxx         # Optional
YOUTUBE_DATA_API_KEY=xxx      # Video metadata
REDIS_URL=redis://localhost:6380

# Email
RESEND_API_KEY=xxx
RESEND_FROM_EMAIL=magiclink@m.fewwords.app

# Admin
ADMIN_EMAIL=your@email.com
```

## Project Structure

```
├── app/                          # Nuxt app directory
│   ├── components/
│   │   ├── home/                 # Landing page sections
│   │   ├── layout/               # Header, footer
│   │   ├── app/                  # App-specific components
│   │   └── ui/                   # Shadcn components (no prefix)
│   ├── composables/              # Auto-imported composables
│   ├── layouts/                  # Nuxt layouts
│   └── pages/                    # File-based routing
│       ├── index.vue             # Landing page
│       ├── auth/                 # Auth pages
│       └── app/                  # Main app pages
├── server/
│   ├── api/                      # API routes
│   ├── services/
│   │   ├── article/              # Article summarization
│   │   ├── youtube/              # YouTube 3-stage pipeline
│   │   ├── reddit/               # Reddit summarization
│   │   └── shared/llm/           # LLM provider SDKs
│   ├── prompts/
│   │   ├── article/              # v1, v2, v3 strategies
│   │   └── youtube/              # Type-specific prompts
│   ├── queues/                   # BullMQ queue definitions
│   ├── workers/                  # Background job processors
│   └── lib/                      # Shared utilities (Redis, etc.)
├── db/                           # Drizzle schema & migrations
├── layers/admin/                 # Admin panel layer
└── database/                     # Docker Compose for local services
```

## Architecture Overview

### Request Flow: URL → Summary

1. User submits URL → `POST /api/summarize`
2. Detect content type (article/youtube/reddit)
3. Fetch content via Jina AI / YouTube Data API
4. Classify content → select optimal summarization strategy
5. Summarize with type-specific prompt
6. Store in PostgreSQL

### Article Classification

The AI classifier analyzes content and selects the best strategy:

- **v1 (V1_STRUCTURED):** Essays, research, analysis
- **v2 (V2_DATA_SHOT):** Tutorials, specs, how-tos
- **v3 (V3_DECISION_BRIEF):** News, time-sensitive content

### YouTube 3-Stage Pipeline

1. **Metadata** - Fetch video/channel data from YouTube Data API
2. **Classifying** - AI analyzes thumbnail + metadata, determines category & worth watching
3. **Summarizing** - Full video analysis with type-specific prompt

Real-time progress via SSE (Redis-polling every 500ms).

### Background Jobs

Long-running summaries (YouTube) use BullMQ workers:
- `fewwords-web` - Nuxt web server (port 3000)
- `fewwords-worker` - BullMQ worker processes

Managed via PM2 with `ecosystem.config.js`.

## Deployment

### GitHub Actions CI/CD

Push to `master` branch triggers automatic deployment:
- Builds on GitHub's servers
- Transfers to your VPS
- Runs migrations
- Restarts PM2 processes

### Manual Deployment

```bash
# Build
bun run build

# Run migrations
bun run db:push

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### Caddy Configuration

```caddy
fewwords.app www.fewwords.app {
    reverse_proxy localhost:3000
}
```

Caddy handles SSL automatically. No worker config needed - it runs as a background process.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Sign in with magic link |
| `/auth/register` | Create account |
| `/app` | URL input page |
| `/app/library` | User's saved summaries |
| `/admin/index` | Admin dashboard |

## Development Notes

- **Auto-imports:** Components, composables, utilities are auto-imported
- **Path aliases:** `@/` and `~/` → `app/`, `~~/` → project root
- **Database access:** Use `useDb(event)` in API routes (singleton pattern)
- **Summary IDs:** Public IDs use `few-XYZ` format (nanoid 3 chars)
- **PostgreSQL port:** 5433 (Docker, avoids system PG on 5432)
- **Package manager:** Uses Bun, not npm/yarn/pnpm

## License

MIT
