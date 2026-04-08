# Arquitetura do Projeto

## Visão Geral

O projeto utiliza uma arquitetura modular com separação clara de responsabilidades.

## Estrutura de Pastas

```
src/
├── components/      # Componentes visuais
├── hooks/          # Custom hooks (lógica reutilizável)
├── lib/            # Configurações e inicializações
├── pages/          # Páginas (views)
├── services/      # Comunicação com APIs externas
├── stores/         # Estado global (Zustand)
└── types/          # Definições de tipos (JSDoc)
```

## Camadas da Aplicação

### 1. Pages (View)
- Representam as páginas da aplicação
- Contêm apenas lógica de UI
- Conectam com hooks para lógica de negócio

### 2. Hooks
- Contêm lógica de negócio reutilizável
- Abstract away complex logic
- Used by pages and components

### 3. Services
- Comunicação com APIs externas
- Contêm a lógica de acesso a dados
- Ex: `authService.js` - comunicação com Supabase Auth

### 4. Stores (Zustand)
- Estado global da aplicação
- Compartilhado entre toda a aplicação
- Atualizado pelos services

### 5. Components
- Componentes visuais reutilizáveis
- Não contêm lógica de negócio
- Recebem dados via props

## Fluxo de Dados

```
User Action → Page → Hook → Service → Supabase
                      ↓
                  Store (atualiza estado)
                      ↓
                  UI (re-render)
```

## Autenticação

### Estrutura

- **authStore**: Estado global de autenticação
- **authService**: Comunicação com Supabase Auth
- **useAuth**: Hook para acessar autenticação

### Fluxo de Login

1. User preenche formulário em `Home`
2. `useAuth.login()` é chamado
3. `authService.signIn()` comunica com Supabase
4. `authStore` é atualizado
5. UI reflete novo estado

### Fluxo de Cadastro

1. User preenche formulário em `Cadastro`
2. `useAuth.register()` é chamado
3. `authService.signUp()` cria usuário no Auth
4. `authService.createUserProfile()` insere na tabela correta
5. User é redirecionado

## Padrões de Código

### Nomenclatura

- **Arquivos**: kebab-case (`auth-service.js`)
- **Componentes**: PascalCase (`LoginForm.jsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.js`)
- **Stores**: camelCase com sufixo `Store` (`authStore.js`)

### JSDoc

Todos os arquivos devem ter documentação JSDoc:

```javascript
/**
 * Descrição da função
 * @param {string} param1 - Descrição do parâmetro
 * @returns {Promise<Object>} - Descrição do retorno
 */
```

## Estado Global (Zustand)

### AuthStore

```javascript
{
  user: Object | null,
  session: Object | null,
  loading: boolean,
  error: string | null,
  isAuthenticated: boolean
}
```

### Actions

- `initialize()` - Inicializa e verifica sessão
- `setUser()` - Define usuário
- `setLoading()` - Define estado de loading
- `setError()` - Define erro
- `clearError()` - Limpa erro
- `reset()` - Reseta store

## Rotas

| Path | Componente | Descrição |
|------|------------|-----------|
| `/` | Home | Login |
| `/cadastro` | Cadastro | Registro |
| `/dashboard` | Dashboard | Área protegida |

## Próximos Passos

- [ ] Implementar ProtectedRoute
- [ ] Adicionar contexto de tema
- [ ] Criar store para dados dos alunos
- [ ] Implementar paginação
- [ ] Adicionar testes unitários
