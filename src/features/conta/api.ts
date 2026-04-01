import { supabase } from '../../lib/supabase/client';

export type Fiscal = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  loja?: string | null;
  ativo?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function fetchFiscal(userId: string) {
  const { data, error } = await supabase
    .from('fiscais')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Fiscal | null;
}

export async function upsertFiscal(fiscal: Fiscal) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('fiscais')
    .upsert({
      id: fiscal.id,
      nome: fiscal.nome,
      email: fiscal.email,
      telefone: fiscal.telefone ?? null,
      loja: fiscal.loja ?? null,
      ativo: fiscal.ativo ?? true,
      updated_at: now,
      created_at: fiscal.created_at ?? now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Fiscal;
}
