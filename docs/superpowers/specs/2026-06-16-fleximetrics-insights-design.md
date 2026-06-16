# FlexiMetrics Insights Design

## Contexto

O FlexiMetrics agora usa apenas Supabase real. O schema disponivel no projeto cobre `usuario`, `professor`, `turma`, `aluno` e `avaliacao`. Portanto, este incremento nao cria tabelas novas e nao depende de persistencia adicional.

## Objetivo

Adicionar inteligencia operacional baseada nas avaliacoes existentes para ajudar professores a priorizarem alunos e ajudar alunos a entenderem seus proximos focos.

## Escopo

- Nova pagina `Insights` para professor/admin em `/app/insights`.
- Cards de resumo para alunos em atencao, avaliacoes atrasadas, regressao recente e destaques.
- Tabela acionavel com aluno, turma, ultimo registro, sinais encontrados e foco recomendado.
- Enriquecimento da tela `Minha evolucao` do aluno com um bloco de proximos focos.

## Regras De Produto

- Um aluno fica com avaliacao atrasada quando nao tem avaliacao ou quando a ultima avaliacao tem mais de 45 dias.
- Uma regressao recente acontece quando a ultima avaliacao piora em relacao a anterior em alguma metrica fisica, respeitando a direcao de cada metrica.
- Um destaque acontece quando a ultima avaliacao melhora em relacao a anterior em alguma metrica fisica.
- O foco recomendado prioriza regressao, depois composicao corporal em atencao, depois consistencia de avaliacao.

## Dados

Todas as leituras usam os repositorios existentes:

- `data.alunos.list()`
- `data.turmas.list()`
- `data.avaliacoes.listAll()`
- `data.avaliacoes.listByAluno(alunoId)`

## Fora De Escopo

- Persistir metas, planos ou tarefas.
- Criar novas tabelas Supabase.
- Inventar politicas RLS.
- Usar mock data.
