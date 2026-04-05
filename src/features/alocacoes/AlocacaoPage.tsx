import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import {
  formatDate,
  formatDateTime,
  formatTime,
  startOfTodayIso,
  todayIsoDate,
} from '../../shared/lib/dates';
import { useAuth } from '../auth/AuthProvider';
import { fetchCaixas } from '../dashboard/api';
import { useEscala } from '../escala/useEscala';
import { useAlocacoes } from './useAlocacoes';
import {
  fetchRetornosPosIntervalo,
  jaUsouCaixaHoje,
  marcarRetornoIntervaloRegistro,
  marcarSaidaIntervaloRegistro,
  type RetornoPosIntervalo,
} from './api';
import {
  buildLinhasRelatorioAlocacao,
  exportarCsvRelatorioAlocacao,
  imprimirRelatorioAlocacao,
} from './relatorio';
import type { Caixa, Colaborador } from '../../shared/types';

type RegistroLike = {
  id: string;
  colaborador_id: string;
  data: string;
  entrada?: string | null;
  saida?: string | null;
  intervalo_saida?: string | null;
  intervalo_retorno?: string | null;
};

type Disponibilidade = Colaborador & {
  disponivel: boolean;
  motivo: string;
  horario: string;
};

const mins = (v: string | null) => {
  if (!v) return null;
  const [h, m] = v.slice(0, 5).split(':').map(Number);
  return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m;
};

const nowHHMM = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const motivoLabel = (m: string) =>
  ({
    disponivel: 'Disponivel',
    alocado: 'Alocado',
    intervalo: 'Em intervalo',
    saiu: 'Ja saiu',
    nao_entrou_ainda: 'Ainda nao entrou',
    nao_escalado: 'Sem registro de entrada',
  }[m] ?? m);

export default function AlocacaoPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const hoje = todayIsoDate();
  const inicioDiaIso = useMemo(() => startOfTodayIso(), []);

  const [colaboradorId, setColaboradorId] = useState('');
  const [caixaId, setCaixaId] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [horarioConsulta, setHorarioConsulta] = useState(nowHHMM());
  const [timelineColaboradorId, setTimelineColaboradorId] = useState('');
  const [trocaOrigemId, setTrocaOrigemId] = useState('');
  const [trocaDestinoId, setTrocaDestinoId] = useState('');
  const [trocaMotivo, setTrocaMotivo] = useState('');

  const { colaboradores, registros, isLoading: escalaLoading } = useEscala();
  const ativos = colaboradores.filter((c) => c.ativo);

  const caixasQuery = useQuery({
    queryKey: ['caixas', fiscalId],
    queryFn: () => fetchCaixas(fiscalId),
    enabled: !!fiscalId,
  });
  const caixas = (caixasQuery.data ?? []).filter((c) => c.ativo && !c.em_manutencao);

  const retornosQuery = useQuery({
    queryKey: ['retornos_pos_intervalo', fiscalId, inicioDiaIso],
    queryFn: () => fetchRetornosPosIntervalo({ fiscalId, inicioDiaIso }),
    enabled: !!fiscalId,
  });

  const {
    data: alocacoes = [],
    createAlocacao,
    liberarAlocacao,
    realocarAlocacao,
    trocarCaixas,
    updating,
  } = useAlocacoes();

  const colabMap = useMemo(
    () => new Map(ativos.map((c) => [c.id, c])),
    [ativos]
  );
  const caixaMap = useMemo(
    () => new Map(caixas.map((c) => [c.id, c])),
    [caixas]
  );
  const alocMap = useMemo(
    () => new Map(alocacoes.map((a) => [a.colaborador_id, a])),
    [alocacoes]
  );

  const registrosHoje = useMemo(() => {
    const map = new Map<string, RegistroLike>();
    registros.forEach((r) => {
      if (r.data === hoje && !map.has(r.colaborador_id)) {
        map.set(r.colaborador_id, r as unknown as RegistroLike);
      }
    });
    return map;
  }, [registros, hoje]);

  const disponibilidade = useMemo(() => {
    const hora = mins(horarioConsulta) ?? mins(nowHHMM()) ?? 0;
    return ativos.map((c) => {
      const reg = registrosHoje.get(c.id);
      const entrada = reg?.entrada ? formatTime(reg.entrada) : null;
      const saida = reg?.saida ? formatTime(reg.saida) : null;
      const iSaida = reg?.intervalo_saida ? formatTime(reg.intervalo_saida) : null;
      const iRetorno = reg?.intervalo_retorno ? formatTime(reg.intervalo_retorno) : null;
      const horario =
        [entrada ? `Entrada ${entrada}` : null, iSaida || iRetorno ? `Intervalo ${iSaida ?? '--:--'} - ${iRetorno ?? '--:--'}` : null, saida ? `Saida ${saida}` : null]
          .filter(Boolean)
          .join(' | ') || 'Sem registro de ponto';

      if (alocMap.has(c.id)) return { ...c, disponivel: false, motivo: 'alocado', horario };
      if (!entrada) return { ...c, disponivel: false, motivo: 'nao_escalado', horario };
      if ((mins(entrada) ?? 0) > hora) return { ...c, disponivel: false, motivo: 'nao_entrou_ainda', horario };
      if (saida && (mins(saida) ?? 9999) <= hora) return { ...c, disponivel: false, motivo: 'saiu', horario };
      if (iSaida) {
        const mStart = mins(iSaida) ?? 0;
        const mEnd = iRetorno ? mins(iRetorno) ?? 0 : null;
        if ((mEnd === null && hora >= mStart) || (mEnd !== null && hora >= mStart && hora < mEnd)) {
          return { ...c, disponivel: false, motivo: 'intervalo', horario };
        }
      }
      return { ...c, disponivel: true, motivo: 'disponivel', horario };
    }) as Disponibilidade[];
  }, [ativos, horarioConsulta, registrosHoje, alocMap]);

  const disponiveis = disponibilidade.filter((c) => c.disponivel && (filtroDepto === 'todos' || c.departamento === filtroDepto));
  const indisponiveis = disponibilidade.filter((c) => !c.disponivel && (filtroDepto === 'todos' || c.departamento === filtroDepto));

  const retornosPendentes = useMemo(() => {
    const map = new Map<string, RetornoPosIntervalo>();
    (retornosQuery.data ?? []).forEach((r) => {
      if (!alocMap.has(r.colaboradorId) && !map.has(r.colaboradorId)) map.set(r.colaboradorId, r);
    });
    return [...map.values()];
  }, [retornosQuery.data, alocMap]);

  const linhasRelatorio = useMemo(
    () => buildLinhasRelatorioAlocacao({ alocacoes, colaboradoresMap: colabMap, caixasMap: caixaMap }),
    [alocacoes, colabMap, caixaMap]
  );

  const timelineRegistro = timelineColaboradorId ? registrosHoje.get(timelineColaboradorId) ?? null : null;
  const tEntrada = timelineRegistro?.entrada ? formatTime(timelineRegistro.entrada) : null;
  const tISaida = timelineRegistro?.intervalo_saida ? formatTime(timelineRegistro.intervalo_saida) : null;
  const tIRetorno = timelineRegistro?.intervalo_retorno ? formatTime(timelineRegistro.intervalo_retorno) : null;
  const tSaida = timelineRegistro?.saida ? formatTime(timelineRegistro.saida) : null;

  const handleAlocar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const colaborador = colabMap.get(colaboradorId);
    const caixa = caixaMap.get(caixaId);
    if (!colaborador || !caixa) return setErro('Selecione colaborador e caixa validos.');
    if (colaborador.departamento === 'self' && caixa.tipo !== 'self') return setErro('Operador self so pode ir para caixa self.');
    setLoading(true);
    try {
      const alocAtual = alocMap.get(colaboradorId);
      if (alocAtual) {
        if (!justificativa.trim()) return setErro('Informe justificativa para excecao.');
        await realocarAlocacao({ alocacaoId: alocAtual.id, caixaId, observacoes: `[Excecao] ${justificativa.trim()}` });
      } else {
        const repetiu = await jaUsouCaixaHoje({ colaboradorId, caixaId });
        if (repetiu && !justificativa.trim()) return setErro('Esse colaborador ja usou esse caixa hoje. Informe justificativa.');
        await createAlocacao({ colaboradorId, caixaId, observacoes: justificativa.trim() || undefined });
      }
      setColaboradorId('');
      setCaixaId('');
      setJustificativa('');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao alocar.');
    } finally {
      setLoading(false);
    }
  };

  const marcarSaidaIntervalo = async () => {
    if (!timelineRegistro) return setErro('Selecione colaborador com registro de ponto.');
    if (tISaida) return;
    await marcarSaidaIntervaloRegistro({
      registroId: timelineRegistro.id,
      horario: nowHHMM(),
    });
    const aloc = alocMap.get(timelineRegistro.colaborador_id);
    if (aloc && window.confirm('Liberar a alocacao ativa como intervalo?')) {
      await liberarAlocacao({ alocacaoId: aloc.id, motivo: 'intervalo' });
    }
  };

  const marcarRetornoIntervalo = async () => {
    if (!timelineRegistro || !tISaida || tIRetorno) return;
    await marcarRetornoIntervaloRegistro({
      registroId: timelineRegistro.id,
      horario: nowHHMM(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestao</p>
          <h1 className="font-display text-3xl text-primary">Alocacao</h1>
          <p className="text-sm text-muted mt-2">Disponibilidade em tempo real por registros de ponto + relatorio PDF/CSV.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => imprimirRelatorioAlocacao({ data: hoje, turno: 'operacional', linhas: linhasRelatorio })}>PDF / Imprimir</Button>
          <Button variant="outline" onClick={() => exportarCsvRelatorioAlocacao({ data: hoje, linhas: linhasRelatorio })}>Exportar CSV</Button>
        </div>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleAlocar}>
          <select value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} className="rounded-xl border border-cloud px-4 py-2">
            <option value="todos">Todos os departamentos</option>
            {[...new Set(disponibilidade.map((c) => c.departamento))].map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
          <input type="time" value={horarioConsulta} onChange={(e) => setHorarioConsulta(e.target.value)} className="rounded-xl border border-cloud px-4 py-2" />
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} className="rounded-xl border border-cloud px-4 py-2">
            <option value="">Selecione colaborador disponivel</option>
            {disponiveis.map((c) => (<option key={c.id} value={c.id}>{c.nome} ({c.departamento}) - {c.horario}</option>))}
          </select>
          <select value={caixaId} onChange={(e) => setCaixaId(e.target.value)} className="rounded-xl border border-cloud px-4 py-2">
            <option value="">Selecione caixa</option>
            {caixas.map((c) => (<option key={c.id} value={c.id}>Caixa {c.numero} ({c.tipo})</option>))}
          </select>
          <input value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Justificativa (excecao/repeticao)" className="rounded-xl border border-cloud px-4 py-2 md:col-span-3" />
          <Button type="submit" disabled={loading || updating || caixasQuery.isLoading}>{loading ? 'Processando...' : 'Alocar colaborador'}</Button>
          {erro ? <p className="text-sm text-danger md:col-span-4">{erro}</p> : null}
        </form>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-xl">Troca rapida de caixas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={trocaOrigemId} onChange={(e) => setTrocaOrigemId(e.target.value)} className="rounded-xl border border-cloud px-4 py-2">
            <option value="">Alocacao origem</option>
            {alocacoes.map((a) => (<option key={a.id} value={a.id}>{colabMap.get(a.colaborador_id)?.nome ?? 'Colaborador'} - Caixa {caixaMap.get(a.caixa_id)?.numero ?? '?'}</option>))}
          </select>
          <select value={trocaDestinoId} onChange={(e) => setTrocaDestinoId(e.target.value)} className="rounded-xl border border-cloud px-4 py-2">
            <option value="">Alocacao destino</option>
            {alocacoes.map((a) => (<option key={a.id} value={a.id}>{colabMap.get(a.colaborador_id)?.nome ?? 'Colaborador'} - Caixa {caixaMap.get(a.caixa_id)?.numero ?? '?'}</option>))}
          </select>
          <input value={trocaMotivo} onChange={(e) => setTrocaMotivo(e.target.value)} placeholder="Motivo da troca" className="rounded-xl border border-cloud px-4 py-2" />
        </div>
        <Button variant="outline" disabled={updating || !trocaOrigemId || !trocaDestinoId} onClick={() => void trocarCaixas({ alocacaoOrigemId: trocaOrigemId, caixaOrigemId: alocacoes.find((a) => a.id === trocaOrigemId)?.caixa_id ?? '', alocacaoDestinoId: trocaDestinoId, caixaDestinoId: alocacoes.find((a) => a.id === trocaDestinoId)?.caixa_id ?? '', motivo: trocaMotivo.trim() || undefined })}>Trocar caixas</Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="font-display text-xl">Disponiveis ({disponiveis.length})</h3>
          {escalaLoading ? <p className="text-sm text-muted">Carregando escala...</p> : null}
          {disponiveis.length === 0 ? <p className="text-sm text-muted">Nenhum colaborador disponivel nesse horario.</p> : (
            <div className="space-y-2">
              {disponiveis.map((c) => (
                <div key={c.id} className="flex items-start justify-between rounded-lg border border-cloud px-3 py-2 text-sm gap-3">
                  <div><p>{c.nome} - {c.departamento}</p><p className="text-xs text-muted mt-1">{c.horario}</p></div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setColaboradorId(c.id)}>Alocar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setTimelineColaboradorId(c.id)}>Timeline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display text-xl">Indisponiveis ({indisponiveis.length})</h3>
          {indisponiveis.length === 0 ? <p className="text-sm text-muted">Sem indisponibilidades no momento.</p> : (
            <div className="space-y-2">
              {indisponiveis.map((c) => (
                <div key={c.id} className="flex items-start justify-between rounded-lg border border-cloud px-3 py-2 text-sm gap-3">
                  <div><p>{c.nome} - {c.departamento}</p><p className="text-xs text-muted mt-1">{c.horario}</p><p className="text-xs text-danger mt-1">{motivoLabel(c.motivo)}</p></div>
                  <Button size="sm" variant="ghost" onClick={() => setTimelineColaboradorId(c.id)}>Timeline</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="font-display text-xl">Alocacoes ativas</h3>
        {alocacoes.length === 0 ? <p className="text-sm text-muted">Nenhuma alocacao ativa.</p> : (
          <div className="space-y-2">
            {alocacoes.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-cloud px-3 py-2">
                <div>
                  <p className="font-semibold">{colabMap.get(a.colaborador_id)?.nome ?? 'Colaborador'}</p>
                  <p className="text-xs text-muted">Caixa {caixaMap.get(a.caixa_id)?.numero ?? '?'} ({caixaMap.get(a.caixa_id)?.tipo ?? 'n/d'})</p>
                  <p className="text-xs text-muted mt-1">Alocado em {formatTime(a.alocado_em)}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setTimelineColaboradorId(a.colaborador_id)}>Timeline</Button>
                  <Button size="sm" variant="outline" onClick={() => void liberarAlocacao({ alocacaoId: a.id, motivo: 'intervalo' })}>Intervalo</Button>
                  <Button size="sm" variant="outline" onClick={() => void liberarAlocacao({ alocacaoId: a.id, motivo: 'cafe' })}>Cafe</Button>
                  <Button size="sm" variant="outline" onClick={() => void liberarAlocacao({ alocacaoId: a.id, motivo: window.prompt('Motivo da liberacao?') ?? 'liberacao manual' })}>Liberar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-xl">Retorno pos-intervalo</h3>
        {retornosPendentes.length === 0 ? <p className="text-sm text-muted">Nenhum colaborador aguardando retorno.</p> : (
          <div className="space-y-2">
            {retornosPendentes.map((r) => {
              const c = colabMap.get(r.colaboradorId);
              const cx = caixaMap.get(r.caixaId);
              return (
                <div key={r.pausaId} className="flex flex-wrap items-center justify-between rounded-lg border border-cloud px-3 py-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold">{c?.nome ?? r.colaboradorNome}</p>
                    <p className="text-xs text-muted">Finalizou em {formatDateTime(r.finalizadoEm)} | previsto {r.duracaoMinutos} min</p>
                    <p className="text-xs text-muted">Caixa de retorno: {cx ? `Caixa ${cx.numero} (${cx.tipo})` : 'indisponivel'}</p>
                  </div>
                  <Button size="sm" variant="outline" disabled={!cx || updating} onClick={() => void createAlocacao({ colaboradorId: r.colaboradorId, caixaId: r.caixaId, observacoes: 'Retorno pos-intervalo' })}>Retornar ao caixa</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-xl">Timeline de intervalo (manual)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={timelineColaboradorId} onChange={(e) => setTimelineColaboradorId(e.target.value)} className="rounded-xl border border-cloud px-4 py-2">
            <option value="">Selecionar colaborador</option>
            {disponibilidade.map((c) => (<option key={c.id} value={c.id}>{c.nome} - {motivoLabel(c.motivo)}</option>))}
          </select>
          <Button variant="outline" disabled={!timelineRegistro || !!tISaida} onClick={() => void marcarSaidaIntervalo()}>Marcar saida intervalo</Button>
          <Button variant="outline" disabled={!timelineRegistro || !tISaida || !!tIRetorno} onClick={() => void marcarRetornoIntervalo()}>Marcar retorno intervalo</Button>
        </div>
        {!timelineColaboradorId ? <p className="text-sm text-muted">Selecione um colaborador para controlar o intervalo.</p> : !timelineRegistro ? <p className="text-sm text-muted">Sem registro de ponto para {formatDate(hoje)}.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
            <div className="rounded-lg border border-cloud px-3 py-2"><p className="text-xs text-muted">Entrada</p><p className="font-semibold">{tEntrada ?? '--:--'}</p></div>
            <div className="rounded-lg border border-cloud px-3 py-2"><p className="text-xs text-muted">Saida intervalo</p><p className="font-semibold">{tISaida ?? '--:--'}</p></div>
            <div className="rounded-lg border border-cloud px-3 py-2"><p className="text-xs text-muted">Retorno intervalo</p><p className="font-semibold">{tIRetorno ?? '--:--'}</p></div>
            <div className="rounded-lg border border-cloud px-3 py-2"><p className="text-xs text-muted">Saida</p><p className="font-semibold">{tSaida ?? '--:--'}</p></div>
          </div>
        )}
      </Card>
    </div>
  );
}
