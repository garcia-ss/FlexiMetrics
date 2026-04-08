# Schema do Banco de Dados

## Visão Geral

O projeto utiliza **Supabase** como backend, com **PostgreSQL** como banco de dados.

## Tabelas

### 1. professor

Armazena dados de professores e personal trainers.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY, REFERENCES auth.users |
| nome | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| telefone | text | NULLABLE |
| data_nascimento | date | NULLABLE |
| genero | text | NULLABLE |
| ocupacao | text | NOT NULL |
| escola | text | NULLABLE |
| created_at | timestamp | DEFAULT now() |

### 2. aluno

Armazena dados dos alunos.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY |
| turma_id | uuid | REFERENCES turma(id), NULLABLE |
| nome | text | NOT NULL |
| data_nascimento | date | NULLABLE |
| sexo | text | NULLABLE |
| created_at | timestamp | DEFAULT now() |

### 3. turma

Agrupa alunos em turmas.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY |
| professor_id | uuid | REFERENCES professor(id) |
| nome | text | NOT NULL |
| ano_letivo | text | NULLABLE |
| created_at | timestamp | DEFAULT now() |

### 4. avaliacao

Registra avaliações dos alunos.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY |
| aluno_id | uuid | REFERENCES aluno(id) |
| data_avaliacao | date | NOT NULL |
| mes_referencia | text | NOT NULL |
| ano_referencia | integer | NOT NULL |
| observacoes | text | NULLABLE |
| created_at | timestamp | DEFAULT now() |

### 5. tipo_metrica

Define os tipos de métricas disponíveis.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY |
| nome | text | NOT NULL |
| unidade | text | NOT NULL |
| categoria | text | NOT NULL |

### 6. metrica_avaliacao

Valores das métricas em cada avaliação.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY |
| avaliacao_id | uuid | REFERENCES avaliacao(id) |
| tipo_metrica_id | uuid | REFERENCES tipo_metrica(id) |
| valor | numeric | NOT NULL |

### 7. evolucao_aluno

Histórico de evolução dos alunos.

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | uuid | PRIMARY KEY |
| aluno_id | uuid | REFERENCES aluno(id) |
| turma | text | NULLABLE |
| professor_id | uuid | REFERENCES professor(id) |
| mes_referencia | text | NOT NULL |
| ano_referencia | integer | NOT NULL |
| data_avaliacao | date | NOT NULL |
| metrica | text | NOT NULL |
| valor | numeric | NOT NULL |

## Relacionamentos

```
professor (1) ──── (N) turma
turma (1) ──── (N) aluno
aluno (1) ──── (N) avaliacao
aluno (1) ──── (N) evolucao_aluno
avaliacao (1) ──── (N) metrica_avaliacao
tipo_metrica (1) ──── (N) metrica_avaliacao
```

## Row Level Security (RLS)

### Políticas

- Professores só veem seus próprios dados
- Alunos só veem dados da sua turma
- Dados são filtrados por `professor_id`

### Configuração Recomendada

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucao_aluno ENABLE ROW LEVEL SECURITY;

-- Políticas para professor
CREATE POLICY "Professores veem alunos próprios"
ON aluno FOR ALL
USING (turma_id IN (
  SELECT id FROM turma WHERE professor_id = auth.uid()
));
```

## Índices Recomendados

```sql
CREATE INDEX idx_aluno_turma ON aluno(turma_id);
CREATE INDEX idx_avaliacao_aluno ON avaliacao(aluno_id);
CREATE INDEX idx_evolucao_aluno ON evolucao_aluno(aluno_id);
CREATE INDEX idx_metrica_avaliacao ON metrica_avaliacao(avaliacao_id);
```

## Views Úteis

### View de evolução completa

```sql
CREATE VIEW v_evolucao_completa AS
SELECT 
  e.id,
  e.aluno_id,
  a.nome as aluno_nome,
  t.nome as turma,
  e.mes_referencia,
  e.ano_referencia,
  e.metrica,
  e.valor
FROM evolucao_aluno e
JOIN aluno a ON e.aluno_id = a.id
LEFT JOIN turma t ON a.turma_id = t.id;
```
