import { supabase } from '../../lib/supabase/client';

export type RelatorioDia = {
  id: string;
  fiscal_id: string;
  data_str: string;
  turno_iniciado_em: string;
  turno_encerrado_em: string;
  total_alocacoes: number;
  total_colaboradores: number;
  total_cafes: number;
  total_intervalos: number;
  total_empacotadores: number;
  eventos_json?: string | null;
  created_at?: string | null;
};

export async function fetchRelatorios(fiscalId: string) {
  const { data, error } = await supabase
    .from('relatorios_dia')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('turno_iniciado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RelatorioDia[];
}

export async function criarRelatorio(params: {
  fiscalId: string;
  data_str: string;
  turno_iniciado_em: string;
  turno_encerrado_em: string;
  total_alocacoes: number;
  total_colaboradores: number;
  total_cafes: number;
  total_intervalos: number;
  total_empacotadores: number;
  eventos_json?: string | null;
}) {
  const { data, error } = await supabase
    .from('relatorios_dia')
    .insert({
      fiscal_id: params.fiscalId,
      data_str: params.data_str,
      turno_iniciado_em: params.turno_iniciado_em,
      turno_encerrado_em: params.turno_encerrado_em,
      total_alocacoes: params.total_alocacoes,
      total_colaboradores: params.total_colaboradores,
      total_cafes: params.total_cafes,
      total_intervalos: params.total_intervalos,
      total_empacotadores: params.total_empacotadores,
      eventos_json: params.eventos_json ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as RelatorioDia;
}

export async function deletarRelatorio(id: string) {
  const { error } = await supabase.from('relatorios_dia').delete().eq('id', id);
  if (error) throw error;
}
