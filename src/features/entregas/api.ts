import { supabase } from '../../lib/supabase/client';
import type { Entrega } from '../../shared/types';

export async function fetchEntregas(fiscalId: string) {
  const { data, error } = await supabase
    .from('entregas')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('separado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Entrega[];
}

export async function criarEntrega(params: {
  fiscalId: string;
  numeroNota: string;
  clienteNome: string;
  bairro?: string | null;
  cidade?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  horarioMarcado?: string | null;
  observacoes?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('entregas')
    .insert({
      fiscal_id: params.fiscalId,
      numero_nota: params.numeroNota,
      cliente_nome: params.clienteNome,
      bairro: params.bairro ?? null,
      cidade: params.cidade ?? null,
      endereco: params.endereco ?? null,
      telefone: params.telefone ?? null,
      status: 'separada',
      separado_em: now,
      horario_marcado: params.horarioMarcado ?? null,
      observacoes: params.observacoes ?? null,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Entrega;
}

export async function atualizarEntrega(id: string, patch: Partial<Entrega>) {
  const { data, error } = await supabase
    .from('entregas')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Entrega;
}

export async function deletarEntrega(id: string) {
  const { error } = await supabase.from('entregas').delete().eq('id', id);
  if (error) throw error;
}
