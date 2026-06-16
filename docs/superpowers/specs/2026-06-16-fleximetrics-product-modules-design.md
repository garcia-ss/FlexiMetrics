# FlexiMetrics Product Modules Design

## Objetivo

Implementar os modulos 1 a 10 solicitados em versao funcional e compativel com o schema Supabase atual, sem criar tabelas novas e sem dados mock.

## Modulos

1. Relatorios: resumo por aluno/turma, CSV e impressao pelo navegador.
2. Detalhe da turma: KPIs, alunos, insights e historico agregado.
3. Vinculo de conta do aluno: atualizar `usuario.aluno_id`.
4. Perfil do professor: ler/editar dados de `professor`.
5. Historico avancado: timeline e comparacao de avaliacoes.
6. Metas: metas sugeridas derivadas de avaliacoes, sem persistencia propria.
7. Feedback: editar `avaliacao.observacoes` como feedback simples.
8. Notificacoes: notificacoes derivadas de atraso, regressao e destaque.
9. Importacao CSV: criar alunos reais em lote.
10. Painel admin: visao operacional de usuarios, professores e volume de dados.

## Regras

- Tudo que persistir deve usar tabelas existentes.
- Onde o schema ainda nao possui entidade propria, o modulo deve ser explicitamente derivado.
- Aluno acessa apenas paginas de leitura/autoacompanhamento.
- Professor/Admin acessam gestao operacional.
- Admin acessa painel e vinculos.

## Fora De Escopo

- Tabelas `meta_aluno`, `feedback_avaliacao` e `notificacao`.
- RLS nova.
- PDF nativo em backend.
- Mock data.
