import { supabase } from '../../lib/supabase/client';
import type {
  Alocacao,
  Caixa,
  ChecklistExecucao,
  ChecklistTemplate,
  Colaborador,
  Entrega,
  Nota,
  Ocorrencia,
  PausaCafe,
} from '../../shared/types';

export async function fetchColaboradores(fiscalId: string) {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('nome');
  if (error) throw error;
  return (data ?? []) as Colaborador[];
}

export async function fetchCaixas(fiscalId: string) {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('numero');
  if (error) throw error;
  return (data ?? []) as Caixa[];
}

export async function fetchAlocacoesAtivas(fiscalId: string) {
  const { data, error } = await supabase
    .from('alocacoes')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .eq('status', 'ativo');
  if (error) throw error;
  return (data ?? []) as Alocacao[];
}

export async function fetchPausasHoje(fiscalId: string, inicioDiaIso: string) {
  const { data, error } = await supabase
    .from('pausas_cafe')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .gte('iniciado_em', inicioDiaIso)
    .order('iniciado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PausaCafe[];
}

export async function fetchEntregas(fiscalId: string) {
  const { data, error } = await supabase
    .from('entregas')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('separado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Entrega[];
}

export async function fetchNotas(fiscalId: string) {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Nota[];
}

export async function fetchOcorrencias(fiscalId: string) {
  const { data, error } = await supabase
    .from('ocorrencias')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('registrada_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Ocorrencia[];
}

export async function fetchChecklistTemplates(fiscalId: string) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as ChecklistTemplate[];
}

export async function fetchChecklistExecucoes(fiscalId: string) {
  const { data, error } = await supabase
    .from('checklist_execucoes')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('data', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChecklistExecucao[];
}
