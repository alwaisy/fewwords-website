# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

fewwords is an AI-powered content summarization service. Users paste a URL (article, YouTube, Reddit) and get a concise, actionable summary. The system intelligently classifies content and applies the optimal summarization strategy.

## Tech Stack

- **Framework**: Nuxt 4 (Vue.js)
- **Package Manager**: Bun (not npm/yarn/pnpm)
- **Database**: PostgreSQL with Drizzle ORM (Docker on port 5433)
- **LLM**: Official SDKs with multi-provider support (OpenRouter, OpenAI, Anthropic)
- **UI**: Shadcn Vue (New York style, Reka UI primitives)
- **Styling**: Tailwind CSS v4
- **Content Extraction**: Jina AI Reader API
- **Real-time Updates**: Upstash Redis + Server-Sent Events (SSE)

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (http://localhost:3000)
bun run dev

# Type check + lint
bun run check

# Lint only
bun run lint

# Fix linting issues
bun run lint:fix

# Database commands
bun run db:push          # Push schema changes to database
bun run db:generate      # Generate migration files
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
bun run db:start:pg      # Start local PostgreSQL via Docker
bun run db:stop:pg       # Stop PostgreSQL
bun run db:reset         # Reset database (down -v + up)
bun run db:seed          # Seed database

# Add new Shadcn component
bun run shadcn <component-name>
```

## Core Architecture

### Request Flow: URL → Summary

1. **User submits URL** → `POST /api/summarize`
2. **Detect content type** (article/youtube/reddit)
3. **Fetch content** via Jina AI Reader API (articles) or YouTube Data API
4. **Classify content** → selects optimal summarization strategy
5. **Summarize** with classified prompt
6. **Store** in PostgreSQL database

### LLM Integration (`server/services/shared/llm/`)

Official SDKs (not Vercel AI SDK):
- **OpenRouter**: Default provider, multi-model support
- **OpenAI**: Direct API access via `@openrouter/sdk`
- **Anthropic**: Direct API access via `@anthropic-ai/sdk`

Each provider exports `call<Provider>()` function with unified interface supporting:
- `reasoning: { effort: "high" | "medium" | "low" }` for reasoning models
- Tool calling (Google Search, URL context for YouTube)
- Streaming support (not yet implemented)

### Article Classification (`server/services/article/classifier.ts`)

The classifier analyzes content and selects optimal summarization strategy:

- **v1 (V1_STRUCTURED)**: Essays, research, analysis - Main Idea, Key Points, Context, Takeaway
- **v2 (V2_DATA_SHOT)**: Specs, tutorials, how-tos - Dynamic headers, facts-focused
- **v3 (V3_DECISION_BRIEF)**: News, time-sensitive - 200-word limit, decision-oriented

Classification uses GPT-5 Mini (reasoning model). Returns `{ category, version, reasoning }`.

### Prompt Versioning (`server/prompts/article/`)

Dynamic version detection - no hardcoded versions:
- Major versions: v1, v2, v3 (strategies)
- Minor versions: v1.1, v1.2, v2.3, v2.4, v3.1, v3.2, v3.3 (improvements)
- `PROMPT_VERSIONS` object auto-detects latest minor version
- Each prompt file exports `ARTICLE_PROMPT` and `PROMPT_META`

When adding new prompt versions:
1. Create new file (e.g., `v1.3.ts`)
2. Add to imports in `index.ts`
3. `getLatestVersions()` automatically detects it

### YouTube 3-Stage Pipeline

YouTube summarization uses a distinct 3-stage pipeline with real-time progress updates:

**Stage 1: Metadata** - Fetch video/channel metadata from YouTube Data API, store in `youtube` table
**Stage 2: Classifying** - LLM analyzes video thumbnail + metadata, determines category (TUTORIAL/REVIEW/NEWS/OPINION/INTERVIEW/EDUCATION/LIGHT), extracts clean title, channel bio, focus points, decides if worth watching
**Stage 3: Summarizing** - Full video analysis with type-specific prompt

**Real-time updates use Upstash Redis + SSE:**
- Backend sets `summary:{summaryId}:stage` key in Redis during each stage
- Frontend connects to `GET /api/summary/:summaryId/stream` (SSE)
- SSE endpoint polls Redis every 500ms, pushes stage updates to client
- See `server/api/summary/[summaryId]/stream.get.ts` and `app/pages/app/composables/use-summary-processing.ts`

**Early exit**: If classifier determines video isn't worth watching, returns immediately with reasoning.

### YouTube Content Types (`server/prompts/youtube/`)

Type-specific prompts for different YouTube content:
- **TUTORIAL**: How-to, walkthroughs, coding, cooking, DIY - Step-by-step format
- **REVIEW**: Product reviews, tech reviews - Verdict, pros/cons, alternatives
- **NEWS**: News updates, current events - Key facts, context, what's next
- **OPINION**: Commentaries, hot takes - Main argument, key points, counterpoints
- **INTERVIEW**: Podcasts, conversations - Guest bio, main topics, best insights
- **EDUCATION**: Lectures, explainers - Core concept, key learnings, prerequisites
- **LIGHT**: Entertainment, casual viewing - Quick summary, entertainment value

Each prompt exports `{ PROMPT, PROMPT_META }` with ID, description, and type.

### Database Schema (`db/schema.ts`)

Two main tables with one-to-one relationship:

**Summaries table** (core):
- `id`: Internal UUID (primary key)
- `summaryId`: Public ID (few-XYZ format, unique)
- `source`: Original URL
- `essence`: article/youtube/reddit
- `title`, `summary`: Generated content
- `promptId`: Which prompt version was used
- `reasoning`: Classifier's explanation
- `status`: pending/processing/completed/failed
- Token usage (promptTokens, completionTokens, totalTokens, reasoningTokens)
- Timestamps, error messages

**YouTube table** (one-to-one via `summaryId`):
- Stage 1: Video metadata (videoId, duration, tags, view/like/comment counts)
- Stage 1: Channel metadata (title, description, subscriber count, keywords)
- Stage 2: Classifier results (cleanTitle, channelBio, category, trueIntent, focusPoints, isWorthIt)
- Stage 2: Classifier stats (model, reasoningEffort, tokens, timing)

**Access pattern**: Use `useDb(event)` in API routes - singleton pattern handles connection pooling.

### Service Layer Structure

```
server/services/
├── article/
│   ├── classifier.ts    # Content classification (v1/v2/v3)
│   ├── fetcher.ts       # Jina AI content extraction
│   ├── index.ts         # Summarization orchestrator
│   └── config.ts        # Model config
├── youtube/
│   ├── index.ts         # YouTube orchestrator (3-stage pipeline)
│   ├── classifier.ts    # Video classification (worth watching?)
│   ├── summarizer.ts    # Video content summarization
│   ├── metadata.ts      # YouTube Data API fetching
│   └── config.ts        # Model config
├── reddit/
│   ├── index.ts         # Reddit summarization
│   └── config.ts        # Model config
└── shared/
    ├── llm/             # Official SDK implementations
    │   ├── index.ts
    │   ├── openrouter.ts
    │   ├── openai.ts
    │   └── anthropic.ts
    └── types.ts         # LLM model types
```

### Content Fetching (`server/services/article/fetcher.ts`)

Uses Jina AI Reader API to extract article content as markdown.
- Detects Cloudflare protection pages
- Validates minimum content length
- Returns `{ content, title }`

### Pending Summary Flow

For long-running summaries (YouTube videos):
1. Create pending summary record immediately via `POST /api/summarize/create-pending`
2. Return `summaryId` to user
3. Process in background via `POST /api/summarize` with `updateSummaryId`
4. Frontend polls for status updates or uses SSE for YouTube
5. User sees real-time progress

See `app/pages/app/composables/use-summary-processing.ts` for polling/SSE logic.

### API Routes

- `POST /api/summarize` - Create summary (or update pending record)
- `POST /api/summarize/create-pending` - Create pending record for background processing
- `GET /api/summary/:summaryId` - Fetch summary by ID
- `GET /api/summary/:summaryId/stream` - SSE endpoint for real-time stage updates (YouTube)
- `GET /api/tab-count` - Get tab counts for UI

## Design System

- Colors: Pink/purple theme with dark mode
- Fonts: Poppins (sans), Playfair Display (serif), Space Mono (mono)
- Shadcn components in `app/components/ui/` (no prefix)
- Custom scrollbar styling
- CSS variables in `app/css/global.css`
- Toast: nuxt-toastify (colored theme, top-center, 4s auto-close, slide transition)

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection
- `NUXT_SESSION_PASSWORD` - Session secret (min 32 chars)
- `JINA_AI_API_KEY` - Content extraction
- `OPENROUTER_API_KEY` - Default LLM provider
- `OPENAI_API_KEY` - OpenAI provider (required for article classification)
- `ANTHROPIC_API_KEY` - Anthropic provider (optional)
- `YOUTUBE_DATA_API_KEY` - YouTube metadata fetching
- `UPSTASH_REDIS_REST_URL` - Redis for real-time updates
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication

## Path Aliases

- `~~/` resolves to project root
- `@/` and `~/` resolve to `app/` (Nuxt default)
- Use `~~/db/schema` to import database types

## Development Notes

- `dev-docs/` is excluded from linting (see package.json lint script)
- All imports use type imports where applicable: `import type { ... }`
- Shadcn components use no prefix, live in `app/components/ui/`
- Summary IDs are public (few-XYZ), internal IDs are UUIDs
- PostgreSQL runs on port 5433 via Docker (avoiding conflict with system PG on 5432)
- YouTube Shorts are immediately rejected with message
- Auto-imports: Components, composables, utilities are auto-imported (no manual imports needed)
- Vue 3 Composition API with `<script setup>` syntax
- VeeValidate + Zod for form validation
- TypeScript strict mode enabled

## Authentication & Authorization

### Session Management (nuxt-auth-utils)

- **Session-based auth** with encrypted HttpOnly cookies (NOT token-based auth)
- **No refresh/access tokens** - the session cookie IS the authentication
- **Current config**: `maxAge: 7 days` with `rolling: true` (extends on activity)
- Session data stored in `runtimeConfig.session` in `nuxt.config.ts`
- If `maxAge` is not set, cookies are **session cookies** (expire on browser close)

### Auth Flow

**Magic Link Authentication**:
1. User enters email → `POST /api/auth/login` or `/api/auth/register`
2. Email sent with token (expires in 15 min)
3. User clicks link → `POST /api/auth/verify` → Session created
4. Session persists for 7 days (rolling with activity)

### User Roles & Authorization

**Roles**: `user` (default) | `admin` (for admin panel)

**Admin Middleware** (`app/middleware/admin.ts`):
- Protects all admin routes
- Uses `useUserSession()` composable (NOT `getUserSession(event)` which doesn't auto-import in route middleware)
- Checks `session.user.role === 'admin'`
- Must be referenced in admin pages via `definePageMeta({ middleware: ["admin"] })`

### Logout

- `POST /api/auth/logout` clears session via `clearUserSession()`
- Also explicitly deletes cookies: `nuxt-session` and `nuxt-session.token`
- Composable redirects to `/auth/login` after logout

### Admin Layer

**Purpose**: Separate admin UI from main app
- Located at `layers/admin/`
- Has own `nuxt.config.ts` with `~admin` alias for components
- Extends main app via `nuxt.config.ts` extends: ["./layers/admin"]
- Uses shared auth from main app (middleware lives in `app/middleware/`)
- Admin pages: `/admin/index`, `/admin/summaries`, `/admin/users`

### Admin API Protection

- Server-side routes use `getUserSession(event)` directly
- Example: `server/api/admin/summaries.get.ts`
- Checks `session.user.role === 'admin'` → 403 if not

**Future migration plan**: See `dev-docs/auth-security-plan.md` for Clerk migration strategy (MFA, refresh tokens)
