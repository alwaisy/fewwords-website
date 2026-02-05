# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

fewwords is an AI-powered content summarization service. Users paste a URL (article, YouTube, Reddit) and get a concise, actionable summary. The system intelligently classifies content and applies the optimal summarization strategy.

## Tech Stack

- **Framework**: Nuxt 4 (Vue.js)
- **Package Manager**: Bun (not npm/yarn/pnpm)
- **Database**: PostgreSQL with Drizzle ORM
- **LLM**: Vercel AI SDK with multi-provider support (OpenRouter, OpenAI, Anthropic)
- **UI**: Shadcn Vue (New York style, Reka UI primitives)
- **Styling**: Tailwind CSS v4
- **Content Extraction**: Jina AI Reader API

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
bun run db:studio        # Open Drizzle Studio
bun run db:start:pg      # Start local PostgreSQL via Docker
bun run db:stop:pg       # Stop PostgreSQL

# Add new Shadcn component
bun run shadcn <component-name>
```

## Core Architecture

### Request Flow: URL → Summary

1. **User submits URL** → `POST /api/summarize`
2. **Detect content type** (article/youtube/reddit)
3. **Fetch content** via Jina AI Reader API
4. **Classify article** → selects v1/v2/v3 strategy
5. **Summarize** with classified prompt
6. **Store** in PostgreSQL database

### LLM Integration (`server/services/shared/llm.ts`)

Multi-provider support via Vercel AI SDK:
- **OpenRouter**: Default, supports multiple models
- **OpenAI**: Direct API access
- **Anthropic**: Direct API access

Key function: `callLLM({ provider, model, prompt, content, temperature, maxTokens })`

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

### Database (`server/db/index.ts`, `db/schema.ts`)

Singleton pattern for database connection. Use via `useDb(event)` in API routes.

**Summaries table** includes:
- `summaryId`: Public ID (few-XYZ format)
- `source`: Original URL
- `essence`: article/youtube/reddit
- `promptId`: Which prompt version was used
- `reasoning`: Classifier's explanation (articles only)
- `status`: pending/processing/completed/failed
- Token usage, timestamps, error messages

### Service Layer Structure

```
server/services/
├── article/
│   ├── classifier.ts    # Content classification (v1/v2/v3)
│   ├── fetcher.ts       # Jina AI content extraction
│   ├── index.ts         # Summarization orchestrator
│   └── config.ts        # Model config
├── youtube/
│   ├── index.ts         # YouTube summarization orchestrator
│   └── config.ts        # Model config
├── reddit/
│   ├── index.ts         # Reddit summarization
│   └── config.ts        # Model config
└── shared/
    ├── llm.ts          # Vercel AI SDK wrapper
    └── types.ts        # LLM model types
```

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

### Content Fetching (`server/services/article/fetcher.ts`)

Uses Jina AI Reader API to extract article content as markdown.
- Detects Cloudflare protection pages
- Validates minimum content length
- Returns `{ content, title }`

### Pending Summary Flow

For long-running summaries:
1. Create pending summary record immediately
2. Return `summaryId` to user
3. Process in background
4. Frontend polls for status updates
5. User sees real-time progress

See `app/pages/app/composables/use-summary-processing.ts` for polling logic.

### API Routes

- `POST /api/summarize` - Create summary (or update pending)
- `GET /api/summary/:summaryId` - Fetch summary by ID
- `POST /api/summarize/create-pending` - Create pending record for background processing

## Design System

- Colors: Pink/purple theme with dark mode
- Fonts: Poppins (sans), Playfair Display (serif), Space Mono (mono)
- Shadcn components in `app/components/ui/`
- Custom scrollbar styling
- CSS variables in `app/css/global.css`

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection
- `NUXT_SESSION_PASSWORD` - Session secret (min 32 chars)
- `JINA_AI_API_KEY` - Content extraction
- `OPENROUTER_API_KEY` - Default LLM provider
- `OPENAI_API_KEY` - Optional, for OpenAI provider
- `ANTHROPIC_API_KEY` - Optional, for Anthropic provider

## Path Aliases

- `~~/` resolves to project root
- `@/` and `~/` resolve to `app/` (Nuxt default)
- Use `~~/db/schema` to import database types

## Development Notes

- `dev-docs/` is excluded from linting (see package.json lint script)
- All imports use type imports where applicable: `import type { ... }`
- Shadcn components use no prefix, live in `app/components/ui/`
- Summary IDs are public (few-XYZ), internal IDs are UUIDs
