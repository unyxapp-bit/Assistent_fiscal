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

export async function realocarAlocacao(params: {
  alocacaoId: string;
  caixaId: string;
  observacoes?: string | null;
}) {
  const patch: Record<string, unknown> = {
    caixa_id: params.caixaId,
  };

  if (typeof params.observacoes !== 'undefined') {
    patch.observacoes = params.observacoes?.trim() || null;
  }

  const { data, error } = await supabase
    .from('alocacoes')
    .update(patch)
    .eq('id', params.alocacaoId)
    .select()
    .single();
  if (error) throw error;
  return data as Alocacao;
}

export async function trocarCaixasAlocacoes(params: {
  alocacaoOrigemId: string;
  caixaOrigemId: string;
  alocacaoDestinoId: string;
  caixaDestinoId: string;
  motivo?: string | null;
}) {
  const motivo = params.motivo?.trim();
  const complemento = motivo ? `Troca de caixa: ${motivo}` : 'Troca de caixa';

  const [origemResp, destinoResp] = await Promise.all([
    supabase
      .from('alocacoes')
      .update({
        caixa_id: params.caixaDestinoId,
        observacoes: complemento,
      })
      .eq('id', params.alocacaoOrigemId)
      .select()
      .single(),
    supabase
      .from('alocacoes')
      .update({
        caixa_id: params.caixaOrigemId,
        observacoes: complemento,
      })
      .eq('id', params.alocacaoDestinoId)
      .select()
      .single(),
  ]);

  if (origemResp.error) throw origemResp.error;
  if (destinoResp.error) throw destinoResp.error;
  return [origemResp.data as Alocacao, destinoResp.data as Alocacao];
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

export type RetornoPosIntervalo = {
  pausaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  caixaId: string;
  finalizadoEm: string;
  duracaoMinutos: number;
};

export async function fetchRetornosPosIntervalo(params: {
  fiscalId: string;
  inicioDiaIso: string;
}) {
  const { data, error } = await supabase
    .from('pausas_cafe')
    .select('id, colaborador_id, colaborador_nome, caixa_id, finalizado_em, duracao_minutos')
    .eq('fiscal_id', params.fiscalId)
    .gte('iniciado_em', params.inicioDiaIso)
    .not('finalizado_em', 'is', null)
    .not('caixa_id', 'is', null)
    .order('finalizado_em', { ascending: false });

  if (error) throw error;

  const parsed: RetornoPosIntervalo[] = [];

  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const pausaId = typeof row.id === 'string' ? row.id : null;
    const colaboradorId =
      typeof row.colaborador_id === 'string' ? row.colaborador_id : null;
    const colaboradorNome =
      typeof row.colaborador_nome === 'string' ? row.colaborador_nome : null;
    const caixaId = typeof row.caixa_id === 'string' ? row.caixa_id : null;
    const finalizadoEm =
      typeof row.finalizado_em === 'string' ? row.finalizado_em : null;

    if (!pausaId || !colaboradorId || !colaboradorNome || !caixaId || !finalizadoEm) {
      continue;
    }

    parsed.push({
      pausaId,
      colaboradorId,
      colaboradorNome,
      caixaId,
      finalizadoEm,
      duracaoMinutos:
        typeof row.duracao_minutos === 'number' ? row.duracao_minutos : 15,
    });
  }

  return parsed;
}
