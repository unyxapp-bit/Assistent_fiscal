import { supabase } from '../../lib/supabase/client';
import type { PausaCafe } from '../../shared/types';

export async function fetchPausas(fiscalId: string, inicioDiaIso: string) {
  const { data, error } = await supabase
    .from('pausas_cafe')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .gte('iniciado_em', inicioDiaIso)
    .order('iniciado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PausaCafe[];
}

export async function criarPausa(params: {
  fiscalId: string;
  colaboradorId: string;
  colaboradorNome: string;
  caixaId?: string | null;
  duracaoMinutos: number;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('pausas_cafe')
    .insert({
      fiscal_id: params.fiscalId,
      colaborador_id: params.colaboradorId,
      colaborador_nome: params.colaboradorNome,
      caixa_id: params.caixaId ?? null,
      iniciado_em: now,
      duracao_minutos: params.duracaoMinutos,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PausaCafe;
}

export async function finalizarPausa(params: { pausaId: string; finalizadoEm?: string }) {
  const { data, error } = await supabase
    .from('pausas_cafe')
    .update({ finalizado_em: params.finalizadoEm ?? new Date().toISOString() })
    .eq('id', params.pausaId)
    .select()
    .single();
  if (error) throw error;
  return data as PausaCafe;
}

export async function removerPausa(pausaId: string) {
  const { error } = await supabase.from('pausas_cafe').delete().eq('id', pausaId);
  if (error) throw error;
}

export async function limparHistoricoPausas(params: {
  fiscalId: string;
  inicioDiaIso: string;
}) {
  const { error } = await supabase
    .from('pausas_cafe')
    .delete()
    .eq('fiscal_id', params.fiscalId)
    .gte('iniciado_em', params.inicioDiaIso)
    .not('finalizado_em', 'is', null);
  if (error) throw error;
}
