# FlexiMetrics — Consolidação e Redesign (Design / Spec)

- **Data:** 2026-06-15
- **Status:** Aprovado (design) — pronto para plano de implementação
- **Autor:** Equipe sênior (via Claude) + danilopereira2005

---

## 1. Contexto e diagnóstico

O repositório `PI/` contém dois apps Vite + React 19 separados:

| | `FlexiMetrics` (principal) | `fleximetrics2` (referência) |
|---|---|---|
| Roteamento | react-router-dom v7 | nenhum (state machine em `App.jsx`) |
| Estado | zustand (`authStore`) — **órfão, não importado** | `useState` local |
| Estilo | CSS vanilla por componente (gradiente verde) | **Tailwind v4 + framer-motion + recharts + lucide** |
| Supabase | configurado (`lib/supabase.js`, `authService`, `authStore`) | nenhum |
| Auth | **mockada** (`hooks/useAuth.jsx` aprova qualquer login) | botão "entrar" |
| Dashboards | 3 cascas estáticas (Aluno/Professor/Personal) com listas hardcoded | 1 dashboard rico (KPIs, 5 gráficos, ranking, tabela paginada, CRUD modal, CSV, dark mode) — **100% mock em memória (150 alunos)** |

**Domínio:** professores/personais de educação física acompanham a evolução de **métricas físicas** de alunos (IMC, RCE, flexibilidade, potência MMII/MS, velocidade, agilidade, abdominal, resistência), organizados em turmas, com avaliações periódicas.

**Problemas-chave:**
1. 🔴 Backend Supabase inacessível — host `soeyfmnjuispbryslwiq.supabase.co` não resolve DNS (projeto deletado/pausado). Schema real não introspectável; auth real existe mas está desativada.
2. 🔴 Zero dados reais fluindo; dashboard bonito é 100% fake; `authStore` órfão.
3. 🟡 Duas stacks visuais incompatíveis; principal com CSS frágil e dashboards placeholder.
4. 🟡 `main.jsx` sem `ProtectedRoute`; rota `/forgot-password` referenciada mas inexistente.

## 2. Decisões do produto (confirmadas)

1. **Dados:** camada de acesso abstraída com **adapter mock funcional agora** (persistido em `localStorage`) + **adapter Supabase pronto para plugar** depois. Migrations/seed SQL entregues como artefato.
2. **Objetivo:** **demo de faculdade impressionante e funcional** (Projeto Integrador), com arquitetura pronta para produção.
3. **Auth:** estrutura de auth real (Supabase) + **login demo de fallback ativo agora**, `ProtectedRoute`, **3 perfis** mantidos (aluno/professor/personal).
4. **Identidade visual:** **"Performance Lab"** — dark-first graphite/ink + acento "volt" (verde-limão elétrico `#c8ff3d`), tipografia com numerais tabulares, foco em data-viz. (Light mode também suportado.)
5. **Navegação:** **sidebar com rótulos + topbar** (padrão SaaS), colapsável em mobile.
6. **Integração:** reconstruir dentro do `FlexiMetrics` como app canônico; **aposentar `fleximetrics2`** (arquivado como referência).
7. **Linguagem:** **TypeScript** (migração de JS/JSX → TS/TSX, `tsconfig`, `typescript-eslint`).
8. **Execução:** todas as fases de ponta a ponta (sem checkpoints por fase).

## 3. Identidade visual — Performance Lab

Tokens (CSS variables, dark-first; espelho claro para light mode):

- **Fundo:** `#0c0f14` (base) / `#0e1218` (superfícies) / `#11161e` (cards) / borda `#1f2937`.
- **Texto:** `#e8edf2` (primário) / `#9aa6b6` (secundário) / `#8a95a5` (muted).
- **Acento "volt":** `#c8ff3d` (CTA, destaque, séries primárias).
- **Apoio data-viz:** grafites `#2f3a4a`/`#3a4759`; estados semânticos: success volt, warning âmbar, danger `#ef4444`, info ciano.
- **Tipografia:** display/heading sans geométrica (ex.: "Sora"/"Space Grotesk"); corpo "Inter"; numerais `font-variant-numeric: tabular-nums` em KPIs/tabelas.
- **Forma:** raios 10–16px, sombras sutis, microinterações framer-motion discretas.

Classificação de IMC (cores): Abaixo do peso = âmbar, Normal = volt/verde, Sobrepeso = laranja, Obesidade = vermelho.

## 4. Stack consolidada

React 19 · Vite · **TypeScript** · react-router-dom v7 · **Tailwind v4** (substitui todo CSS vanilla) · framer-motion · recharts · **lucide-react** (padrão único de ícones; remover `react-icons`) · **zustand** (auth + tema/UI) · `@supabase/supabase-js` · `clsx` + `tailwind-merge` (util `cn`).

Dev: `typescript`, `typescript-eslint`, `@types/*`.

## 5. Arquitetura de pastas

```
src/
  app/         router.tsx, providers.tsx, layouts/ (AppShell sidebar+topbar, AuthLayout)
  components/
    ui/        Button, Input, Select, Card, StatCard, Badge, Modal, Table, Tabs,
               Dropdown, Tooltip, Skeleton, EmptyState, Toast, Pagination
    charts/    LineEvolution, BarTrend, Donut, RadarCompare (wrappers recharts)
    layout/    Sidebar, Topbar, ThemeToggle, ProfileMenu
  features/    auth/ · dashboard/ · alunos/ · turmas/ · avaliacoes/  (páginas + hooks)
  data/
    repositories/  contrato (interfaces TS): alunos, turmas, avaliacoes, metricas, auth
    adapters/mock/      (seed realista + persistência localStorage)
    adapters/supabase/  (queries reais, pronto p/ plugar)
    index.ts            seleciona adapter via VITE_DATA_SOURCE (mock | supabase)
    seed/
  domain/      metrics.ts (IMC/RCE/classificação) · types.ts (interfaces de domínio)
  stores/      authStore.ts, uiStore.ts (tema, sidebar)
  lib/         supabase.ts, cn.ts, format.ts, csv.ts
  styles/      tokens.css (Performance Lab) + index.css (tailwind + tema)
db/            migrations SQL + seed (entregável, não-runtime)
```

## 6. Camada de dados

- **Contrato de repositórios** (interfaces TS): `alunos.list/get/create/update/remove/evolution`, `turmas.*`, `avaliacoes.*`, `metricas.list`, `auth.signIn/signUp/signOut/current/onChange`.
- **Adapter mock:** dados semeados realistas (≈150 alunos, turmas, avaliações com séries temporais), persistido em `localStorage` (CRUD sobrevive a refresh). Latência simulada para exibir loading states.
- **Adapter supabase:** mapeia schema normalizado `aluno → avaliacao → metrica_avaliacao` ↔ modelo de domínio achatado consumido pela UI.
- **Seleção via env:** `VITE_DATA_SOURCE=mock` (default) | `supabase`.
- **`domain/metrics.ts`:** cálculo central de IMC, RCE, classificação, definição de métricas (chave, rótulo, unidade, ordenação melhor=asc/desc). Remove duplicação atual.

## 7. Modelo de domínio (tipos)

`Aluno { id, nome, genero, dataNascimento, idade(derivado), turmaId?, peso, altura, cintura, imc(derivado), rce(derivado), classificacaoImc(derivado), metricas: RegistroMetricas }`
`RegistroMetricas { flexibilidade, potMMII, potMS, velocidade, agilidade, abdominal, resistencia }`
`Turma { id, nome, anoLetivo, professorId, totalAlunos(derivado) }`
`Avaliacao { id, alunoId, data, mesReferencia, anoReferencia, observacoes?, metricas }`
`PontoEvolucao { data, mesReferencia, metrica, valor }`
`Perfil = 'aluno' | 'professor' | 'personal'`
`Usuario { id, nome, email, perfil, ... }`

## 8. Auth & rotas

- `authStore` (zustand) conectado; `auth` adapter: **login demo ativo** (seletor de perfil) + Supabase real pronto.
- `ProtectedRoute` protege `/app/*`; perfil define nav/dashboard.
- Rotas: `/` (landing) · `/login` · `/cadastro` · `/forgot` · `/app` (shell) → `overview`, `alunos`, `alunos/:id`, `turmas`, `avaliacoes`, `ranking` (gated por perfil).
- **Perfis:** professor & personal compartilham experiência de educador; **aluno** = visão somente-leitura "minha evolução".

## 9. Estados de UI

Todo módulo trata explicitamente: **loading** (skeletons), **empty** (EmptyState com CTA), **error** (mensagem + retry), **success** (toasts). Validação de formulários com mensagens por campo.

## 10. Acessibilidade & responsividade

Contraste AA, navegação por teclado, `:focus-visible`, labels/aria corretos, semântica HTML, áreas de toque confortáveis, breakpoints reais (sidebar colapsa, tabelas com scroll/empilhamento), sem overflow indevido.

## 11. Escopo faseado (cada fase roda)

- **Fase 0 — Fundação:** TS + Tailwind v4 + tokens Performance Lab + `cn()` + primitivos UI + app shell (sidebar/topbar/tema) + router; aposenta `fleximetrics2`.
- **Fase 1 — Dados + auth:** repositórios + adapter mock + seed + `domain/metrics`; authStore + login demo + ProtectedRoute; esqueleto adapter Supabase; migrations/seed SQL.
- **Fase 2 — Dashboard analítico (role-aware):** porta/generaliza o dashboard do `fleximetrics2` sobre a camada de dados + design system; KPIs, gráficos, ranking, filtros; loading/empty/error.
- **Fase 3 — Alunos:** lista (tabela, busca, ordenação, filtros, paginação) + modal CRUD validado + detalhe com evolução temporal + CSV.
- **Fase 4 — Turmas & Avaliações:** CRUD turmas + overview; fluxo de avaliação (registrar métricas por aluno/período) alimentando evolução.
- **Fase 5 — Aluno + polish:** visões do aluno; landing redesenhada; animações, a11y, QA responsivo; lint/build verdes.

## 12. Critérios de aceite

Sistema claramente superior ao inicial; dashboard do `fleximetrics2` integrado de forma inteligente; UI muito mais forte/moderna; arquitetura limpa/escalável; fluxos principais completos; objetivo do produto claro; camada de dados pronta para Supabase real; loading/empty/error tratados; responsivo + acessível; `npm run build` e `npm run lint` sem erros; parece produto de mercado.

## 13. Riscos / pontos de atenção

- Backend Supabase precisará ser recriado pelo usuário; entregamos migrations/seed e adapter, validação real fica pendente até credenciais novas.
- Migração para TS pode exigir ajustes de tipos em libs (recharts/framer-motion) — usar tipos oficiais.
- Demo roda em `VITE_DATA_SOURCE=mock`; trocar para `supabase` exige projeto provisionado.

## 14. Não-objetivos (YAGNI)

Sem testes E2E/CI, sem i18n, sem RBAC server-side completo, sem features fora do domínio fitness, sem multi-tenant de produção nesta entrega.
