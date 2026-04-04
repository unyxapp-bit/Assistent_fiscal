-- ============================================================
-- Upload de anexos (notas/ocorrencias) + bucket de storage
-- ============================================================

-- 1) Colunas de anexos em notas
ALTER TABLE public.notas
  ADD COLUMN IF NOT EXISTS foto_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_nome TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_url TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_nome TEXT;

-- 2) Garantia de colunas de nome em ocorrencias (idempotente)
ALTER TABLE public.ocorrencias
  ADD COLUMN IF NOT EXISTS foto_nome TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_nome TEXT;

-- 3) Bucket de anexos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('anexos', 'anexos', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- 4) Policies de storage por pasta do usuario: <auth.uid()>/...
DO $$
BEGIN
  CREATE POLICY "fiscal_anexos_select_own"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'anexos'
      AND split_part(name, '/', 1) = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "fiscal_anexos_insert_own"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'anexos'
      AND split_part(name, '/', 1) = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "fiscal_anexos_update_own"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
      bucket_id = 'anexos'
      AND split_part(name, '/', 1) = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'anexos'
      AND split_part(name, '/', 1) = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "fiscal_anexos_delete_own"
    ON storage.objects FOR DELETE TO authenticated
    USING (
      bucket_id = 'anexos'
      AND split_part(name, '/', 1) = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
