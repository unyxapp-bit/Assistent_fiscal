import { supabase } from '../../lib/supabase/client';

export type RegistroPonto = {
  id: string;
  colaborador_id: string;
  data: string;
  entrada?: string | null;
  intervalo_saida?: string | null;
  intervalo_retorno?: string | null;
  saida?: string | null;
  observacao?: string | null;
};

type CreateRegistroInput = {
  colaborador_id: string;
  data: string;
  entrada?: string | null;
  intervalo_saida?: string | null;
  intervalo_retorno?: string | null;
  saida?: string | null;
  observacao?: string | null;
};

type UpdateRegistroInput = {
  id: string;
  patch: Partial<RegistroPonto>;
};

export async function fetchRegistrosPorColaboradores(colaboradorIds: string[]) {
  if (colaboradorIds.length === 0) return [] as RegistroPonto[];
  const { data, error } = await supabase
    .from('registros_ponto')
    .select('*')
    .in('colaborador_id', colaboradorIds)
    .order('data', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RegistroPonto[];
}

export async function createRegistroPonto(input: CreateRegistroInput) {
  const { data, error } = await supabase
    .from('registros_ponto')
    .insert({
      colaborador_id: input.colaborador_id,
      data: input.data,
      entrada: input.entrada ?? null,
      intervalo_saida: input.intervalo_saida ?? null,
      intervalo_retorno: input.intervalo_retorno ?? null,
      saida: input.saida ?? null,
      observacao: input.observacao ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as RegistroPonto;
}

export async function updateRegistroPonto({ id, patch }: UpdateRegistroInput) {
  const { data, error } = await supabase
    .from('registros_ponto')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as RegistroPonto;
}

export async function deleteRegistroPonto(id: string) {
  const { error } = await supabase.from('registros_ponto').delete().eq('id', id);
  if (error) throw error;
}
