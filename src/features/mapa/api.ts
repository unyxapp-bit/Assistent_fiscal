import { supabase } from '../../lib/supabase/client';

export type PacotePlantao = {
  id: string;
  fiscal_id: string;
  colaborador_id: string;
  data: string;
  criado_em?: string | null;
};

export type OutroSetor = {
  id: string;
  fiscal_id: string;
  colaborador_id: string;
  setor: string;
  data: string;
  criado_em?: string | null;
};

function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
    .getDate()
    .toString()
    .padStart(2, '0')}`;
}

export async function fetchPlantaoHoje(fiscalId: string) {
  const { data, error } = await supabase
    .from('pacote_plantao')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .eq('data', hojeIso())
    .order('criado_em', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PacotePlantao[];
}

export async function addPlantao(fiscalId: string, colaboradorId: string) {
  const { data, error } = await supabase
    .from('pacote_plantao')
    .insert({
      fiscal_id: fiscalId,
      colaborador_id: colaboradorId,
      data: hojeIso(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as PacotePlantao;
}

export async function removePlantao(id: string) {
  const { error } = await supabase.from('pacote_plantao').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchOutroSetorHoje(fiscalId: string) {
  const { data, error } = await supabase
    .from('outro_setor')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .eq('data', hojeIso())
    .order('criado_em', { ascending: true });
  if (error) throw error;
  return (data ?? []) as OutroSetor[];
}

export async function addOutroSetor(
  fiscalId: string,
  colaboradorId: string,
  setor: string
) {
  const { data, error } = await supabase
    .from('outro_setor')
    .insert({
      fiscal_id: fiscalId,
      colaborador_id: colaboradorId,
      setor,
      data: hojeIso(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as OutroSetor;
}

export async function removeOutroSetor(id: string) {
  const { error } = await supabase.from('outro_setor').delete().eq('id', id);
  if (error) throw error;
}
