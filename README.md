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

O **FlexiMetrics** é uma plataforma na modalidade *Software as a Service (SaaS)* voltada para profissionais de educação física, personal trainers e gestores de treinamento. O sistema tem como objetivo principal a gestão eficiente de métricas de desempenho físico, automatizando o registro de avaliações corporais (IMC, RCE, flexibilidade, agilidade, potência, etc.) e substituindo a utilização obsoleta de planilhas e controles em papel.

A solução foca na visualização de dados do aluno a longo prazo, através de dashboards analíticos (conceito *Performance Lab*), facilitando a percepção de evolução e auxiliando na retenção de alunos.

---

## Documentação Complementar

A documentação completa do projeto, contemplando aspectos negociais e técnicos, encontra-se disponível na pasta `docs/` e em arquivos dedicados na raiz do repositório:

- 📄 **[Resumo Executivo (PDF)](./Resumo_Executivo_FlexiMetrics.pdf)** — Visão negocial, público-alvo, benefícios e protótipo visual atualizado.
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
| **Backend / BaaS** | Supabase (PostgreSQL, Autenticação) |
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
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd FlexiMetrics
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Execute o projeto em ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em [http://localhost:5173](http://localhost:5173).

### Execução de Testes

Para rodar a suíte de testes unitários desenvolvidos (ex: métricas e KPIs):

```bash
npm run test
```

---

## Ajustes Realizados a Partir de Feedbacks (Segunda Menção)

Atendendo às observações das etapas anteriores e buscando a evolução do sistema, os seguintes ajustes foram implementados para esta entrega:

- **Implementação do Mock Adapter:** Adicionado um adaptador de dados em memória e `localStorage` (`src/data/adapters/mock`) para garantir que o sistema possa ser avaliado e demonstrado plenamente sem dependência de internet ou infraestrutura de rede externa no dia da apresentação.

- **Revisão da Interface (Performance Lab):** Refinamento do layout em modo escuro (*Dark Mode*) utilizando Tailwind CSS v4, melhorando o contraste e a usabilidade dos gráficos e do painel de ranqueamento, conforme sugerido nas validações de UI/UX.

- **Cálculos de Avaliação Automatizados:** Correção e adição de testes unitários (`src/domain/metrics.test.ts`) nas lógicas de cálculo de IMC e RCE para garantir 100% de precisão nos formulários de cadastro de avaliação.

- **Resumo Executivo Editável/PDF:** A documentação negocial principal foi padronizada no formato exigido pela disciplina, abordando de forma mais clara a proposta de valor e a conversão de métricas analógicas para o meio digital.

---

## Quadro de Contribuições Individuais

| Integrante | Atividades Desenvolvidas | Evidências / Observações |
|---|---|---|
| **Danilo Pereira Peixoto** | Rebranding da solução no UI/UX, desenvolvimento do Dashboard principal, integração dos gráficos (Recharts) e painel de Ranking entre alunos. | Histórico de commits (Componentes Visuais, `DashboardPage.tsx`), telas no Figma e arquivos nas pastas `src/components/layout/` e `src/components/charts/`. |
| **Matheus Serra Lourenço** | Desenvolvimento de UI/UX, criação das lógicas de negócio do domínio, desenvolvimento da tela de Avaliações e implementação de testes automatizados. | Histórico de commits, telas no Figma, arquivos `src/features/avaliacoes/` e rotinas de teste (`metrics.test.ts`). |
| **Pedro dos Santos Garcia** | Configuração inicial do ambiente Vite/TS, integração de arquitetura (Repository Pattern), Mock Adapter, integração Supabase e CI/CD, auxílio no desenvolvimento de UI/UX e responsável pela documentação do Resumo Executivo. | Histórico de commits, arquivos em `src/data/adapters/`, configurações de ambiente/Supabase e `Resumo_Executivo_FlexiMetrics.pdf`. |
| **Rodrigo Angelim da Cunha** | Idealização e estruturação do Banco de Dados e Backend, documentação do Resumo Executivo. | Histórico de commits, modelagem do banco (`DATABASE.md`), arquivos de backend e `Resumo_Executivo_FlexiMetrics.pdf`. |
| **Vinicius Machado** | Responsável pela documentação técnica (Arquitetura, BD), gerenciamento de estados no Zustand, roteamento e idealização e estruturação do Banco de Dados e Backend. | Histórico de commits, arquivos em `docs/`, `src/stores/` e estruturação geral do `README.md`. |

---

> Projeto acadêmico desenvolvido para a **Faculdade de Tecnologia e Ciências Sociais Aplicadas — CEUB** (Junho de 2026).