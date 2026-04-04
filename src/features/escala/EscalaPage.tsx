import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDate, formatTime, toDateInputValue, todayIsoDate } from '../../shared/lib/dates';
import { cn } from '../../shared/lib/cn';
import { useEscala } from './useEscala';
import {
  formatHorarioResumo,
  getTurnoEscalaColaboradorId,
  getTurnoEscalaDate,
  getTurnoEscalaHorario,
} from './api';

type ResumoDia = {
  turnos: number;
  registros: number;
  turnoIds: string[];
  registroIds: string[];
  preview: Array<{
    colaborador: string;
    horario: string;
    origem: 'escala' | 'ponto';
  }>;
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizarHorario(value?: string | null) {
  const formatado = formatTime(value ?? null);
  return formatado === '-' ? null : formatado;
}

export default function EscalaPage() {
  const { colaboradores, registros, turnos, isLoading, deleteEscalaDia, deletingDia } =
    useEscala();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const hoje = todayIsoDate();

  const colaboradorMap = useMemo(() => {
    return new Map(colaboradores.map((colaborador) => [colaborador.id, colaborador.nome]));
  }, [colaboradores]);

  const resumoPorDia = useMemo(() => {
    const mapa = new Map<string, ResumoDia>();

    const garantirDia = (iso: string) => {
      const existente = mapa.get(iso);
      if (existente) return existente;
      const criado: ResumoDia = {
        turnos: 0,
        registros: 0,
        turnoIds: [],
        registroIds: [],
        preview: [],
      };
      mapa.set(iso, criado);
      return criado;
    };

    turnos.forEach((turno) => {
      const data = getTurnoEscalaDate(turno);
      if (!data) return;
      const resumo = garantirDia(data);
      resumo.turnos += 1;
      resumo.turnoIds.push(turno.id);

      if (resumo.preview.length >= 3) return;
      const colaboradorId = getTurnoEscalaColaboradorId(turno);
      const colaborador = colaboradorId
        ? colaboradorMap.get(colaboradorId) ?? 'Colaborador'
        : 'Colaborador';

      resumo.preview.push({
        colaborador,
        horario: formatHorarioResumo(getTurnoEscalaHorario(turno)),
        origem: 'escala',
      });
    });

    registros.forEach((registro) => {
      const resumo = garantirDia(registro.data);
      resumo.registros += 1;
      resumo.registroIds.push(registro.id);

      if (resumo.preview.length >= 3) return;
      resumo.preview.push({
        colaborador: colaboradorMap.get(registro.colaborador_id) ?? 'Colaborador',
        horario: formatHorarioResumo({
          inicio: normalizarHorario(registro.entrada),
          fim: normalizarHorario(registro.saida),
          intervaloSaida: normalizarHorario(registro.intervalo_saida),
          intervaloRetorno: normalizarHorario(registro.intervalo_retorno),
        }),
        origem: 'ponto',
      });
    });

    return mapa;
  }, [colaboradorMap, registros, turnos]);

  const periodoSemana = `${formatDate(toDateInputValue(weekStart))} a ${formatDate(
    toDateInputValue(addDays(weekStart, 6))
  )}`;

  const handleExcluirDia = async (iso: string, resumo: ResumoDia) => {
    const total = resumo.turnoIds.length + resumo.registroIds.length;
    if (total === 0) {
      window.alert('Nao ha escala cadastrada nesse dia para excluir.');
      return;
    }

    const confirmou = window.confirm(
      `Excluir escala do dia ${formatDate(iso)}? Essa acao remove ${resumo.turnoIds.length} turno(s) e ${resumo.registroIds.length} registro(s) de ponto.`
    );
    if (!confirmou) return;

    await deleteEscalaDia({
      turnoIds: resumo.turnoIds,
      registroIds: resumo.registroIds,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestao</p>
          <h1 className="font-display text-3xl text-primary">Escala</h1>
          <p className="text-sm text-muted mt-2">
            Calendario semanal com dados de turnos_escala e registros_ponto.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/escala/importar">
            <Button variant="outline">Importar escala</Button>
          </Link>
          <Link to={`/escala/dia/${hoje}`}>
            <Button>Hoje</Button>
          </Link>
        </div>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          Semana anterior
        </Button>
        <p className="text-sm text-muted">Semana: {periodoSemana}</p>
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Proxima semana
        </Button>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {dias.map((dia) => {
          const iso = toDateInputValue(dia);
          const resumo = resumoPorDia.get(iso) ?? {
            turnos: 0,
            registros: 0,
            turnoIds: [],
            registroIds: [],
            preview: [],
          };
          const diaSemana = dia.toLocaleDateString('pt-BR', { weekday: 'short' });
          const destaqueHoje = iso === hoje;

          return (
            <Card
              key={iso}
              className={cn(
                'flex h-full min-h-[220px] flex-col gap-3',
                destaqueHoje ? 'ring-1 ring-primary/35 border-borderDark' : ''
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{diaSemana}</p>
                  <h3 className="font-display text-2xl text-primary">{dia.getDate()}</h3>
                </div>
                {destaqueHoje ? (
                  <span className="rounded-full bg-success-light px-2 py-0.5 text-[10px] text-primary">
                    hoje
                  </span>
                ) : null}
              </div>

              <div className="space-y-1 text-xs text-muted">
                <p>Turnos: {resumo.turnos}</p>
                <p>Pontos: {resumo.registros}</p>
              </div>

              <div className="space-y-1">
                {resumo.preview.length === 0 ? (
                  <p className="text-xs text-muted">Sem registros.</p>
                ) : (
                  resumo.preview.map((item, index) => (
                    <div key={`${iso}-${item.colaborador}-${index}`} className="rounded-md border border-border px-2 py-1">
                      <p className="text-xs text-ink">{item.colaborador}</p>
                      <p className="text-[11px] text-muted">{item.horario}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.origem}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto pt-1">
                <Link to={`/escala/dia/${iso}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    Abrir dia
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2"
                  disabled={deletingDia}
                  onClick={() => void handleExcluirDia(iso, resumo)}
                >
                  Excluir dia
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {isLoading ? <Card>Carregando dados de escala...</Card> : null}
    </div>
  );
}
