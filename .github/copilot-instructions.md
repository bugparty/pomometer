# Pomometer Copilot Instructions

## 📋 Project Overview

This is a **Pomodoro timer + Todo list** web application with a **hybrid Next.js + Cloudflare Workers architecture**.

### Core Features
- Pomodoro timer with multiple sound options
- Todo list management with categories and priorities  
- Google OAuth authentication
- Google Tasks API integration
- Real-time sync across devices
- Internationalization (i18n) support

### Technology Stack
- **Frontend**: Next.js 15 + React 19 + Redux Toolkit
- **Backend**: Cloudflare Workers via nextjs + D1 SQL database
- **Styling**: Tailwind CSS (`@apply` directives) + Custom CSS
- **UI Components**: Ant Design (antd)
- **Authentication**: JWT + Google OAuth 2.0
- **Database**: Cloudflare D1 + Prisma ORM
- **Package Manager**: pnpm (required)

## 🏗️ Architecture Overview

### 1. Redux Store Structure (`src/app/componments/store.ts`)
- **State Slices**: `todos`, `clock`, `oplogs`, `auth`, `visibilityFilter`, `opfilter`
- **Middleware Pipeline**: `opMiddleware` → `timerMiddleware` → `googleAnalysisMiddleware`
- **Persistence**: localStorage integration with Sentry monitoring

### 2. Hybrid Deployment Model
- **Frontend**: Next.js app via OpenNext on Cloudflare Pages
- **Backend**: Cloudflare Worker (`workers-site/`) for API routes
- **Database**: Cloudflare D1 with Prisma adapter

### 3. File Structure
```
src/app/componments/     # Core Redux slices & components (typo is intentional)
src/app/api        # nextjs server API 
locales/               # i18n translations
prisma/               # Database schema & configuration
```

## 💻 Development Workflows

### Package Management (CRITICAL)
**Always use `pnpm`, never `npm`:**
```bash
pnpm install           # NOT npm install
pnpm add <package>     # NOT npm install <package>
pnpm remove <package>  # NOT npm uninstall <package>
pnpm dev              # NOT npm run dev
pnpm build            # NOT npm run build
```

### First-time Setup (NEW ENVIRONMENT)
```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client (CRITICAL!)
pnpm prisma generate

# 3. Initialize local D1 — required before API routes work (CRITICAL!)
pnpm wrangler d1 migrations apply pomometer-db --local

# 4. Start development
pnpm dev
```

**Agents / automation:** Do not launch the dev server for fullstack or API testing until step 3 has succeeded. `pnpm prisma generate` alone does not create local D1 tables.

### Local Development
```bash
# Fullstack (port 3000) — ensure local D1 migrations are applied first
pnpm dev

```

### Database Management

The process for updating the database schema differs between local development and production environments.

#### Local Database (Wrangler)
To apply schema changes to your **local** D1 database, you must use the Wrangler CLI. This command applies migration files located in the `migrations/` directory.

```bash
# Apply pending migrations to the local D1 instance
pnpm wrangler d1 migrations apply pomometer-db --local
```

#### Remote/Production Database (Prisma)
To apply schema changes to the **remote** (production) D1 database, use the `prisma db push` command. This is typically handled by the CI/CD pipeline.

```bash
# Pushes the schema from prisma/schema.prisma to the remote database
pnpm prisma db push
```

### 🚨 CRITICAL: What NOT to do
- ❌ **Do not run `prisma db push` for your local database.** It targets the remote D1 instance defined in `wrangler.toml` and will not affect your local setup.
- ❌ **Do not use `prisma migrate dev`.** Use the documented Wrangler workflow for local migrations instead.

## 🎨 Styling Guidelines

### CSS Architecture (CRITICAL)
- **Never use Tailwind classes directly in JSX**
- **Always use `@apply` directives in CSS files**
- Main styles in `src/app/App.css`
- Card-style design: `border-radius: 12px` + gradient backgrounds

### Browser Compatibility
- **Safari mobile is priority** - always test iOS layouts
- Use `clamp()` for responsive typography with fallbacks
- Minimum touch target: 44px for mobile buttons

## 🔐 Authentication & API

### Google OAuth Flow
1. **ModernGoogleLogin** component initiates OAuth
2. **Callback page** (`/auth/google/callback`) handles token exchange
3. **JWT tokens** stored in localStorage
4. **Google Tasks API** permissions included in scope

### API Integration
- Routes: `/api/*` are implemented as Next.js route handlers under `src/app/api/`
- Database: Cloudflare D1 with TypeScript types
- CORS: Wildcard `*` configuration for development

## 🗄️ Database & Prisma

### Configuration
- **Database**: Cloudflare D1 (serverless SQL)
- **ORM**: Prisma with Cloudflare D1 adapter
- **Schema**: `prisma/schema.prisma`

### 🚨 CRITICAL: First-time Setup
**In a fresh environment, ALWAYS generate Prisma client first:**
```bash
pnpm prisma generate
```

**Without this step, you'll get error:**
```
Module '"@prisma/client"' has no exported member 'PrismaClient'
```

### Schema Updates (IMPORTANT)
```bash
# Edit schema → Run push command → Database updated
pnpm dlx  prisma db push
```

### What NOT to do:
- ❌ Don't add `url = env("DATABASE_URL")` to schema.prisma
- ❌ Don't use local SQLite files  
- ❌ Don't use `prisma migrate dev` or migration files
- ❌ Don't generate migration files

### Reference
- [Prisma + Cloudflare D1 Guide](https://www.prisma.io/blog/build-applications-at-the-edge-with-prisma-orm-and-cloudflare-d1-preview)

## 🔧 Code Patterns & Standards

### Component Architecture
- **Container components**: Redux-connected in `containers/` dirs
- **Presentational components**: Pure React components
- **UI Framework**: Ant Design Collapse panels with custom styling

### Redux Middleware Chain
1. **opMiddleware**: Logs user actions (excludes auth, timer actions)
2. **timerMiddleware**: 1-second countdown with cleanup
3. **googleAnalysisMiddleware**: GA tracking

### Code Style
- **TypeScript**: Required for all new code
- **Components**: Functional with hooks
- **Async**: Prefer async/await over Promises
- **Error handling**: Proper try/catch blocks

## 🚀 Build & Deployment

### Environment Commands
```bash

# Production  
pnpm run deploy            # Requires Cloudflare credentials
pnpm run deploy:staging    # Staging environment
```

### Critical Dependencies
- `@opennextjs/cloudflare`: Next.js → Cloudflare adapter
- `@reduxjs/toolkit`: Modern Redux patterns
- `jose`: JWT handling in Workers
- `wrangler`: Cloudflare CLI

## ⚠️ Important Notes

### State Management
- All state flows through Redux actions
- Timer updates via `set_stopped_at` every second  
- localStorage persistence is automatic
- User data syncs to D1 when authenticated

### Cross-Component Communication
- Redux actions for all state changes
- Operation logs for debugging/analytics
- Timer state managed through middleware

### Dependencies
- Check `package.json` before adding new packages
- Prefer lightweight alternatives
- Ensure Next.js + Cloudflare Workers compatibility


# backgroundworker Copilot Instructions

when you want to run the background worker, you need to cd into the backgroundworker directory first

`cd ./backgroundworker && pnpm run dev`

generate prisma client (from backgroundworker directory)
`cd ./backgroundworker && pnpm prisma generate --schema=../prisma/schema.prisma`

Note: The backgroundworker has its own prisma.config.ts that points to the correct schema path: '../prisma/schema.prisma'

# css

if you want to apply css only for safari, dont use
 `@supports (-webkit-appearance: none) and (not (-moz-appearance: none)) and (not (-ms-overflow-style: none))` 
anymore, because it will also match some other browsers like chrome. Use 
`@supports (background: -webkit-named-image(i))`

x## 🎨 CSS Architecture & Best Practices

### CSS Variables System
The project uses a centralized CSS variables system defined in `src/app/css-variables.css`:

#### Import CSS Variables
**Always import CSS variables at the top of each CSS file:**
```css
@import '../../css-variables.css';
```

#### Use CSS Variables Instead of Hardcoded Values
**❌ Don't use hardcoded values:**
```css
color: #374151;
padding: 1rem;
border-radius: 8px;
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

**✅ Use CSS variables:**
```css
color: var(--color-gray-700);
padding: var(--spacing-base);
border-radius: var(--radius-md);
box-shadow: var(--shadow-md);
```

### CSS Best Practices

#### 1. **Always Use CSS Variables**
- **Never hardcode colors, spacing, or other design tokens**
- **Always use predefined CSS variables for consistency**
- **If a new value is needed, add it to `css-variables.css` first**

#### 2. **Maintain Breakpoint Consistency**
- **Use predefined breakpoint variables:**
  - `--breakpoint-mobile: 480px`
  - `--breakpoint-tablet: 640px`
  - `--breakpoint-desktop: 768px`
  - `--breakpoint-large: 1024px`
  - `--breakpoint-xl: 1280px`
- **Never create custom breakpoints without adding them to the variables file**

#### 3. **Semantic Naming Convention**
- **CSS variables should have clear, semantic names**
- **Use consistent naming patterns:**
  - Colors: `--color-{name}-{shade}`
  - Spacing: `--spacing-{size}`
  - Radius: `--radius-{size}`
  - Shadows: `--shadow-{size}`
  - Transitions: `--transition-{speed}`

#### 4. **Progressive Enhancement Approach**
- **Define base styles first, then add enhancements**
- **Use CSS variables for consistent visual hierarchy**
- **Maintain accessibility and performance standards**

### CSS File Structure
```
src/app/
├── css-variables.css          # Central CSS variables
├── App.css                    # Main app styles
└── componments/
    ├── clock/Clock.css        # Clock component styles
    ├── todo/Todo.css          # Todo component styles
    ├── settings/Settings.css  # Settings component styles
    ├── auth/Auth.css          # Auth component styles
    ├── navigation/Navigation.css # Navigation styles
    └── common/Common.css      # Common utility styles
```

### CSS Maintenance Guidelines
- **New styles must use existing CSS variables when possible**
- **New variables must be added to `css-variables.css` first**
- **Regularly audit for duplicate or unused CSS rules**
- **Maintain consistent CSS variable naming conventions**
- **Test CSS changes across different screen sizes and browsers**

# Pomometer — Copilot Coding Guidelines (Type‑Safe by Default)

This repository enforces strict TypeScript and runtime safety. Follow these rules when authoring new code, PRs, or agent‑generated changes to avoid type errors and keep our build clean.

## General
- Prefer explicit domain types over loose shapes. Centralize shared DTOs in `src/app/types/api.ts`.
- Never use `any`. If you must accept untyped input, keep it at the boundary as `unknown` and immediately narrow with a type guard or validator.
- Avoid catch‑all update types like `[key: string]: any`. For “update” DTOs, enumerate allowed fields explicitly.
- Do not use `@ts-ignore`. If absolutely necessary, use `@ts-expect-error` with a 1‑line rationale and a TODO.

## API Routes
- Treat `request.json()` as **untrusted** (wrong shape, extra fields, malicious input). **Do not** cast with `as YourDto` and proceed — that only silences TypeScript.
- **Prefer** runtime validation: e.g. a schema parser (`safeParse` / `parse`) whose result you branch on; use only the **validated** value as your DTO. (Wrapping `await request.json()` directly is fine when the parser treats input as unchecked.)
- **If you use a hand-written type guard:** assign to `unknown` first so you do not inherit `any` from typings, then narrow — e.g. `const raw: unknown = await request.json(); if (!isSyncRequest(raw)) return ...`
- Use discriminated unions for operations: `{ type: 'ADD_TODO', payload: AddTodoPayload } | ...` so `switch(type)` narrows safely.
- Persisting operation logs: use a concrete payload type (e.g., `OperationPayload`) instead of `Record<string, any>`.

## Redux Store & Middlewares
- Always import `RootState` and `AppDispatch` from `src/app/componments/store` in components.
- Middleware typing:
  - `export const myMw: Middleware<unknown, RootState> = store => next => action => { ... }`
  - Helper functions that receive the API should use `MiddlewareAPI<Dispatch, RootState>` (Redux provides `Dispatch<UnknownAction>` in middleware).
- Action narrowing: use structural guards and action creator return types instead of `any`.
  - `const isOp = (a: { type: string }): a is OpAction => !excluded.includes(a.type)`
- Avoid `var`; prefer `let`/`const`. Avoid `ts-ignore` by writing null‑safe math and guards.

## React Components
- If a component has no props, use `React.FC` (no `{}`) or `type Props = Record<string, never>`; avoid empty interfaces.
- Use `useDispatch<AppDispatch>()` when dispatching thunks.
- Don’t add unused lifecycle params typed as `any` (e.g., drop `snapshot` from `componentDidUpdate` if unused).
- `mapStateToProps`/`mapDispatchToProps`: drop unused `ownProps` or type it as `Record<string, never>`.

## Services/Prisma
- “Update” DTOs must enumerate fields (e.g., `{ text?: string; completed?: boolean; updatedDate?: Date }`). No index signatures.
- Model third‑party responses (e.g., Google Tasks) with interfaces and convert at the edges.
- When adding or changing Prisma usage in a new environment, ensure: `pnpm prisma generate` (root) and for the background worker: `cd ./backgroundworker && pnpm prisma generate --schema=../prisma/schema.prisma`.

## Operation/Data Flow
- Server‑applied operations: use typed payloads and discriminated unions to avoid casts.
- Replace‑data actions must be strictly typed (e.g., `replaceTodos(TodoItem[])`), never `as any`.

## Lint & Quality
- No `any`. No `ts-ignore`. Prefer narrowing and explicit unions.
- Keep assertions localized (assert the smallest expression necessary).
- Fix types at the root cause; don’t paper over with `unknown` unless you immediately narrow it.

## Minimal Patterns (Copy‑Paste)
- Action guard: `const isOp = (a: { type: string }): a is OpAction => !excluded.includes(a.type)`
- Middleware template:
  - `export const mw: Middleware<unknown, RootState> = store => next => action => { /* ... */ }`
  - `const helper = (api: MiddlewareAPI<Dispatch, RootState>) => { /* ... */ }`
- API boundary (prefer schema validation; manual guard only when appropriate):
  - `const parsed = MyRequestSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 }); const body = parsed.data;`
  - Manual: `const raw: unknown = await request.json(); if (!isSyncRequest(raw)) return NextResponse.json({ success: false }, { status: 400 });` — then use `raw` inside the guard’s narrowing branch only.

## Workflow
- Use pnpm for everything (`pnpm install/dev/build`).
- In a fresh environment: `pnpm prisma generate` before builds to prevent client type errors.
- Iterate in small batches and run `pnpm build` frequently.

