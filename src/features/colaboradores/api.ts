import { supabase } from '../../lib/supabase/client';
import type { Colaborador, DepartamentoTipo } from '../../shared/types';

type CreateColaboradorInput = {
  nome: string;
  departamento: DepartamentoTipo;
  telefone?: string | null;
  cargo?: string | null;
  cpf?: string | null;
  observacoes?: string | null;
};

type UpdateColaboradorInput = {
  id: string;
  patch: Partial<Colaborador>;
};

export async function fetchColaboradores(fiscalId: string) {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('nome');
  if (error) throw error;
  return (data ?? []) as Colaborador[];
}

export async function createColaborador(fiscalId: string, input: CreateColaboradorInput) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('colaboradores')
    .insert({
      fiscal_id: fiscalId,
      nome: input.nome,
      departamento: input.departamento,
      telefone: input.telefone ?? null,
      cargo: input.cargo ?? null,
      cpf: input.cpf ?? null,
      observacoes: input.observacoes ?? null,
      ativo: true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Colaborador;
}

export async function updateColaborador({ id, patch }: UpdateColaboradorInput) {
  const { data, error } = await supabase
    .from('colaboradores')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Colaborador;
}

export async function fetchColaboradorById(id: string) {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Colaborador | null;
}

export async function deleteColaborador(id: string) {
  const { error } = await supabase.from('colaboradores').delete().eq('id', id);
  if (error) throw error;
}
