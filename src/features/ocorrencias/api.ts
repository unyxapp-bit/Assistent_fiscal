import { supabase } from '../../lib/supabase/client';
import type { Ocorrencia } from '../../shared/types';

export async function fetchOcorrencias(fiscalId: string) {
  const { data, error } = await supabase
    .from('ocorrencias')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('registrada_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Ocorrencia[];
}

export async function criarOcorrencia(params: {
  fiscalId: string;
  tipo: string;
  descricao: string;
  gravidade: string;
  caixaId?: string | null;
  colaboradorId?: string | null;
  fotoUrl?: string | null;
  fotoNome?: string | null;
  arquivoUrl?: string | null;
  arquivoNome?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('ocorrencias')
    .insert({
      fiscal_id: params.fiscalId,
      tipo: params.tipo,
      descricao: params.descricao,
      gravidade: params.gravidade,
      caixa_id: params.caixaId ?? null,
      colaborador_id: params.colaboradorId ?? null,
      foto_url: params.fotoUrl ?? null,
      foto_nome: params.fotoNome ?? null,
      arquivo_url: params.arquivoUrl ?? null,
      arquivo_nome: params.arquivoNome ?? null,
      registrada_em: now,
      resolvida: false,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Ocorrencia;
}

export async function atualizarOcorrencia(id: string, patch: Partial<Ocorrencia>) {
  const { data, error } = await supabase
    .from('ocorrencias')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Ocorrencia;
}

export async function deletarOcorrencia(id: string) {
  const { error } = await supabase.from('ocorrencias').delete().eq('id', id);
  if (error) throw error;
}
