-- ============================================================
-- Dashboard layout preferences (drag-and-drop order)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_key   TEXT NOT NULL,
  layout_json  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fiscal_id, layout_key)
);

CREATE INDEX IF NOT EXISTS dashboard_layouts_fiscal_key_idx
  ON public.dashboard_layouts (fiscal_id, layout_key);

ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fiscal_rls_dashboard_layouts" ON public.dashboard_layouts
    USING (fiscal_id = auth.uid())
    WITH CHECK (fiscal_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
