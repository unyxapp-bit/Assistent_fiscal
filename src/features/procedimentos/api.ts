import { supabase } from '../../lib/supabase/client';

export type Procedimento = {
  id: string;
  fiscal_id: string;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  passos?: string[] | null;
  favorito?: boolean | null;
  tempo_estimado?: number | null;
};

export async function fetchProcedimentos(fiscalId: string) {
  const { data, error } = await supabase
    .from('procedimentos')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as Procedimento[];
}

export async function criarProcedimento(params: {
  fiscalId: string;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  passos?: string[];
  tempoEstimado?: number | null;
}) {
  const { data, error } = await supabase
    .from('procedimentos')
    .insert({
      fiscal_id: params.fiscalId,
      titulo: params.titulo,
      descricao: params.descricao ?? null,
      categoria: params.categoria ?? 'rotina',
      passos: params.passos ?? [],
      favorito: false,
      tempo_estimado: params.tempoEstimado ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Procedimento;
}

export async function atualizarProcedimento(id: string, patch: Partial<Procedimento>) {
  const { data, error } = await supabase
    .from('procedimentos')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Procedimento;
}

export async function deletarProcedimento(id: string) {
  const { error } = await supabase.from('procedimentos').delete().eq('id', id);
  if (error) throw error;
}
