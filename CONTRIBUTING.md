# Guia de Contribuição

## Como Começar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Copie `.env.example` para `.env` e configure
4. Inicie o dev server: `npm run dev`

## Branches

| Branch | Propósito |
|--------|-----------|
| `main` | Código em produção |
| `develop` | Código em desenvolvimento |
| `feature/*` | Novas funcionalidades |
| `fix/*` | Correções de bugs |

## Fluxo de Trabalho

### 1. Criar Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/minha-funcionalidade
```

### 2. Desenvolver

- Escreva código limpo e documentado
- Siga os padrões do projeto
- Commit frequentemente com mensagens claras

### 3. Commit Messages

```
feat: adicionar tela de dashboard
fix: corrigir validação de email
docs: atualizar README
style: ajustar espaçamento do formulário
refactor: extrair lógica de auth para service
test: adicionar testes de integração
```

### 4. Pull Request

- Título claro e descritivo
- Descrição do que foi mudado
- Link para issue relacionada (se houver)
- Screenshots se aplicável

## Padrões de Código

### JavaScript

- Use `const` por padrão, `let` quando necessário
- Evite `var`
- Use arrow functions
- Importe em ordem: externos → internos → relativos

### React

```jsx
// ✅ Bom
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// ❌ Evitar
import React, { useState } from 'react';
```

### CSS

- Use classes com prefixo do componente
- Agrupe propriedades similares
- Use variáveis CSS para cores/tamanhos

## Testing

### Antes de Commitar

```bash
npm run lint
```

### Estrutura de Testes (futuro)

```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── services/
```

## Issues

- Use templates de issue
- Descreva o problema claramente
- Inclua passos para reproduzir
- Adicione screenshots quando possível

## Perguntas?

Abra uma issue com a tag `question`
