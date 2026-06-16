# FlexiMetrics Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build source-backed insights for professor/admin and next-focus guidance for aluno using existing Supabase data.

**Architecture:** Add a pure analytics module under `src/features/insights` and test it first. The professor page fetches alunos, turmas, and avaliacoes through existing repositories, then renders summaries and an actionable table. The aluno dashboard reuses the same pure focus function with `listByAluno`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Supabase repository adapter, existing UI components.

---

### Task 1: Insight Analytics

**Files:**
- Create: `src/features/insights/insights.test.ts`
- Create: `src/features/insights/insights.ts`

- [ ] Write failing Vitest coverage for overdue evaluations, metric regression, metric improvement, and aluno focus guidance.
- [ ] Run `npm run test -- src/features/insights/insights.test.ts` and verify the test fails because the module does not exist.
- [ ] Implement pure functions `buildInsights`, `buildAlunoFocus`, and `compareMetricChange`.
- [ ] Run `npm run test -- src/features/insights/insights.test.ts` and verify it passes.

### Task 2: Professor Insights Page

**Files:**
- Create: `src/features/insights/InsightsPage.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/navigation.tsx`

- [ ] Add route `/app/insights`.
- [ ] Add professor/admin navigation item after dashboard.
- [ ] Fetch `alunos`, `turmas`, and `avaliacoes`.
- [ ] Render KPI cards, status filters, and actionable student table.
- [ ] Link table rows to `/app/alunos/:id`.

### Task 3: Aluno Next Focus

**Files:**
- Modify: `src/features/dashboard/AlunoOverview.tsx`

- [ ] Fetch `data.avaliacoes.listByAluno(alunoId)` together with existing aluno/evolution data.
- [ ] Render a `Proximos focos` card after metric mini stats.
- [ ] Show empty guidance when there are fewer than two evaluations.

### Task 4: Verification

**Files:**
- No production files expected.

- [ ] Run `npm run test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
