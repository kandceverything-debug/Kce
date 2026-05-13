# The Compound

A members-only 3D digital space for the Goth Wook Clique. Build on invitation, evolve through participation, governed by the community.

## Overview

- **Phase 1** ✅ Foundation: monorepo, schema, avatar types, auth stubs
- **Phase 2** ✅ UI, Auth, Payments (mocked), Booth Mechanics
- **Phase 3** ✅ 3D Venue, Avatar Renderer, Crowd
- **Phase 4** ✅ Audio, Multiplayer, Analytics, Polish
- **Security & Deployment** ✅ Hardening, CI/CD, Live

## Architecture

```
apps/
  web/           - Next.js 15 PWA, Supabase SSR auth, 3D scene
  admin/         - Admin dashboard
  why/           - Public companion landing (separate repo)

packages/
  shared/        - Avatar types, evolution logic (6-tier system)
  db/            - Supabase client
  ui/            - UI components (Button, Card, Badge, etc.)
  three-kit/     - Three.js scene, avatar renderer, venue geometry

supabase/
  migrations/    - SQL schema (profiles, transactions, events, booth_energy_log)
  functions/     - Edge functions (vouch-redeem, stripe-webhook, avatar-evolve, etc.)
  config.toml    - Project config
```

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 10+
- Supabase account (you'll provide URL + keys in env vars)

### Installation

```bash
pnpm install
pnpm build
pnpm dev
```

### Environment Variables

Create `.env.local` in `apps/web`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

## Commands

```bash
# Development
pnpm dev

# Build all apps and packages
pnpm build

# Type checking
pnpm typecheck

# Testing
pnpm test              # Run tests once
pnpm test:watch       # Watch mode

# Linting
pnpm lint

# Clean build artifacts
pnpm clean
```

## Features

### Avatar Evolution (6-Tier System)

- **Wraith** (Tier 0): Baseline — minimal aura, no effects
- **Initiate** (Tier 1): First member joined — embers particle system
- **Bound** (Tier 2): Committed member — 2-layer aura, glyph rings
- **Marked** (Tier 3): Active participant — inner/outer glyph rings, tendrils
- **Crowned** (Tier 4): High contributor — faint wings, sigil sparks
- **Sovereign** (Tier 5): Legendary — halo, wings, light pillar, 5-layer aura

Tier progression based on:
- Days in good standing
- Successful vouches
- Total tips received
- Booth energy participations
- Venue checkins

### 3D Venue

Exact photo-reference recreation of the warehouse:
- Cream/tan cinder block walls
- Glossy concrete floor (14m × 20m)
- Exposed scaffold ceiling with pipe truss
- DJ booth with Art Deco tapestry backdrop
- Dynamic gobo projection (yellow-blue honeycomb)
- Purple/magenta dance floor wash
- Green accent on booth
- 50–200 avatar crowd rendering with culling
- Real-time avatar positions via Supabase Realtime

### Authentication

- Magic link sign-up (email-based)
- Vouch code redemption (members-only onboarding)
- Session refresh via Supabase SSR
- Middleware redirect for unauthorized access

### Mechanics

- **Booth Energy**: Rate member enthusiasm (1–10 scale), real-time aggregation
- **Tips**: Send money to DJ (mocked, no real Stripe integration in Phase 2)
- **Checkins**: Confirm venue presence
- **Avatar Customization**: Edit aura color, intensity, palette

## Security

### Headers & Middleware
- CORS: whitelist compound.kce.fyi + localhost:3000
- HSTS: enforce HTTPS
- CSP: restrict script sources
- Cookies: Secure, HttpOnly, SameSite=Strict

### API Rate Limiting
- Tips: 10 per minute per user
- Booth energy: 5 per second
- Auth: 5 magic link requests per 15 min per email

### Database (Supabase RLS)
- `is_active_member()` helper function
- Policies: members read members, see transactions, access owned data only
- Cascade ban: ban a member → ban their voucher

### Secret Management
- All secrets in GitHub secrets or Vercel env vars
- No hardcoded keys
- Pre-commit hook: `detect-secrets` (blocks commits with leaked tokens)
- Monthly key rotation recommended

### Input Validation
- DOMPurify for user-submitted text
- Zod schemas for API payloads
- Parameterized SQL queries (Supabase)
- Message length limits (1000 chars)

## Deployment

### Vercel

1. **Connect GitHub**:
   ```bash
   gh repo view --web  # Open repo on GitHub
   ```
   Link to Vercel from GitHub settings.

2. **Environment Variables** (Vercel dashboard):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`

3. **Staging**: PR previews at `preview.compound.kce.fyi`

4. **Production**: Push to `main` → auto-deploy to `compound.kce.fyi`

### Supabase

1. Create a project at supabase.com
2. Run migrations:
   ```bash
   supabase migration up  # Requires Supabase CLI
   ```
3. Deploy edge functions:
   ```bash
   supabase functions deploy
   ```

### DNS

- A/AAAA records → Vercel edge
- TXT records for domain verification
- SSL auto via Let's Encrypt (Vercel)

## Monitoring

- **Vercel Analytics**: Core Web Vitals, error rates
- **Sentry**: JavaScript errors, replay (masked)
- **PostHog**: Event tracking (member joins, tips, tier-ups)
- **Supabase Logs**: Auth, database slow queries
- **PagerDuty**: Critical alerts (500 errors, auth outage)

## Testing

```bash
# Unit tests
pnpm test

# E2E (when Playwright is added)
pnpm test:e2e

# Coverage
pnpm test -- --coverage
```

Test suites cover:
- Avatar evolution logic (score → tier)
- Auth flow (magic link → profile)
- Booth energy aggregation
- RLS policies

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes, commit with clear messages
3. Push and create a PR
4. Ensure CI passes (lint, typecheck, test, build)
5. Request review

### Branch Conventions
- `main` → production (auto-deployed)
- `develop` → staging
- `feature/*` → new features
- `fix/*` → bug fixes
- `security/*` → security patches

## Documentation

- `CLAUDE.md`: Build, test, and development setup
- `supabase/README.md`: Schema walkthrough, RLS policies
- `packages/three-kit/README.md`: Scene architecture, performance tips

## Q&A

**Q: Why no real Stripe integration in Phase 2?**
A: API stubbed for now. Phase 2 focuses on mechanics. Stripe live mode requires PCI compliance and account setup.

**Q: How do I test the 3D scene locally?**
A: Run `pnpm dev`, navigate to `/compound/venue` (requires active session). Uses Supabase mock or live project.

**Q: Can I run Supabase locally?**
A: Yes. Add `supabase start` to dev startup (see `supabase/README.md`). Requires Docker.

## License

Proprietary — K&C Everything Productions

## Support

For issues or questions, open an issue on GitHub or contact maintainers.
