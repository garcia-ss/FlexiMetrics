# FlexiMetrics

## Equipe

| Nome | RA |
|---|---|
| Danilo Pereira Peixoto | 22306862 |
| Matheus Serra Lourenço Coelho dos Santos | 22350663 |
| Pedro dos Santos Garcia | 22352266 |
| Rodrigo Angelim da Cunha | 22301488 |
| Vinicius Machado de Assunção | 22310815 |

---

## Sobre o Projeto

O **FlexiMetrics** é uma plataforma na modalidade *Software as a Service (SaaS)* voltada para profissionais de educação física e gestores de treinamento. O sistema tem como objetivo principal a gestão eficiente de métricas de desempenho físico, automatizando o registro de avaliações corporais (IMC, RCE, flexibilidade, agilidade, potência, etc.) e substituindo a utilização obsoleta de planilhas e controles em papel.

A solução foca na visualização de dados do aluno a longo prazo, através de dashboards analíticos (conceito *Performance Lab*), facilitando a percepção de evolução e auxiliando na retenção de alunos.

---

## Documentação Complementar

- 📄 **[Resumo Executivo (PDF)](./docs/Resumo%20Executivo%20-%20FlexiMetrics.pdf)** — Visão negocial, público-alvo, benefícios e protótipo visual atualizado.
- 🏗️ **[Arquitetura do Sistema](./ARCHITECTURE.md)** — Detalhamento da arquitetura técnica, padrões utilizados e infraestrutura.
- 🗄️ **[Modelagem de Banco de Dados](./DATABASE.md)** — Diagramas e descrição das entidades do PostgreSQL (Supabase).
- 🤝 **[Guia de Contribuição](./CONTRIBUTING.md)** — Padrões de código e fluxo de versionamento.

---

## Tecnologias Utilizadas

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **Estilização** | Tailwind CSS v4, Lucide React |
| **Gerenciamento de Estado** | Zustand |
| **Visualização de Dados** | Recharts, Framer Motion |
| **Backend / BaaS** | Supabase (PostgreSQL, Autenticação, RLS) |
| **Testes** | Vitest |

---

## Instruções de Execução

### Pré-requisitos

- Node.js (versão 18+ recomendada)
- Gerenciador de pacotes `npm`

### Instalação e Execução

1. Clone o repositório:
   ```bash
   git clone https://[seu-link-do-repositorio].git
   cd FlexiMetrics
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente — crie um arquivo `.env` na raiz com:
   ```env
   VITE_SUPABASE_URL=https://soeyfmnjuispbryslwiq.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon_key>
   ```
   > O frontend usa apenas o banco real do Supabase. As variáveis acima são obrigatórias para autenticação e acesso aos dados.

4. Execute o projeto:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em [http://localhost:5173](http://localhost:5173).

### Execução de Testes

```bash
npm run test
```

---

## Perfis de Acesso

O sistema possui três perfis com permissões distintas, controladas por Row Level Security (RLS) no Supabase:

| Perfil | Acesso |
|---|---|
| **Professor** | Gerencia suas próprias turmas, alunos e avaliações |
| **Aluno** | Visualiza apenas sua própria evolução e avaliações |
| **Admin** | Acesso total a todos os dados do sistema |

As contas de acesso devem existir no Supabase Auth e possuir um registro correspondente na tabela `usuario`.

---

## Banco de Dados

O schema do PostgreSQL (Supabase) é composto por cinco tabelas:

```
usuario      — perfil de autenticação (ligado ao auth.users)
professor    — perfil estendido do professor
turma        — grupos de alunos vinculados a um professor
aluno        — dados físicos e métricas de cada aluno
avaliacao    — avaliações mensais com histórico de evolução
```

### Fonte de dados

O sistema utiliza exclusivamente o PostgreSQL real via Supabase. O adaptador mock e o gerador de dados falsos foram removidos do frontend para evitar divergência entre código, schema e regras de acesso.

---

## Ajustes Realizados a Partir de Feedbacks (Segunda Menção)

- **Integração Supabase ativada:** O adapter de produção foi conectado ao banco PostgreSQL real, com schema alinhado ao modelo de domínio do frontend.

- **Row Level Security (RLS):** As permissões por perfil devem ser mantidas no projeto Supabase, usando os vínculos entre `auth.users`, `usuario`, `turma`, `aluno` e `avaliacao`.

- **Mock Adapter removido:** O frontend não possui mais modo offline com dados falsos; toda leitura e escrita passa pelo Supabase.

- **Revisão da Interface (Performance Lab):** Refinamento do layout em modo escuro utilizando Tailwind CSS v4, melhorando o contraste e usabilidade dos gráficos e do painel de ranqueamento.

- **Cálculos de Avaliação Automatizados:** Testes unitários em `src/domain/metrics.test.ts` garantem precisão nos cálculos de IMC e RCE.

---

## Quadro de Contribuições Individuais

| Integrante | Atividades Desenvolvidas | Evidências / Observações |
|---|---|---|
| **Danilo Pereira Peixoto** | Rebranding da solução no UI/UX, desenvolvimento do Dashboard principal, integração dos gráficos (Recharts) e painel de Ranking entre alunos. | Histórico de commits, telas no Figma, arquivos em `src/components/layout/` e `src/components/charts/`. |
| **Matheus Serra Lourenço** | Desenvolvimento de UI/UX, criação das lógicas de negócio do domínio, desenvolvimento da tela de Avaliações e implementação de testes automatizados. | Histórico de commits, telas no Figma, arquivos `src/features/avaliacoes/` e `metrics.test.ts`. |
| **Pedro dos Santos Garcia** | Configuração do ambiente Vite/TS, arquitetura Repository Pattern, Mock Adapter, integração Supabase, CI/CD e Resumo Executivo. | Histórico de commits, arquivos em `src/data/adapters/` e configurações de ambiente. |
| **Rodrigo Angelim da Cunha** | Idealização e estruturação do Banco de Dados, Backend e Resumo Executivo. | Histórico de commits, modelagem do banco (`DATABASE.md`). |
| **Vinicius Machado de Assunção** | Documentação técnica, gerenciamento de estado com Zustand, roteamento, estruturação do Banco de Dados e Backend. | Histórico de commits, arquivos em `docs/`, `src/stores/`. |

---

> Projeto acadêmico desenvolvido para a **Faculdade de Tecnologia e Ciências Sociais Aplicadas — CEUB** (Junho de 2026).
