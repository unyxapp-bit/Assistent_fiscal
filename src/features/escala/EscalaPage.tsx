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

type PeriodoId = 'manha' | 'tarde' | 'noite';

type MinimoCobertura = Record<PeriodoId, number>;

type CoberturaPeriodo = {
  id: PeriodoId;
  label: string;
  total: number;
  minimo: number;
  deficit: number;
};

type CoberturaDia = {
  data: string;
  periodos: CoberturaPeriodo[];
  deficitTotal: number;
};

const PERIODOS: Array<{ id: PeriodoId; label: string; inicio: number; fim: number }> = [
  { id: 'manha', label: 'Manha', inicio: 6 * 60, fim: 12 * 60 },
  { id: 'tarde', label: 'Tarde', inicio: 12 * 60, fim: 18 * 60 },
  { id: 'noite', label: 'Noite', inicio: 18 * 60, fim: 23 * 60 + 59 },
];

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

function toMinutes(value: string | null) {
  if (!value) return null;
  const [hRaw, mRaw] = value.split(':');
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function existeSobreposicao(inicio: number, fim: number, periodoInicio: number, periodoFim: number) {
  let fimNormalizado = fim;
  if (fimNormalizado <= inicio) {
    fimNormalizado += 24 * 60;
  }

  const inicioPeriodo = periodoInicio;
  const fimPeriodo = periodoFim;

  return Math.max(inicio, inicioPeriodo) < Math.min(fimNormalizado, fimPeriodo);
}

function hasHorarioUtil(registro: {
  entrada?: string | null;
  saida?: string | null;
  intervalo_saida?: string | null;
  intervalo_retorno?: string | null;
}) {
  return Boolean(
    registro.entrada || registro.saida || registro.intervalo_saida || registro.intervalo_retorno
  );
}

export default function EscalaPage() {
  const {
    colaboradores,
    registros,
    turnos,
    isLoading,
    deleteEscalaDia,
    deletingDia,
    createRegistro,
  } = useEscala();

  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [mostrarCobertura, setMostrarCobertura] = useState(false);
  const [gerandoSemana, setGerandoSemana] = useState(false);
  const [resumoGeracao, setResumoGeracao] = useState<string | null>(null);
  const [coberturaMinima, setCoberturaMinima] = useState<MinimoCobertura>({
    manha: 2,
    tarde: 2,
    noite: 1,
  });

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

  const coberturaSemana = useMemo(() => {
    const diasSemana = new Set(dias.map((dia) => toDateInputValue(dia)));
    const base = new Map<string, Record<PeriodoId, Set<string>>>();

    dias.forEach((dia) => {
      const iso = toDateInputValue(dia);
      base.set(iso, {
        manha: new Set<string>(),
        tarde: new Set<string>(),
        noite: new Set<string>(),
      });
    });

    const registrar = (data: string, colaboradorId: string, inicio: string | null, fim: string | null) => {
      if (!diasSemana.has(data)) return;
      const inicioMin = toMinutes(inicio);
      const fimMin = toMinutes(fim);
      if (inicioMin === null || fimMin === null) return;

      const coberturaDia = base.get(data);
      if (!coberturaDia) return;

      PERIODOS.forEach((periodo) => {
        if (existeSobreposicao(inicioMin, fimMin, periodo.inicio, periodo.fim)) {
          coberturaDia[periodo.id].add(colaboradorId);
        }
      });
    };

    turnos.forEach((turno) => {
      const data = getTurnoEscalaDate(turno);
      const colaboradorId = getTurnoEscalaColaboradorId(turno);
      if (!data || !colaboradorId) return;

      const horario = getTurnoEscalaHorario(turno);
      const inicio = horario.inicio;
      const fim = horario.fim ?? horario.intervaloSaida ?? horario.intervaloRetorno;
      registrar(data, colaboradorId, inicio, fim);
    });

    registros.forEach((registro) => {
      const inicio = normalizarHorario(registro.entrada);
      const fim =
        normalizarHorario(registro.saida) ??
        normalizarHorario(registro.intervalo_saida) ??
        normalizarHorario(registro.intervalo_retorno);

      registrar(registro.data, registro.colaborador_id, inicio, fim);
    });

    const linhas: CoberturaDia[] = dias.map((dia) => {
      const iso = toDateInputValue(dia);
      const coberturaDia = base.get(iso);
      const periodos = PERIODOS.map((periodo) => {
        const total = coberturaDia?.[periodo.id].size ?? 0;
        const minimo = coberturaMinima[periodo.id];
        const deficit = Math.max(minimo - total, 0);

        return {
          id: periodo.id,
          label: periodo.label,
          total,
          minimo,
          deficit,
        };
      });

      return {
        data: iso,
        periodos,
        deficitTotal: periodos.reduce((acc, periodo) => acc + periodo.deficit, 0),
      };
    });

    const deficitSemanal = linhas.reduce((acc, linha) => acc + linha.deficitTotal, 0);

    return {
      linhas,
      deficitSemanal,
    };
  }, [coberturaMinima, dias, registros, turnos]);

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

  const handleMinimoChange = (periodoId: PeriodoId, value: string) => {
    const parsed = Number(value);
    const safeValue = Number.isNaN(parsed) ? 0 : Math.max(Math.floor(parsed), 0);

    setCoberturaMinima((prev) => ({
      ...prev,
      [periodoId]: safeValue,
    }));
  };

  const handleGerarEscalaSemana = async () => {
    const colaboradoresAtivos = colaboradores.filter((colaborador) => colaborador.ativo);
    if (colaboradoresAtivos.length === 0) {
      setResumoGeracao('Nenhum colaborador ativo para gerar escala.');
      return;
    }

    const confirmou = window.confirm(
      `Gerar escala base para ${colaboradoresAtivos.length} colaborador(es) nesta semana?`
    );
    if (!confirmou) return;

    setGerandoSemana(true);
    setResumoGeracao(null);

    try {
      const diasSemana = dias.map((dia) => toDateInputValue(dia));
      const diasSemanaSet = new Set(diasSemana);

      const existentes = new Set(
        registros
          .filter((registro) => diasSemanaSet.has(registro.data))
          .map((registro) => `${registro.colaborador_id}|${registro.data}`)
      );

      const historicoOrdenado = [...registros].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );

      let criados = 0;
      let jaExistiam = 0;
      let semModelo = 0;

      for (const colaborador of colaboradoresAtivos) {
        for (const diaIso of diasSemana) {
          const chave = `${colaborador.id}|${diaIso}`;
          if (existentes.has(chave)) {
            jaExistiam += 1;
            continue;
          }

          const diaTarget = new Date(`${diaIso}T00:00:00`);
          const dayOfWeek = diaTarget.getDay();
          const inicioSemanaAtual = weekStart.getTime();

          const modelo = historicoOrdenado.find((registro) => {
            if (registro.colaborador_id !== colaborador.id) return false;
            const dataRegistro = new Date(`${registro.data}T00:00:00`).getTime();
            if (dataRegistro >= inicioSemanaAtual) return false;
            if (new Date(`${registro.data}T00:00:00`).getDay() !== dayOfWeek) return false;
            return hasHorarioUtil(registro);
          });

          if (!modelo) {
            semModelo += 1;
            continue;
          }

          await createRegistro({
            colaborador_id: colaborador.id,
            data: diaIso,
            entrada: modelo.entrada ?? null,
            intervalo_saida: modelo.intervalo_saida ?? null,
            intervalo_retorno: modelo.intervalo_retorno ?? null,
            saida: modelo.saida ?? null,
            observacao: modelo.observacao
              ? `${modelo.observacao} | gerado automatico`
              : 'Gerado automaticamente da semana anterior',
          });

          existentes.add(chave);
          criados += 1;
        }
      }

      setResumoGeracao(
        `Geracao concluida: ${criados} registro(s) criado(s), ${jaExistiam} ja existia(m) e ${semModelo} sem modelo anterior.`
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao gerar escala da semana.';
      setResumoGeracao(`Falha na geracao: ${message}`);
    } finally {
      setGerandoSemana(false);
    }
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
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setMostrarCobertura((prev) => !prev)}>
            {mostrarCobertura ? 'Ocultar cobertura' : 'Validar cobertura'}
          </Button>
          <Button variant="outline" disabled={gerandoSemana} onClick={() => void handleGerarEscalaSemana()}>
            {gerandoSemana ? 'Gerando semana...' : 'Gerar semana base'}
          </Button>
          <Link to="/escala/importar">
            <Button variant="outline">Importar escala</Button>
          </Link>
          <Link to={`/escala/dia/${hoje}`}>
            <Button>Hoje</Button>
          </Link>
        </div>
      </div>

      {resumoGeracao ? <Card>{resumoGeracao}</Card> : null}

      {mostrarCobertura ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl">Relatorio de cobertura semanal</h3>
              <p className="text-sm text-muted">
                Defina os minimos por periodo e acompanhe os deficits da semana.
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                coberturaSemana.deficitSemanal > 0
                  ? 'bg-danger/10 text-danger border border-danger/25'
                  : 'bg-success-light text-primary border border-success/20'
              )}
            >
              Deficit semanal: {coberturaSemana.deficitSemanal}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PERIODOS.map((periodo) => (
              <div key={periodo.id} className="rounded-lg border border-cloud px-3 py-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{periodo.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm text-muted">Minimo</label>
                  <input
                    type="number"
                    min={0}
                    value={coberturaMinima[periodo.id]}
                    onChange={(event) => handleMinimoChange(periodo.id, event.target.value)}
                    className="w-20 rounded-lg border border-cloud px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {coberturaSemana.linhas.map((linha) => (
              <div key={linha.data} className="rounded-lg border border-cloud px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{formatDate(linha.data)}</p>
                  <span
                    className={cn(
                      'text-xs rounded-full px-2 py-0.5 border',
                      linha.deficitTotal > 0
                        ? 'border-danger/25 text-danger bg-danger/5'
                        : 'border-success/20 text-primary bg-success-light'
                    )}
                  >
                    Deficit: {linha.deficitTotal}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {linha.periodos.map((periodo) => (
                    <span
                      key={`${linha.data}-${periodo.id}`}
                      className={cn(
                        'text-xs rounded-full px-2 py-1 border',
                        periodo.deficit > 0
                          ? 'border-danger/20 text-danger bg-danger/5'
                          : 'border-borderDark text-muted bg-white/50'
                      )}
                    >
                      {periodo.label}: {periodo.total}/{periodo.minimo}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

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
          const coberturaDia = coberturaSemana.linhas.find((linha) => linha.data === iso);
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
                {coberturaDia ? (
                  <p className={coberturaDia.deficitTotal > 0 ? 'text-danger' : 'text-muted'}>
                    Deficit cobertura: {coberturaDia.deficitTotal}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                {resumo.preview.length === 0 ? (
                  <p className="text-xs text-muted">Sem registros.</p>
                ) : (
                  resumo.preview.map((item, index) => (
                    <div
                      key={`${iso}-${item.colaborador}-${index}`}
                      className="rounded-md border border-border px-2 py-1"
                    >
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
