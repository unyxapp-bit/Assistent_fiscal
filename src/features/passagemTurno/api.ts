import { supabase } from '../../lib/supabase/client';

export type PassagemTurno = {
  id: string;
  fiscal_id: string;
  resumo: string;
  pendencias: string;
  recados: string;
  registrada_em: string;
};

export async function fetchPassagens(fiscalId: string) {
  const { data, error } = await supabase
    .from('passagens_turno')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('registrada_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PassagemTurno[];
}

export async function criarPassagem(params: {
  fiscalId: string;
  resumo: string;
  pendencias: string;
  recados: string;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('passagens_turno')
    .insert({
      fiscal_id: params.fiscalId,
      resumo: params.resumo,
      pendencias: params.pendencias,
      recados: params.recados,
      registrada_em: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PassagemTurno;
}

export async function deletarPassagem(id: string) {
  const { error } = await supabase.from('passagens_turno').delete().eq('id', id);
  if (error) throw error;
}
