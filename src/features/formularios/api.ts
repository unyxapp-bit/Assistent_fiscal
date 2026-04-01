import { supabase } from '../../lib/supabase/client';

export type Formulario = {
  id: string;
  fiscal_id: string;
  titulo: string;
  descricao?: string | null;
  template: boolean;
  ativo: boolean;
  campos: Array<{ id: string; label: string; tipo: string; obrigatorio: boolean; opcoes: string[] }>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RespostaFormulario = {
  id: string;
  fiscal_id: string;
  formulario_id: string;
  valores: Record<string, unknown>;
  preenchido_em: string;
};

export async function fetchFormularios(fiscalId: string) {
  const { data, error } = await supabase
    .from('formularios')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as Formulario[];
}

export async function fetchRespostas(fiscalId: string) {
  const { data, error } = await supabase
    .from('respostas_formulario')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('preenchido_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RespostaFormulario[];
}

export async function criarFormulario(params: {
  fiscalId: string;
  titulo: string;
  descricao?: string | null;
  campos: Formulario['campos'];
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('formularios')
    .insert({
      fiscal_id: params.fiscalId,
      titulo: params.titulo,
      descricao: params.descricao ?? null,
      template: false,
      ativo: true,
      campos: params.campos,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Formulario;
}

export async function atualizarFormulario(id: string, patch: Partial<Formulario>) {
  const { data, error } = await supabase
    .from('formularios')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Formulario;
}

export async function deletarFormulario(id: string) {
  const { error } = await supabase.from('formularios').delete().eq('id', id);
  if (error) throw error;
}

export async function criarResposta(params: {
  fiscalId: string;
  formularioId: string;
  valores: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from('respostas_formulario')
    .insert({
      fiscal_id: params.fiscalId,
      formulario_id: params.formularioId,
      valores: params.valores,
      preenchido_em: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as RespostaFormulario;
}

export async function deletarResposta(id: string) {
  const { error } = await supabase
    .from('respostas_formulario')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
