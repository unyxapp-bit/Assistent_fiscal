# Supabase Migrations

Execute os arquivos em `supabase/migrations` no SQL Editor do Supabase.
Eles são idempotentes e completam as tabelas usadas pelo app Flutter.

Ordem sugerida:
1. `20260330_0001_missing_tables.sql`

As tabelas já existentes continuam válidas; este arquivo apenas cria as
faltantes e adiciona a coluna `intervalo_marcado_feito` em `alocacoes`.
