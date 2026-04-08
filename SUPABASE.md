# Supabase - Guia de Integração

## Configuração

### 1. Obter Credenciais

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie `Project URL` e `anon public` key

### 2. Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Cliente Supabase

O cliente está configurado em `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## Autenticação

### Sign Up (Cadastro)

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign In (Login)

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out (Logout)

```javascript
const { error } = await supabase.auth.signOut();
```

### Obter Usuário Atual

```javascript
const { data: { user } } = await supabase.auth.getUser();
```

### Listener de Autenticação

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Usuário logado:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('Usuário deslogado');
  }
});
```

## Database

### Select (Consultar)

```javascript
const { data, error } = await supabase
  .from('aluno')
  .select('*')
  .eq('turma_id', 'uuid-da-turma');
```

### Insert (Inserir)

```javascript
const { data, error } = await supabase
  .from('aluno')
  .insert([
    { nome: 'João', turma_id: 'uuid-turma' }
  ]);
```

### Update (Atualizar)

```javascript
const { data, error } = await supabase
  .from('aluno')
  .update({ nome: 'João Silva' })
  .eq('id', 'uuid-do-aluno');
```

### Delete (Deletar)

```javascript
const { error } = await supabase
  .from('aluno')
  .delete()
  .eq('id', 'uuid-do-aluno');
```

## Filtros Comuns

| Método | Descrição |
|--------|-----------|
| `.eq('campo', valor)` | Igual a |
| `.neq('campo', valor)` | Diferente de |
| `.gt('campo', valor)` | Maior que |
| `.gte('campo', valor)` | Maior ou igual |
| `.lt('campo', valor)` | Menor que |
| `.lte('campo', valor)` | Menor ou igual |
| `.like('campo', '%valor%')` | LIKE |
| `.ilike('campo', '%valor%')` | LIKE (case insensitive) |
| `.in('campo', [a, b])` | Dentro de lista |
| `.is('campo', null)` | É nulo |
| `.order('campo')` | Ordenar |
| `.limit(10)` | Limitar resultados |

## Exemplo Completo

```javascript
// Buscar alunos com avaliações
const { data: alunos } = await supabase
  .from('aluno')
  .select(`
    *,
    turma (nome),
    avaliacao (data_avaliacao, metrica_avaliacao (valor, tipo_metrica (nome)))
  `)
  .eq('turma.professor_id', userId)
  .order('nome');
```

## Storage (Futuro)

```javascript
// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123/avatar.jpg', file);

// Download URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.jpg');
```

## Troubleshooting

### Erro CORS

Se receber erro de CORS, verifique:
1. URL do projeto está correta
2. Nonce está configurado (se usando Row Level Security)

### Erro de Autenticação

- Verifique se a chave anon está correta
- Confirme que RLS não está bloqueando requests

### Erro 406 (Not Acceptable)

- Verifique se as colunas existem na tabela
- Check se SELECT está pedindo colunas que não existem
