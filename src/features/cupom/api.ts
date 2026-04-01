import { supabase } from '../../lib/supabase/client';

export type CupomConfig = Record<string, unknown> & {
  id?: string;
  fiscal_id?: string;
  created_at?: string;
  updated_at?: string;
};

export async function fetchCupomConfig(fiscalId: string) {
  const { data, error } = await supabase
    .from('cupom_configuracoes')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as CupomConfig | null;
}

export async function upsertCupomConfig(fiscalId: string, config: CupomConfig) {
  const payload = {
    ...config,
    fiscal_id: fiscalId,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('cupom_configuracoes')
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as CupomConfig;
}
