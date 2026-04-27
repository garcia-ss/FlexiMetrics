# FlexiMetrics

Sistema de gestão de métricas para personal trainers e professores de educação física.
Integrantes

## Este projeto foi desenvolvido pelo seguinte grupo:

   - Pedro dos Santos Garcia

   - Matheus Serra Lourenço Coelho dos Santos

   - Vinicius Machado de Assunção

   - Rodrigo Angelim

   - Danilo Pereira Peixoto

## Tecnologias

- **Frontend**: React 19 + Vite
- **Estilo**: CSS3
- **Estado**: Zustand
- **Backend**: Supabase (Auth + Database)
- **Roteamento**: React Router v7

## Getting Started

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Iniciar desenvolvimento

```bash
npm run dev
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run preview` | Preview da build de produção |
| `npm run lint` | Executa ESLint |

## Estrutura do Projeto

```
src/
├── components/      # Componentes React reutilizáveis
├── hooks/          # Custom hooks
├── lib/            # Configurações (Supabase client)
├── pages/          # Páginas da aplicação
├── services/       # Comunicação com APIs
├── stores/         # Estado global (Zustand)
├── types/          # Definições JSDoc
└── main.jsx        # Entry point
```

## Funcionalidades

- [x] Autenticação (Login/Cadastro)
- [ ] Gestão de Alunos
- [ ] Registo de Avaliações
- [ ] Acompanhamento de Evolução
- [ ] Dashboard com Métricas

## Documentação

- [Arquitetura](./ARCHITECTURE.md)
- [Banco de Dados](./DATABASE.md)
- [Supabase](./SUPABASE.md)
- [Contribuição](./CONTRIBUTING.md)

## Licença

Privado - Todos os direitos reservados
