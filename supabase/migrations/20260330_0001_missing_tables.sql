-- ============================================================
-- Missing tables + columns for Fiscal Assistant (idempotent)
-- ============================================================

-- 1) OCORRENCIAS
CREATE TABLE IF NOT EXISTS public.ocorrencias (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo              TEXT NOT NULL DEFAULT '',
  descricao         TEXT NOT NULL DEFAULT '',
  gravidade         TEXT NOT NULL DEFAULT 'media',
  resolvida         BOOLEAN NOT NULL DEFAULT FALSE,
  registrada_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolvida_em      TIMESTAMPTZ,
  caixa_id          TEXT,
  caixa_nome        TEXT,
  colaborador_id    TEXT,
  colaborador_nome  TEXT,
  foto_url          TEXT,
  foto_nome         TEXT,
  arquivo_url       TEXT,
  arquivo_nome      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ocorrencias_fiscal_data_idx
  ON public.ocorrencias (fiscal_id, registrada_em DESC);

ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_ocorrencias" ON public.ocorrencias
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) EVENTOS TURNO
CREATE TABLE IF NOT EXISTS public.eventos_turno (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo              TEXT NOT NULL,
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  colaborador_nome  TEXT,
  caixa_nome        TEXT,
  detalhe           TEXT
);

CREATE INDEX IF NOT EXISTS eventos_turno_fiscal_ts_idx
  ON public.eventos_turno (fiscal_id, timestamp ASC);

ALTER TABLE public.eventos_turno ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_eventos_turno" ON public.eventos_turno
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) RELATORIOS DIA
CREATE TABLE IF NOT EXISTS public.relatorios_dia (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_str            TEXT NOT NULL,
  turno_iniciado_em   TIMESTAMPTZ NOT NULL,
  turno_encerrado_em  TIMESTAMPTZ NOT NULL,
  total_alocacoes     INTEGER NOT NULL DEFAULT 0,
  total_colaboradores INTEGER NOT NULL DEFAULT 0,
  total_cafes         INTEGER NOT NULL DEFAULT 0,
  total_intervalos    INTEGER NOT NULL DEFAULT 0,
  total_empacotadores INTEGER NOT NULL DEFAULT 0,
  eventos_json        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS relatorios_dia_fiscal_data_idx
  ON public.relatorios_dia (fiscal_id, turno_iniciado_em DESC);

ALTER TABLE public.relatorios_dia ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_relatorios_dia" ON public.relatorios_dia
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) PASSAGENS TURNO
CREATE TABLE IF NOT EXISTS public.passagens_turno (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resumo        TEXT NOT NULL DEFAULT '',
  pendencias    TEXT NOT NULL DEFAULT '',
  recados       TEXT NOT NULL DEFAULT '',
  registrada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS passagens_turno_fiscal_data_idx
  ON public.passagens_turno (fiscal_id, registrada_em DESC);

ALTER TABLE public.passagens_turno ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_passagens_turno" ON public.passagens_turno
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) PACOTE PLANTAO
CREATE TABLE IF NOT EXISTS public.pacote_plantao (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  colaborador_id TEXT NOT NULL,
  data           DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pacote_plantao_fiscal_data_idx
  ON public.pacote_plantao (fiscal_id, data DESC);

ALTER TABLE public.pacote_plantao ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_pacote_plantao" ON public.pacote_plantao
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6) OUTRO SETOR
CREATE TABLE IF NOT EXISTS public.outro_setor (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  colaborador_id TEXT NOT NULL,
  setor          TEXT NOT NULL DEFAULT '',
  data           DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS outro_setor_fiscal_data_idx
  ON public.outro_setor (fiscal_id, data DESC);

ALTER TABLE public.outro_setor ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_outro_setor" ON public.outro_setor
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) COLUNA FALTANTE EM ALOCACOES
ALTER TABLE public.alocacoes
  ADD COLUMN IF NOT EXISTS intervalo_marcado_feito BOOLEAN NOT NULL DEFAULT FALSE;
