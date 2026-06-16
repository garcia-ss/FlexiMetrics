# FlexiMetrics Product Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement product modules 1-10 using only the current Supabase schema.

**Architecture:** Add pure operations helpers for reports, goals, notifications, CSV import and admin summaries. Extend the Supabase adapter only for existing tables (`usuario`, `professor`, `avaliacao.observacoes`). Add focused pages under `src/features/*` and wire them through router/navigation.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Supabase, existing UI system.

---

### Task 1: Pure Operations

- [ ] Create failing tests for report summary, derived goals, derived notifications, CSV parsing and admin summary.
- [ ] Implement `src/features/operations/operations.ts`.
- [ ] Verify focused tests pass.

### Task 2: Data Contracts

- [ ] Add `Professor`, `ProfessorInput`, repository contracts for usuarios/professores and feedback update.
- [ ] Implement Supabase methods with existing tables only.
- [ ] Preserve existing auth behavior.

### Task 3: Pages And Routes

- [ ] Add pages for reports, turma detail, vinculos, perfil, historico, metas, feedback, notificacoes, importar and admin.
- [ ] Wire router/navigation with role-appropriate entries.
- [ ] Reuse existing components and visual system.

### Task 4: Verification

- [ ] Run `npm run test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
