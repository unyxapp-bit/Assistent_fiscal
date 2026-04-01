# Fiscal Assistant Web

Reescrita do app Flutter para React + TypeScript, mantendo Supabase como backend.

## Stack

- Vite + React + TypeScript
- React Router para rotas
- TanStack Query para dados
- Zustand para estado local
- Supabase (`@supabase/supabase-js`)
- Tailwind CSS para UI

## Scripts

- `npm run dev`: inicia ambiente local
- `npm run build`: build de produção
- `npm run preview`: pré-visualização

## Variáveis de ambiente

Crie um `.env` com:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Observação

A migração começa com rotas e layout básicos. Cada módulo será reescrito
progressivamente com base nos arquivos de `Codigos antigos`.
