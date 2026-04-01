import { supabase } from '../../lib/supabase/client';

export type EventoTurno = {
  id: string;
  fiscal_id: string;
  tipo: string;
  timestamp: string;
  colaborador_nome?: string | null;
  caixa_nome?: string | null;
  detalhe?: string | null;
};

export async function fetchEventos(fiscalId: string) {
  const { data, error } = await supabase
    .from('eventos_turno')
    .select('*')
    .eq('fiscal_id', fiscalId)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventoTurno[];
}
