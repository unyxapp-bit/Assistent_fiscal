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
import { useAlocacoes } from './useAlocacoes';
import {
  fetchRetornosPosIntervalo,
  jaUsouCaixaHoje,
  type RetornoPosIntervalo,
} from './api';
import type { Caixa, Colaborador } from '../../shared/types';
import { useEscala } from '../escala/useEscala';
import {
  formatHorarioResumo,
  getTurnoEscalaColaboradorId,
  getTurnoEscalaDate,
  getTurnoEscalaHorario,
} from '../escala/api';

type ColaboradorDisponivel = Colaborador & {
  horarioHoje: string;
};

function normalizarHorario(value?: string | null) {
  const formatado = formatTime(value ?? null);
  return formatado === '-' ? null : formatado;
}

function buildExcecaoObservacao(texto: string) {
  const trimmed = texto.trim();
  if (!trimmed) return 'Realocacao por excecao operacional';
  return `[Excecao] ${trimmed}`;
}

export default function AlocacaoPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const inicioDiaIso = useMemo(() => startOfTodayIso(), []);

  const [colaboradorId, setColaboradorId] = useState('');
  const [caixaId, setCaixaId] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [trocaOrigemId, setTrocaOrigemId] = useState('');
  const [trocaDestinoId, setTrocaDestinoId] = useState('');
  const [trocaMotivo, setTrocaMotivo] = useState('');
  const [realocandoId, setRealocandoId] = useState<string | null>(null);
  const [novoCaixaId, setNovoCaixaId] = useState('');
  const [motivoRealocacao, setMotivoRealocacao] = useState('');

  const hoje = todayIsoDate();

  const {
    colaboradores: escalaColaboradores,
    registros,
    turnos,
    isLoading: isEscalaLoading,
  } = useEscala();

  const caixasQuery = useQuery({
    queryKey: ['caixas', fiscalId],
    queryFn: () => fetchCaixas(fiscalId),
    enabled: !!fiscalId,
  });

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

  const colaboradores = escalaColaboradores.filter((colaborador) => colaborador.ativo);
  const caixas = (caixasQuery.data ?? []).filter((caixaItem) => caixaItem.ativo && !caixaItem.em_manutencao);

  const colaboradoresMap = useMemo(() => {
    const map = new Map<string, Colaborador>();
    colaboradores.forEach((colaborador) => map.set(colaborador.id, colaborador));
    return map;
  }, [colaboradores]);

  const caixasMap = useMemo(() => {
    const map = new Map<string, Caixa>();
    caixas.forEach((caixaItem) => map.set(caixaItem.id, caixaItem));
    return map;
  }, [caixas]);

  const alocacaoPorColaborador = useMemo(() => {
    const map = new Map<string, (typeof alocacoes)[number]>();
    alocacoes.forEach((alocacao) => {
      map.set(alocacao.colaborador_id, alocacao);
    });
    return map;
  }, [alocacoes]);

  const horariosHojePorColaborador = useMemo(() => {
    const porColaborador = new Map<string, Set<string>>();

    turnos.forEach((turno) => {
      if (getTurnoEscalaDate(turno) !== hoje) return;
      const colaboradorTurnoId = getTurnoEscalaColaboradorId(turno);
      if (!colaboradorTurnoId) return;
      const resumo = formatHorarioResumo(getTurnoEscalaHorario(turno));
      const atual = porColaborador.get(colaboradorTurnoId) ?? new Set<string>();
      atual.add(resumo);
      porColaborador.set(colaboradorTurnoId, atual);
    });

    registros.forEach((registro) => {
      if (registro.data !== hoje) return;
      const resumo = formatHorarioResumo({
        inicio: normalizarHorario(registro.entrada),
        fim: normalizarHorario(registro.saida),
        intervaloSaida: normalizarHorario(registro.intervalo_saida),
        intervaloRetorno: normalizarHorario(registro.intervalo_retorno),
      });
      const atual = porColaborador.get(registro.colaborador_id) ?? new Set<string>();
      atual.add(resumo);
      porColaborador.set(registro.colaborador_id, atual);
    });

    return new Map(
      Array.from(porColaborador.entries()).map(([colaboradorTurnoId, horarios]) => [
        colaboradorTurnoId,
        Array.from(horarios).join(' | '),
      ])
    );
  }, [hoje, registros, turnos]);

  const colaboradoresDisponiveis: ColaboradorDisponivel[] = useMemo(() => {
    return colaboradores
      .filter(
        (colaborador) =>
          horariosHojePorColaborador.has(colaborador.id) && !alocacaoPorColaborador.has(colaborador.id)
      )
      .map((colaborador) => ({
        ...colaborador,
        horarioHoje: horariosHojePorColaborador.get(colaborador.id) ?? 'Horario nao informado',
      }));
  }, [alocacaoPorColaborador, colaboradores, horariosHojePorColaborador]);

  const disponiveisFiltrados =
    filtroDepto === 'todos'
      ? colaboradoresDisponiveis
      : colaboradoresDisponiveis.filter((colaborador) => colaborador.departamento === filtroDepto);

  const retornosPendentes = useMemo(() => {
    const latestByColaborador = new Map<string, RetornoPosIntervalo>();
    (retornosQuery.data ?? []).forEach((retorno) => {
      if (alocacaoPorColaborador.has(retorno.colaboradorId)) return;
      if (!latestByColaborador.has(retorno.colaboradorId)) {
        latestByColaborador.set(retorno.colaboradorId, retorno);
      }
    });
    return Array.from(latestByColaborador.values());
  }, [alocacaoPorColaborador, retornosQuery.data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);

    const colaborador = colaboradoresMap.get(colaboradorId);
    const caixaSelecionado = caixasMap.get(caixaId);

    if (!colaborador) {
      setErro('Selecione um colaborador valido.');
      return;
    }
    if (!caixaSelecionado) {
      setErro('Selecione um caixa valido.');
      return;
    }

    if (colaborador.departamento === 'self' && caixaSelecionado.tipo !== 'self') {
      setErro('Operador de self-checkout so pode ser alocado em caixa self.');
      return;
    }

    const alocacaoAtual = alocacaoPorColaborador.get(colaboradorId);
    const isBalcao = caixaSelecionado.tipo === 'balcao';

    setLoading(true);
    try {
      if (alocacaoAtual && !isBalcao) {
        if (!justificativa.trim()) {
          setErro('Colaborador ja esta alocado. Informe justificativa para excecao.');
          return;
        }

        await realocarAlocacao({
          alocacaoId: alocacaoAtual.id,
          caixaId,
          observacoes: buildExcecaoObservacao(justificativa),
        });
      } else {
        const jaUsou = await jaUsouCaixaHoje({ colaboradorId, caixaId });
        if (jaUsou && justificativa.trim().length === 0) {
          setErro('Este colaborador ja usou este caixa hoje. Informe justificativa.');
          return;
        }

        await createAlocacao({
          colaboradorId,
          caixaId,
          observacoes: justificativa.trim() || undefined,
        });
      }

      setColaboradorId('');
      setCaixaId('');
      setJustificativa('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao alocar.';
      setErro(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLiberar = async (alocacaoId: string, motivoPadrao?: string) => {
    setErro(null);
    const motivo = motivoPadrao ?? window.prompt('Motivo da liberacao?') ?? '';
    if (!motivo.trim()) return;

    try {
      await liberarAlocacao({ alocacaoId, motivo });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao liberar alocacao.';
      setErro(message);
    }
  };

  const iniciarRealocacao = (alocacaoId: string, caixaAtualId: string) => {
    setRealocandoId(alocacaoId);
    setNovoCaixaId(caixaAtualId);
    setMotivoRealocacao('');
  };

  const salvarRealocacao = async () => {
    if (!realocandoId) return;
    if (!novoCaixaId) {
      setErro('Selecione um caixa para realocar.');
      return;
    }

    setErro(null);

    try {
      await realocarAlocacao({
        alocacaoId: realocandoId,
        caixaId: novoCaixaId,
        observacoes: motivoRealocacao.trim() || 'Realocacao manual',
      });
      setRealocandoId(null);
      setNovoCaixaId('');
      setMotivoRealocacao('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao realocar colaborador.';
      setErro(message);
    }
  };

  const handleTrocaCaixas = async () => {
    setErro(null);

    if (!trocaOrigemId || !trocaDestinoId) {
      setErro('Selecione as duas alocacoes para trocar os caixas.');
      return;
    }
    if (trocaOrigemId === trocaDestinoId) {
      setErro('Selecione alocacoes diferentes para a troca.');
      return;
    }

    const origem = alocacoes.find((alocacao) => alocacao.id === trocaOrigemId);
    const destino = alocacoes.find((alocacao) => alocacao.id === trocaDestinoId);

    if (!origem || !destino) {
      setErro('Nao foi possivel localizar as alocacoes selecionadas.');
      return;
    }

    const colaboradorOrigem = colaboradoresMap.get(origem.colaborador_id);
    const colaboradorDestino = colaboradoresMap.get(destino.colaborador_id);
    const caixaOrigem = caixasMap.get(origem.caixa_id);
    const caixaDestino = caixasMap.get(destino.caixa_id);

    if (!caixaOrigem || !caixaDestino) {
      setErro('A troca exige caixas ativos e visiveis no momento.');
      return;
    }

    if (colaboradorOrigem?.departamento === 'self' && caixaDestino.tipo !== 'self') {
      setErro('Nao e permitido mover operador self para caixa nao-self.');
      return;
    }

    if (colaboradorDestino?.departamento === 'self' && caixaOrigem.tipo !== 'self') {
      setErro('Nao e permitido mover operador self para caixa nao-self.');
      return;
    }

    try {
      await trocarCaixas({
        alocacaoOrigemId: origem.id,
        caixaOrigemId: origem.caixa_id,
        alocacaoDestinoId: destino.id,
        caixaDestinoId: destino.caixa_id,
        motivo: trocaMotivo.trim() || undefined,
      });

      setTrocaOrigemId('');
      setTrocaDestinoId('');
      setTrocaMotivo('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao trocar caixas.';
      setErro(message);
    }
  };

  const handleRetornoPosIntervalo = async (retorno: RetornoPosIntervalo) => {
    setErro(null);

    if (alocacaoPorColaborador.has(retorno.colaboradorId)) {
      setErro('Este colaborador ja voltou para uma alocacao ativa.');
      return;
    }

    const caixaRetorno = caixasMap.get(retorno.caixaId);
    if (!caixaRetorno) {
      setErro('Caixa original do retorno nao esta ativo/disponivel no momento.');
      return;
    }

    try {
      await createAlocacao({
        colaboradorId: retorno.colaboradorId,
        caixaId: retorno.caixaId,
        observacoes: 'Retorno pos-intervalo',
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao retornar colaborador do intervalo.';
      setErro(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestao</p>
        <h1 className="font-display text-3xl text-primary">Alocacao</h1>
        <p className="text-sm text-muted mt-2">
          Colaboradores disponiveis em {formatDate(hoje)} com horarios vindos da escala.
        </p>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
          <select
            value={filtroDepto}
            onChange={(event) => setFiltroDepto(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="todos">Todos os departamentos</option>
            {[...new Set(colaboradoresDisponiveis.map((colaborador) => colaborador.departamento))].map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          <select
            value={colaboradorId}
            onChange={(event) => setColaboradorId(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="">Selecione colaborador</option>
            {disponiveisFiltrados.map((colaborador) => (
              <option key={colaborador.id} value={colaborador.id}>
                {colaborador.nome} ({colaborador.departamento}) - {colaborador.horarioHoje}
              </option>
            ))}
          </select>
          <select
            value={caixaId}
            onChange={(event) => setCaixaId(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="">Selecione caixa</option>
            {caixas.map((caixaItem) => (
              <option key={caixaItem.id} value={caixaItem.id}>
                Caixa {caixaItem.numero} ({caixaItem.tipo})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Justificativa (obrigatoria em excecao)"
            value={justificativa}
            onChange={(event) => setJustificativa(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <Button type="submit" disabled={loading || updating || caixasQuery.isLoading}>
            {loading ? 'Processando...' : 'Alocar colaborador'}
          </Button>
          {erro ? <p className="text-sm text-danger md:col-span-3">{erro}</p> : null}
        </form>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-xl">Troca rapida de caixas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={trocaOrigemId}
            onChange={(event) => setTrocaOrigemId(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="">Alocacao origem</option>
            {alocacoes.map((alocacao) => {
              const colaborador = colaboradoresMap.get(alocacao.colaborador_id);
              const caixaItem = caixasMap.get(alocacao.caixa_id);
              return (
                <option key={alocacao.id} value={alocacao.id}>
                  {colaborador?.nome ?? 'Colaborador'} - Caixa {caixaItem?.numero ?? '?'}
                </option>
              );
            })}
          </select>
          <select
            value={trocaDestinoId}
            onChange={(event) => setTrocaDestinoId(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="">Alocacao destino</option>
            {alocacoes.map((alocacao) => {
              const colaborador = colaboradoresMap.get(alocacao.colaborador_id);
              const caixaItem = caixasMap.get(alocacao.caixa_id);
              return (
                <option key={alocacao.id} value={alocacao.id}>
                  {colaborador?.nome ?? 'Colaborador'} - Caixa {caixaItem?.numero ?? '?'}
                </option>
              );
            })}
          </select>
          <input
            value={trocaMotivo}
            onChange={(event) => setTrocaMotivo(event.target.value)}
            placeholder="Motivo da troca (opcional)"
            className="rounded-xl border border-cloud px-4 py-2"
          />
        </div>
        <Button variant="outline" disabled={updating} onClick={() => void handleTrocaCaixas()}>
          Trocar caixas
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="font-display text-xl">Disponiveis hoje</h3>
          {isEscalaLoading ? <p className="text-sm text-muted">Carregando escala...</p> : null}
          {disponiveisFiltrados.length === 0 ? (
            <p className="text-sm text-muted">Nenhum colaborador com disponibilidade na escala de hoje.</p>
          ) : (
            <div className="space-y-2">
              {disponiveisFiltrados.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className="flex items-start justify-between rounded-lg border border-cloud px-3 py-2 text-sm gap-3"
                >
                  <div>
                    <p>
                      {colaborador.nome} - {colaborador.departamento}
                    </p>
                    <p className="text-xs text-muted mt-1">{colaborador.horarioHoje}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setColaboradorId(colaborador.id)}
                  >
                    Alocar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {alocacoes.length === 0 ? (
          <Card>Nenhuma alocacao ativa.</Card>
        ) : (
          <Card className="space-y-3">
            <h3 className="font-display text-xl">Alocacoes ativas</h3>
            <div className="space-y-2">
              {alocacoes.map((alocacao) => {
                const colaborador = colaboradoresMap.get(alocacao.colaborador_id);
                const caixaItem = caixasMap.get(alocacao.caixa_id);
                const isRealocando = realocandoId === alocacao.id;

                return (
                  <div
                    key={alocacao.id}
                    className="rounded-lg border border-cloud px-3 py-2 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{colaborador?.nome ?? 'Colaborador'}</p>
                        <p className="text-xs text-muted">
                          Caixa {caixaItem?.numero ?? '?'} ({caixaItem?.tipo ?? 'n/d'})
                        </p>
                        <p className="text-xs text-muted mt-1">
                          Alocado em {formatTime(alocacao.alocado_em)}
                        </p>
                        {alocacao.observacoes ? (
                          <p className="text-xs text-muted mt-1">Obs: {alocacao.observacoes}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => iniciarRealocacao(alocacao.id, alocacao.caixa_id)}
                        >
                          Realocar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleLiberar(alocacao.id, 'intervalo')}
                        >
                          Intervalo
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleLiberar(alocacao.id, 'cafe')}
                        >
                          Cafe
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleLiberar(alocacao.id)}
                        >
                          Liberar
                        </Button>
                      </div>
                    </div>

                    {isRealocando ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                        <select
                          value={novoCaixaId}
                          onChange={(event) => setNovoCaixaId(event.target.value)}
                          className="rounded-xl border border-cloud px-3 py-2 text-sm"
                        >
                          <option value="">Novo caixa</option>
                          {caixas
                            .filter((caixaDisponivel) => caixaDisponivel.id !== alocacao.caixa_id)
                            .map((caixaDisponivel) => (
                              <option key={caixaDisponivel.id} value={caixaDisponivel.id}>
                                Caixa {caixaDisponivel.numero} ({caixaDisponivel.tipo})
                              </option>
                            ))}
                        </select>
                        <input
                          value={motivoRealocacao}
                          onChange={(event) => setMotivoRealocacao(event.target.value)}
                          className="rounded-xl border border-cloud px-3 py-2 text-sm"
                          placeholder="Motivo da realocacao"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => void salvarRealocacao()}>
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRealocandoId(null);
                              setNovoCaixaId('');
                              setMotivoRealocacao('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl">Retorno pos-intervalo</h3>
          {retornosQuery.isLoading ? <span className="text-xs text-muted">Carregando...</span> : null}
        </div>

        {retornosPendentes.length === 0 ? (
          <p className="text-sm text-muted">Nenhum colaborador aguardando realocacao pos-intervalo.</p>
        ) : (
          <div className="space-y-2">
            {retornosPendentes.map((retorno) => {
              const colaborador = colaboradoresMap.get(retorno.colaboradorId);
              const caixaItem = caixasMap.get(retorno.caixaId);

              return (
                <div
                  key={retorno.pausaId}
                  className="flex flex-wrap items-center justify-between rounded-lg border border-cloud px-3 py-2 gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {colaborador?.nome ?? retorno.colaboradorNome}
                    </p>
                    <p className="text-xs text-muted">
                      Finalizou pausa em {formatDateTime(retorno.finalizadoEm)} · duracao prevista {retorno.duracaoMinutos} min
                    </p>
                    <p className="text-xs text-muted">
                      Caixa de retorno: {caixaItem ? `Caixa ${caixaItem.numero} (${caixaItem.tipo})` : 'indisponivel'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!caixaItem || updating}
                    onClick={() => void handleRetornoPosIntervalo(retorno)}
                  >
                    Retornar ao caixa
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
