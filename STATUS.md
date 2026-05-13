# Phase 1 — Foundation Status

## Checklist

- [x] Monorepo scaffold (`pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`)
- [x] `packages/shared` — avatar types, evolution scoring, tier visual configs (6 tiers)
- [x] `packages/db` — Supabase client stub, `Database` type placeholder
- [x] `packages/ui` — `cn()` utility (tailwind-merge + clsx)
- [x] `packages/three-kit` — Phase 3 stub
- [x] `apps/web` — Next.js 15 PWA with `@ducanh2912/next-pwa`, Supabase SSR auth, middleware
- [x] `apps/admin` — Minimal Next.js 15 stub
- [x] `supabase/migrations/0001_init.sql` — Full schema: enums, tables, RLS, cascade ban trigger
- [x] `supabase/config.toml` — Project config
- [x] Supabase edge function stubs: `vouch-redeem`, `ban-cascade`, `avatar-evolve`, `booth-energy`, `stripe-webhook`, `memory-postprocess`
- [x] PWA icons generated from K&C Everything Productions brand (steampunk KC shield): 192px, 512px, maskable 512px
- [x] `pnpm typecheck` — 0 errors across all 6 packages
- [x] `pnpm build` — both apps build successfully

## Deviations

- **Fonts**: `next/font/google` replaced with `@fontsource/inter` + `@fontsource/jetbrains-mono` — Google Fonts network not available in build environment. Functionally identical; fonts self-hosted.
- **Supabase CLI**: Not run locally. Migrations written as SQL files. `supabase gen types` deferred until a live project is wired up.
- **`why` app**: Standalone repo (`/home/user/Why`), not inside the kce monorepo — separate Next.js 15 site, intentionally sparse.
- **shadcn/ui**: `packages/ui` exports `cn()` only. Full component library initialization deferred to Phase 2.
- **`packages/three-kit`**: Empty stub. Three.js + R3F installs deferred to Phase 3.
