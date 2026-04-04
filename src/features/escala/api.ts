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

export type TurnoEscala = {
  id: string;
  colaborador_id?: string | null;
  data?: string | null;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  intervalo_saida?: string | null;
  intervalo_retorno?: string | null;
  [key: string]: unknown;
};

export type HorarioEscala = {
  inicio: string | null;
  fim: string | null;
  intervaloSaida: string | null;
  intervaloRetorno: string | null;
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

const dateKeys = ['data', 'data_turno', 'dia', 'data_escala', 'date'];
const colaboradorKeys = ['colaborador_id', 'colaboradorId'];
const inicioKeys = ['horario_inicio', 'hora_inicio', 'inicio', 'entrada_prevista', 'entrada'];
const fimKeys = ['horario_fim', 'hora_fim', 'fim', 'saida_prevista', 'saida'];
const intervaloSaidaKeys = [
  'intervalo_saida',
  'intervalo_inicio',
  'saida_intervalo',
  'pausa_inicio',
];
const intervaloRetornoKeys = [
  'intervalo_retorno',
  'intervalo_fim',
  'retorno_intervalo',
  'pausa_fim',
];

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function pickStringValue(
  row: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeIsoDate(value: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function normalizeTimeValue(value: string | null) {
  if (!value) return null;
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [h, m] = value.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
    const [h, m] = value.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function getTurnoEscalaColaboradorId(turno: TurnoEscala) {
  return pickStringValue(turno, colaboradorKeys);
}

export function getTurnoEscalaDate(turno: TurnoEscala) {
  const raw = pickStringValue(turno, dateKeys);
  return normalizeIsoDate(raw);
}

export function getTurnoEscalaHorario(turno: TurnoEscala): HorarioEscala {
  return {
    inicio: normalizeTimeValue(pickStringValue(turno, inicioKeys)),
    fim: normalizeTimeValue(pickStringValue(turno, fimKeys)),
    intervaloSaida: normalizeTimeValue(pickStringValue(turno, intervaloSaidaKeys)),
    intervaloRetorno: normalizeTimeValue(pickStringValue(turno, intervaloRetornoKeys)),
  };
}

export function formatHorarioResumo(horario: HorarioEscala) {
  const faixaPrincipal =
    horario.inicio && horario.fim
      ? `${horario.inicio} - ${horario.fim}`
      : horario.inicio ?? horario.fim ?? null;

  const faixaIntervalo =
    horario.intervaloSaida && horario.intervaloRetorno
      ? `${horario.intervaloSaida} - ${horario.intervaloRetorno}`
      : horario.intervaloSaida ?? horario.intervaloRetorno ?? null;

  if (faixaPrincipal && faixaIntervalo) {
    return `${faixaPrincipal} (intervalo ${faixaIntervalo})`;
  }
  return faixaPrincipal ?? faixaIntervalo ?? 'Horario nao informado';
}

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

export async function fetchTurnosEscalaPorColaboradores(colaboradorIds: string[]) {
  if (colaboradorIds.length === 0) return [] as TurnoEscala[];
  const { data, error } = await supabase
    .from('turnos_escala')
    .select('*')
    .in('colaborador_id', colaboradorIds);
  if (error) throw error;
  return (data ?? []) as TurnoEscala[];
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

export async function deleteRegistrosPonto(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from('registros_ponto').delete().in('id', ids);
  if (error) throw error;
}

export async function deleteTurnosEscala(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from('turnos_escala').delete().in('id', ids);
  if (error) throw error;
}

