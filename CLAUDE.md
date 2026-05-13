# CLAUDE.md — Development Setup

This file provides guidance for Claude Code working on this repository.

## Build & Test Commands

```bash
# Install all dependencies
pnpm install

# Development server (all apps)
pnpm dev

# Production build
pnpm build

# Type checking
pnpm typecheck

# Testing
pnpm test              # Run tests once
pnpm test:watch       # Watch mode with coverage

# Linting & formatting
pnpm lint             # ESLint check
pnpm format           # Prettier (add when needed)

# Clean artifacts
pnpm clean
```

## Architecture Overview

### Monorepo Structure
- **Turbo**: Build orchestration with caching
- **pnpm workspaces**: Shared dependencies, internal packages
- **TypeScript**: Strict mode across all packages

### Apps
- **`apps/web`**: Next.js 15 PWA
  - Routes: `/claim` (invite), `/compound/*` (authenticated), `/api/*` (endpoints)
  - Middleware: Supabase session refresh, route protection
  - 3D scene: `/compound/venue` (Three.js + avatars)
  
- **`apps/admin`**: Next.js 15 admin dashboard
  - Routes: `/members`, `/transactions`, `/events`
  - Access: Moderated only (check auth middleware)

### Packages
- **`packages/shared`**: Avatar types, evolution logic
  - Export: `AvatarTraits`, `computeEvolutionScore`, `scoreToTier`, `getTierConfig`, tier configs
  - No external deps
  
- **`packages/db`**: Supabase client wrapper
  - Export: `createClient`, `SupabaseClient`, `Database` type (placeholder)
  
- **`packages/ui`**: Button, Input, Card, Badge, Dialog, Skeleton
  - Tailwind CSS based, dark mode by default
  - Export: `Button`, `Input`, `Card`, Badge`, `Skeleton`, `Dialog`, `cn` utility
  
- **`packages/three-kit`**: 3D scene components
  - Export: `Avatar` (React component), `Venue` (Three.js geometry), `VenueScene`
  - Depends on Three.js, @react-three/fiber, @react-three/drei

## Key Conventions

### Code Style
- **Naming**: camelCase (variables/functions), PascalCase (components/types)
- **Files**: kebab-case (folders), .tsx (React), .ts (logic)
- **Strings**: Template literals for composing classes (`className={`...${var}...`}`)
- **Comments**: Only for WHY, not WHAT. Well-named code is self-documenting.

### React Patterns
- **Hooks**: `useState`, `useEffect`, `useRef`, `useCallback` (not Apollo, SWR)
- **State**: Zustand stores for global auth state, React Query for server state
- **SSR**: Use `async` components in Next.js App Router when possible
- **Client Components**: Mark with `'use client'` at top of file

### API Routes
- Location: `apps/web/app/api/*/route.ts`
- Auth: Check Supabase session in POST/PUT/DELETE
- Rate limiting: Use `rateLimit()` helper for `/api/transactions/*`, `/api/booth-energy`
- Response: Always return JSON, status codes (200, 400, 401, 429, 500)

### Database
- Supabase project required; env vars in `.env.local`
- Migrations in `supabase/migrations/*.sql` (apply manually until Supabase CLI installed)
- RLS policies: All tables have policies; `is_active_member()` helper enforces active status
- Functions: `get_booth_energy()`, `get_evolution_score()` for aggregations

### Styling
- **Tailwind CSS**: All styling via utility classes
- **Brand Colors**: `bg-brand-primary` (#7a00ff), `text-brand-glow` (#cc66ff), `bg-brand-bg` (#04020a)
- **Responsive**: Mobile-first, use `sm:`, `md:`, `lg:` breakpoints
- **Dark Mode**: Built-in via Tailwind `dark:` variant (class on `<html>`)

## Testing

### Unit Tests
- Location: `__tests__/*.test.ts`
- Runner: Vitest
- Coverage target: 80% for `packages/shared` and `packages/db`
- Command: `pnpm test`

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { scoreToTier } from '@compound/shared';

describe('Avatar', () => {
  it('converts score to tier', () => {
    expect(scoreToTier(50)).toBe(1);
  });
});
```

### Integration Tests
- E2E: Playwright (when added)
- API: Manual testing via curl, Postman, or client forms
- Database: Supabase dashboard or psql

## Common Tasks

### Add a New API Endpoint

1. Create `apps/web/app/api/[resource]/[action]/route.ts`
2. Export `POST`, `GET`, `PUT`, `DELETE` functions
3. Check auth: `const { data: { session } } = await supabase.auth.getSession()`
4. Apply rate limiting if needed
5. Return JSON response

### Add a New Page

1. Create `apps/web/app/[path]/page.tsx`
2. Mark as `'use client'` if interactive
3. Import UI components from `@compound/ui`
4. Use Supabase client for data fetching
5. Style with Tailwind classes

### Add a UI Component

1. Create `packages/ui/src/components/[name].tsx`
2. Export from `packages/ui/src/components/index.ts`
3. Add to main `packages/ui/src/index.ts`
4. Test in a page

### Update Database Schema

1. Create new migration: `supabase/migrations/000N_description.sql`
2. Write SQL (use migration template from `0001_init.sql`)
3. Test locally (if Supabase CLI available)
4. Document schema changes in `supabase/README.md`

## Debugging

### Next.js
- `pnpm dev` runs dev server with hot reload
- Check `apps/web/.next` for build output
- Server logs in terminal
- Client errors in browser console

### Supabase
- Dashboard: supabase.com/project/[project-ref]
- Logs: RLS policy violations, auth failures
- SQL Editor: Test queries directly
- RealtimeEd: View subscriptions and events

### Three.js Scene
- Add `Leva` controls via `useControls()` for live tweaking
- Check `performance` in browser DevTools
- Use `console.log(mesh)` to inspect geometry/materials

## Deployment

### Preview (Staging)
- Push to feature branch
- Open PR
- Vercel creates preview at `preview.compound.kce.fyi/pr-[number]`

### Production
- Push to `main` or merge PR
- Vercel auto-deploys to `compound.kce.fyi`
- Check Vercel dashboard for build status
- Monitor Sentry for errors post-deploy

### Environment Setup
- Add secrets to Vercel project settings
- Supabase project must be live
- DNS records pointing to Vercel edge

## Troubleshooting

**Build fails with "module not found"**
- Run `pnpm install` in workspace root
- Check import paths (use absolute paths via tsconfig `paths`)

**Type errors in IDE but `pnpm typecheck` passes**
- IDE cache issue: Restart TypeScript server in editor
- Check `tsconfig.json` extends `../../../tsconfig.base.json`

**3D scene doesn't render**
- Check WebGL support in browser
- Verify Three.js packages are installed
- Look for console errors (GPU/shader compilation)
- Mobile fallback: 2D spectator view if canvas fails

**Supabase connection fails**
- Verify env vars are set in `.env.local`
- Check Supabase project is live
- Confirm RLS policies aren't blocking queries (use `anonKey` testing)

## Resources

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Three.js / R3F: https://docs.pmnd.rs/react-three-fiber
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

## Important Notes

- **No hardcoded secrets**: All keys in env vars or GitHub secrets
- **Test before pushing**: `pnpm typecheck && pnpm build && pnpm test`
- **Update CHANGELOG**: Log significant changes
- **Commit messages**: Clear, imperative ("Add feature" not "Added feature")
- **PR reviews**: Aim for < 5 files changed per PR for easier review
