# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FewWords is a content summarization service that converts articles (and eventually videos) into concise summaries using AI. The MVP focuses on article-to-summary conversion.

## Tech Stack

- **Framework**: Nuxt 4 (Vue.js)
- **Package Manager**: Bun (not npm/yarn/pnpm)
- **UI Library**: Shadcn Vue (New York style, Reka UI primitives)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Database**: SQLite with better-sqlite3 (currently unused, planned for future)
- **Form Handling**: VeeValidate with Zod schemas
- **Icons**: Lucide Vue Next
- **Charts**: Unovis
- **Fonts**: Nuxt Fonts module

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (http://localhost:3000)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Generate static site
bun run generate

# Type checking
bun run type

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Run both lint and type check
bun run check

# Add new Shadcn component
bun run shadcn <component-name>
```

## Project Structure

```
fewwords-website/
├── app/
│   ├── components/ui/      # Shadcn Vue components (45+ components)
│   ├── lib/
│   │   └── utils.ts        # Utility functions (clsx, tailwind-merge)
│   ├── plugins/
│   │   └── ssr-width.ts    # SSR width plugin for VueUse
│   └── css/
│       └── global.css      # Global styles with design tokens
├── public/                 # Static assets
├── dev-docs/               # Development documentation (excluded from linting)
├── components.json         # Shadcn configuration
├── nuxt.config.ts          # Nuxt configuration
├── tsconfig.json           # TypeScript configuration
└── eslint.config.mjs       # ESLint configuration
```

## Architecture Notes

### Path Aliases
The project uses Nuxt's default path aliases:
- `@/*` and `~/*` both resolve to `./src/*` (configured in tsconfig.json)
- However, actual files are in `app/`, not `src/` - this is a configuration inconsistency

### CSS Configuration
- Global CSS is at `app/css/global.css`
- nuxt.config.ts references `~/assets/css/global.css` (incorrect path)
- The actual path should be updated in nuxt.config.ts to `~/app/css/global.css`

### Component Organization
- All Shadcn UI components are in `app/components/ui/`
- Components use kebab-case naming convention
- Shadcn style variant: "new-york"
- Icon library: lucide

### Design System
- Custom CSS variables for colors, spacing, shadows, and fonts
- Pink/purple color scheme with dark mode support
- Custom scrollbar styling (6px width, pink color)
- Font families: Poppins (sans), Playfair Display (serif), Space Mono (mono)

### Planned Features
See `dev-docs/project.md` for:
- Complete product vision
- API integration priorities (Jina AI, Gemini, DeepSeek, ChatGPT)
- Database schema requirements
- AI writing guidelines specifications

## Development Notes

- The project is in early development - component library is set up but no pages exist yet
- `dev-docs/` directory is excluded from ESLint (see lint script in package.json)
- SQLite database is installed but not yet implemented
- Nuxt 4 with compatibility date set to July 15, 2025
- Devtools enabled for development
