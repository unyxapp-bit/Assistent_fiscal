import { supabase } from '../../lib/supabase/client';

export type ChecklistTemplate = {
  id: string;
  fiscal_id: string;
  titulo: string;
  descricao?: string | null;
  icone_key?: string | null;
  cor_hex?: string | null;
  itens: string[];
  is_default?: boolean | null;
  created_at?: string | null;
  periodizacao: string;
  horario_notificacao?: string | null;
};

export type ChecklistExecucao = {
  id: string;
  fiscal_id: string;
  tipo: string;
  data: string;
  itens_snapshot?: string[] | null;
  itens_marcados?: Record<string, boolean> | null;
  concluido: boolean;
  concluido_em?: string | null;
};

export async function fetchTemplates(fiscalId: string) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as ChecklistTemplate[];
}

export async function fetchExecucoes(fiscalId: string) {
  const { data, error } = await supabase
    .from('checklist_execucoes')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('data', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChecklistExecucao[];
}

export async function criarTemplate(params: {
  fiscalId: string;
  titulo: string;
  descricao?: string | null;
  itens: string[];
  periodizacao: string;
  horarioNotificacao?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('checklist_templates')
    .insert({
      fiscal_id: params.fiscalId,
      titulo: params.titulo,
      descricao: params.descricao ?? null,
      icone_key: 'checklist',
      cor_hex: '4CAF50',
      itens: params.itens,
      is_default: false,
      created_at: now,
      periodizacao: params.periodizacao,
      horario_notificacao: params.horarioNotificacao ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistTemplate;
}

export async function atualizarTemplate(
  id: string,
  patch: Partial<ChecklistTemplate>
) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .update({ ...patch })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistTemplate;
}

export async function iniciarExecucao(params: {
  fiscalId: string;
  templateId: string;
  itensSnapshot: string[];
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('checklist_execucoes')
    .insert({
      fiscal_id: params.fiscalId,
      tipo: params.templateId,
      data: now,
      itens_snapshot: params.itensSnapshot,
      itens_marcados: {},
      concluido: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistExecucao;
}

export async function concluirExecucao(id: string) {
  const { data, error } = await supabase
    .from('checklist_execucoes')
    .update({ concluido: true, concluido_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistExecucao;
}

export async function atualizarExecucao(
  id: string,
  patch: Partial<ChecklistExecucao>
) {
  const { data, error } = await supabase
    .from('checklist_execucoes')
    .update({ ...patch })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistExecucao;
}

export async function deletarTemplate(id: string) {
  const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
  if (error) throw error;
}

export async function deletarExecucao(id: string) {
  const { error } = await supabase.from('checklist_execucoes').delete().eq('id', id);
  if (error) throw error;
}
