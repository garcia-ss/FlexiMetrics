# FlexiMetrics Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate `FlexiMetrics` + `fleximetrics2` into one cohesive, TypeScript, "Performance Lab"-themed SaaS that runs fully on a mock data layer now and is ready to plug into Supabase later.

**Architecture:** Rebuild inside `FlexiMetrics` (canonical). Repository contract + swappable adapters (mock/supabase). Zustand for auth + UI state. react-router v7 with a protected app shell. Tailwind v4 design system. Recharts + framer-motion for data-viz and motion.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, react-router-dom v7, zustand, recharts, framer-motion, lucide-react, clsx + tailwind-merge, @supabase/supabase-js, vitest (pure-logic tests).

**Working dir:** `C:\Projetos\Faculdade\PI\FlexiMetrics`. Verification: `npm run build`, `npm run lint`, `npm run test` (vitest). No git repo — commits skipped unless `git init` is run; treat "Commit" steps as logical checkpoints.

---

## Phase 0 — Foundation

### Task 0.1: Dependencies & tooling
**Files:** Modify `package.json`; Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `postcss.config.js`, `vitest.config.ts`; Delete `vite.config.js`.

- Add deps: `tailwindcss@^4 @tailwindcss/vite framer-motion recharts lucide-react clsx tailwind-merge`.
- Remove dep: `react-icons`.
- Add devDeps: `typescript typescript-eslint vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom`.
- `vite.config.ts`: react + `@tailwindcss/vite`, alias `@` → `src`.
- `tsconfig.json`: `strict`, `jsx: react-jsx`, `paths { "@/*": ["src/*"] }`, `moduleResolution: bundler`.
- `package.json` scripts: add `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.
- Verify: `npm install` succeeds; `npm run typecheck` runs (errors expected until code migrated).

### Task 0.2: Design tokens & global styles
**Files:** Create `src/styles/tokens.css`, `src/styles/index.css`; Delete `src/index.css`; Modify `index.html` (fonts: Sora + Inter; `<html class="dark">`; title).
- `tokens.css`: CSS variables for Performance Lab (bg/surface/card/border/text/volt/semantic), radii, both `.dark` (default) and light. Map to Tailwind theme via `@theme` in `index.css`.
- `index.css`: `@import "tailwindcss"`, `@custom-variant dark`, base layer (body bg/text, font, tabular-nums utility, custom-scrollbar, focus-visible ring).
- Verify: `npm run dev` renders a styled blank page.

### Task 0.3: `cn` util + UI primitives (part 1)
**Files:** Create `src/lib/cn.ts`, `src/components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`, `Card.tsx`, `Badge.tsx`.
- `cn` = `twMerge(clsx(...))`.
- Button: variants `primary|secondary|ghost|danger`, sizes `sm|md|lg`, `loading`, `icon`, `asChild?` (no), full a11y (focus ring, disabled).
- Input/Select: label, error, hint, left icon; controlled.
- Card: surface container with optional header/title/action.
- Badge: semantic color variants.
- Verify: `npm run build` (after a temp showcase route) — or defer visual to 0.5.

### Task 0.4: UI primitives (part 2)
**Files:** Create `src/components/ui/{Modal,Table,Tabs,Dropdown,Tooltip,Skeleton,EmptyState,Toast,Pagination}.tsx`, `src/components/ui/index.ts` (barrel).
- Modal: framer-motion overlay+panel, focus trap, ESC close, sizes.
- Table: generic `<Table columns rows />` typed `Column<T>` with `key,label,render?,align?,sortable?`.
- Toast: context provider + `useToast()` (success/error/info), auto-dismiss, motion.
- Skeleton/EmptyState/Pagination/Tabs/Dropdown/Tooltip per spec.
- Verify: `npm run build`.

### Task 0.5: App shell, theme store, router skeleton
**Files:** Create `src/stores/uiStore.ts`, `src/components/layout/{Sidebar,Topbar,ThemeToggle,ProfileMenu}.tsx`, `src/app/layouts/{AppShell,AuthLayout}.tsx`, `src/app/router.tsx`, `src/app/providers.tsx`; Modify `src/main.tsx` (rename from .jsx).
- `uiStore`: `theme`, `toggleTheme` (persist localStorage, set `<html>` class), `sidebarOpen`, `toggleSidebar`.
- Sidebar: nav items by role (placeholder role for now), active state, collapse on mobile, volt active accent.
- Topbar: page title slot, search slot, ThemeToggle, ProfileMenu.
- Router: routes per spec with temporary placeholder pages.
- Verify: `npm run dev` shows shell with working nav + theme toggle; `npm run build` green.

### Task 0.6: Retire fleximetrics2
**Files:** none in app; action: leave `fleximetrics2/` in place but add `fleximetrics2/ARCHIVED.md` noting it is reference-only and superseded.
- Verify: documented.

---

## Phase 1 — Data layer + Auth

### Task 1.1: Domain types
**Files:** Create `src/domain/types.ts`.
- Define: `Genero`, `Perfil`, `MetricaKey`, `RegistroMetricas`, `ClassificacaoImc`, `Aluno`, `Turma`, `Avaliacao`, `PontoEvolucao`, `Usuario`, filter types.
- Verify: `npm run typecheck` (this file clean).

### Task 1.2: Metrics domain (TDD)
**Files:** Create `src/domain/metrics.ts`, `src/domain/metrics.test.ts`.
- `calcImc(peso,altura)`, `calcRce(cintura,altura)`, `classificarImc(imc) -> {label,tone}`, `idadeFrom(dataNascimento, ref?)`, `METRICAS` registry `[{key,label,unit,order}]`, `valorMetrica(aluno,key)`.
- Tests: known IMC (e.g. 70/(1.75²)=22.86→22.9, Normal), RCE, classification boundaries (18.5/24.9/29.9), idade.
- Verify: `npm run test` green.

### Task 1.3: Repository contract
**Files:** Create `src/data/repositories/types.ts`.
- Interfaces: `AlunoRepo`, `TurmaRepo`, `AvaliacaoRepo`, `MetricaRepo`, `AuthRepo`, and `DataSource` aggregating them.
- Verify: `npm run typecheck`.

### Task 1.4: Seed generator
**Files:** Create `src/data/seed/generate.ts`.
- Deterministic-ish generator (seeded RNG) producing turmas, alunos (with composição + metricas via `domain/metrics`), and 4–6 monthly avaliações per aluno forming evolution series.
- Verify: small unit test asserts counts and that derived imc matches `calcImc`.

### Task 1.5: Mock adapter
**Files:** Create `src/data/adapters/mock/store.ts` (localStorage-backed in-memory db + latency helper), `src/data/adapters/mock/index.ts` (implements `DataSource`).
- CRUD on alunos/turmas/avaliacoes; `alunos.evolution(id)` derives series from avaliacoes; persists to localStorage key `fm:db`.
- Auth mock: `signIn(email,perfil)` returns demo `Usuario`; `current()` from localStorage; `onChange`.
- Verify: unit test: create→list→update→remove round-trip.

### Task 1.6: Supabase adapter skeleton + data index
**Files:** Create `src/data/adapters/supabase/index.ts`, `src/lib/supabase.ts` (typed client), `src/data/index.ts` (selects adapter via `VITE_DATA_SOURCE`).
- Supabase adapter: real queries mapping normalized↔domain; auth via supabase. Guarded so missing env throws clear error only when selected.
- Verify: `npm run typecheck`; default `mock` import works.

### Task 1.7: Auth store + hook + ProtectedRoute
**Files:** Create `src/stores/authStore.ts`, `src/hooks/useAuth.ts`, `src/app/ProtectedRoute.tsx`; Delete old `src/hooks/useAuth.jsx`, `src/services/authService.js`, `src/stores/authStore.js`, `src/types/auth.js`.
- `authStore`: `user, loading, error, signIn, signUp, signOut, init` delegating to `data.auth`.
- ProtectedRoute: redirect to `/login` when no user; role gating helper.
- Verify: `npm run build`.

### Task 1.8: Auth pages (login/cadastro/forgot)
**Files:** Create `src/features/auth/{LoginPage,CadastroPage,ForgotPage}.tsx`; wire into router; delete old `src/pages/Home`, `src/pages/Cadastro`.
- Demo login with **profile selector** (aluno/professor/personal) + email/senha; validated cadastro; forgot stub. Performance Lab styling, motion, AuthLayout.
- Verify: `npm run dev` — login as each profile lands in `/app`.

### Task 1.9: SQL migrations + seed (deliverable)
**Files:** Create `db/migrations/0001_init.sql`, `db/seed.sql`, `db/README.md`.
- Tables per DATABASE.md + RLS + indexes + view; seed inserts sample data.
- Verify: SQL lints by eye; README explains how to run.

---

## Phase 2 — Dashboard (role-aware)

### Task 2.1: Chart wrappers
**Files:** Create `src/components/charts/{LineEvolution,BarTrend,Donut,RadarCompare,index.ts}.tsx`.
- Themed recharts wrappers reading CSS vars; responsive; tooltip styled.
- Verify: `npm run build`.

### Task 2.2: Dashboard data hook + KPIs
**Files:** Create `src/features/dashboard/useDashboardData.ts`, `src/features/dashboard/kpis.ts`.
- Aggregate from `data.alunos.list` + filters: total, médias (idade/imc/métricas), distribuições (gênero/imc), radar M×F, evolução média mensal, ranking.
- Verify: unit test on `kpis.ts` aggregation with fixture.

### Task 2.3: Dashboard page (educator)
**Files:** Create `src/features/dashboard/DashboardPage.tsx`, `components/{FiltersBar,RankingPanel}.tsx`.
- StatCards + MiniCards + charts grid + ranking + filters; loading skeletons, empty/error states; framer-motion entrance.
- Verify: `npm run dev` overview renders from mock data.

### Task 2.4: Aluno dashboard (read-only)
**Files:** Create `src/features/dashboard/AlunoOverview.tsx`.
- Self metrics + personal evolution charts + classification; routed when `perfil==='aluno'`.
- Verify: login as aluno shows it.

---

## Phase 3 — Alunos

### Task 3.1: Alunos list
**Files:** Create `src/features/alunos/AlunosPage.tsx`, `useAlunos.ts`, `components/AlunosTable.tsx`.
- Table with search, sort, filters (gênero/idade/imc/turma), pagination; row → detail; loading/empty/error; CSV export via `lib/csv.ts`.
- Files: also create `src/lib/csv.ts`, `src/lib/format.ts`.
- Verify: interactions work on mock.

### Task 3.2: Aluno form modal (create/edit, validated)
**Files:** Create `src/features/alunos/components/AlunoFormModal.tsx`, `validation.ts`.
- Sections (dados/composição/testes), auto-calc IMC/RCE preview, per-field validation, toast on save.
- Verify: create + edit persist (localStorage).

### Task 3.3: Aluno detail + evolution
**Files:** Create `src/features/alunos/AlunoDetailPage.tsx`.
- Header (identidade + classificação), metric cards, evolution line charts over avaliações, list of avaliações, edit/delete.
- Verify: detail renders evolution from seeded avaliações.

---

## Phase 4 — Turmas & Avaliações

### Task 4.1: Turmas CRUD + overview
**Files:** Create `src/features/turmas/{TurmasPage,TurmaDetailPage}.tsx`, `useTurmas.ts`, `components/TurmaFormModal.tsx`.
- List/create/edit/delete; detail shows turma KPIs + alunos.
- Verify: CRUD works; professor-only.

### Task 4.2: Avaliação flow
**Files:** Create `src/features/avaliacoes/{AvaliacoesPage,NovaAvaliacaoPage}.tsx`, `useAvaliacoes.ts`.
- Record metrics for an aluno + período; feeds evolution; list recent avaliações.
- Verify: new avaliação appears in aluno evolution.

### Task 4.3: Ranking page
**Files:** Create `src/features/dashboard/RankingPage.tsx` (or reuse RankingPanel full page).
- Top-N by selectable metric, podium styling, filters.
- Verify: renders.

---

## Phase 5 — Aluno role + polish

### Task 5.1: Landing redesign
**Files:** Create `src/features/landing/LandingPage.tsx`; wire `/`.
- Performance Lab hero + features (port concepts from fleximetrics2 Landing) + CTA → /login; motion.
- Verify: `/` renders.

### Task 5.2: Role-based nav finalize + aluno views
**Files:** Modify Sidebar/router for final role gating; ensure aluno sees only allowed routes.
- Verify: each role’s nav correct.

### Task 5.3: Polish pass
- A11y (focus, aria, contrast), responsive QA (sidebar collapse, table scroll), consistent empty/loading/error, motion review.
- Verify: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test` all green.

### Task 5.4: Docs refresh
**Files:** Update `README.md`, `ARCHITECTURE.md`; add run/test/validate instructions, deliverables checklist.

---

## Self-review notes
- Spec coverage: every spec section (1–14) maps to phases 0–5. Supabase real-data validation deferred (risk noted). 
- Verification adapted to project reality: vitest for pure logic, build/lint/typecheck + manual for UI (no E2E per non-objectives).
- Types consistent: domain types in 1.1 used across data/features.
