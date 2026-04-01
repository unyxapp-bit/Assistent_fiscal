import { supabase } from '../../lib/supabase/client';
import type { Alocacao } from '../../shared/types';

export async function fetchAlocacoesAtivas(fiscalId: string) {
  const { data, error } = await supabase
    .from('alocacoes')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .eq('status', 'ativo')
    .order('alocado_em', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Alocacao[];
}

export async function createAlocacao(params: {
  fiscalId: string;
  colaboradorId: string;
  caixaId: string;
  observacoes?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('alocacoes')
    .insert({
      fiscal_id: params.fiscalId,
      colaborador_id: params.colaboradorId,
      caixa_id: params.caixaId,
      alocado_em: now,
      horario_inicio: now,
      data_alocacao: now.substring(0, 10),
      status: 'ativo',
      observacoes: params.observacoes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Alocacao;
}

export async function liberarAlocacao(params: {
  alocacaoId: string;
  motivo: string;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('alocacoes')
    .update({
      liberado_em: now,
      horario_fim: now,
      status: 'finalizado',
      motivo_liberacao: params.motivo,
    })
    .eq('id', params.alocacaoId)
    .select()
    .single();
  if (error) throw error;
  return data as Alocacao;
}

export async function jaUsouCaixaHoje(params: {
  colaboradorId: string;
  caixaId: string;
}) {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 1);

  const { data, error } = await supabase
    .from('alocacoes')
    .select('id, motivo_liberacao')
    .eq('colaborador_id', params.colaboradorId)
    .eq('caixa_id', params.caixaId)
    .gte('alocado_em', inicio.toISOString())
    .lt('alocado_em', fim.toISOString());

  if (error) throw error;

  return (data ?? []).some((row: { motivo_liberacao?: string | null }) => {
    const motivo = row.motivo_liberacao?.toLowerCase();
    return motivo !== 'cafe' && motivo !== 'intervalo';
  });
}
