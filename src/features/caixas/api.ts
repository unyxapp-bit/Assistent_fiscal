import { supabase } from '../../lib/supabase/client';
import type { Caixa, TipoCaixa } from '../../shared/types';

export async function fetchCaixas(fiscalId: string) {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('numero');
  if (error) throw error;
  return (data ?? []) as Caixa[];
}

export async function createCaixa(params: {
  fiscalId: string;
  numero: number;
  tipo: TipoCaixa;
}) {
  const { data, error } = await supabase
    .from('caixas')
    .insert({
      fiscal_id: params.fiscalId,
      numero: params.numero,
      tipo: params.tipo,
      ativo: true,
      em_manutencao: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Caixa;
}

export async function updateCaixa(id: string, patch: Partial<Caixa>) {
  const { data, error } = await supabase
    .from('caixas')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Caixa;
}
