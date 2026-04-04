import { supabase } from '../../lib/supabase/client';
import type { Nota } from '../../shared/types';

export async function fetchNotas(fiscalId: string) {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Nota[];
}

export async function criarNota(params: {
  fiscalId: string;
  titulo: string;
  conteudo: string;
  tipo: Nota['tipo'];
  dataLembrete?: string | null;
  importante?: boolean;
  lembreteAtivo?: boolean;
  fotoUrl?: string | null;
  fotoNome?: string | null;
  arquivoUrl?: string | null;
  arquivoNome?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('notas')
    .insert({
      fiscal_id: params.fiscalId,
      titulo: params.titulo,
      conteudo: params.conteudo,
      tipo: params.tipo,
      concluida: false,
      importante: params.importante ?? false,
      lembrete_ativo: params.lembreteAtivo ?? true,
      data_lembrete: params.dataLembrete ?? null,
      foto_url: params.fotoUrl ?? null,
      foto_nome: params.fotoNome ?? null,
      arquivo_url: params.arquivoUrl ?? null,
      arquivo_nome: params.arquivoNome ?? null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Nota;
}

export async function atualizarNota(id: string, patch: Partial<Nota>) {
  const { data, error } = await supabase
    .from('notas')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Nota;
}

export async function deletarNota(id: string) {
  const { error } = await supabase.from('notas').delete().eq('id', id);
  if (error) throw error;
}
