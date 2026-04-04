import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { fetchCaixas } from '../dashboard/api';
import { useAlocacoes } from './useAlocacoes';
import { jaUsouCaixaHoje } from './api';
import type { Caixa, Colaborador } from '../../shared/types';
import { useEscala } from '../escala/useEscala';
import {
  formatHorarioResumo,
  getTurnoEscalaColaboradorId,
  getTurnoEscalaDate,
  getTurnoEscalaHorario,
} from '../escala/api';
import { formatDate, formatTime, todayIsoDate } from '../../shared/lib/dates';

type ColaboradorDisponivel = Colaborador & {
  horarioHoje: string;
};

function normalizarHorario(value?: string | null) {
  const formatado = formatTime(value ?? null);
  return formatado === '-' ? null : formatado;
}

export default function AlocacaoPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const [colaboradorId, setColaboradorId] = useState('');
  const [caixaId, setCaixaId] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroDepto, setFiltroDepto] = useState('todos');
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

  const { data: alocacoes = [], createAlocacao, liberarAlocacao, updating } =
    useAlocacoes();

  const colaboradores = escalaColaboradores.filter((c) => c.ativo);
  const caixas = (caixasQuery.data ?? []).filter((c) => c.ativo && !c.em_manutencao);

  const colaboradoresMap = useMemo(() => {
    const map = new Map<string, Colaborador>();
    colaboradores.forEach((c) => map.set(c.id, c));
    return map;
  }, [colaboradores]);

  const caixasMap = useMemo(() => {
    const map = new Map<string, Caixa>();
    caixas.forEach((c) => map.set(c.id, c));
    return map;
  }, [caixas]);

  const horariosHojePorColaborador = useMemo(() => {
    const porColaborador = new Map<string, Set<string>>();

    turnos.forEach((turno) => {
      if (getTurnoEscalaDate(turno) !== hoje) return;
      const colaborador = getTurnoEscalaColaboradorId(turno);
      if (!colaborador) return;
      const resumo = formatHorarioResumo(getTurnoEscalaHorario(turno));
      const atual = porColaborador.get(colaborador) ?? new Set<string>();
      atual.add(resumo);
      porColaborador.set(colaborador, atual);
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
      Array.from(porColaborador.entries()).map(([colaborador, horarios]) => [
        colaborador,
        Array.from(horarios).join(' • '),
      ])
    );
  }, [hoje, registros, turnos]);

  const colaboradoresDisponiveis: ColaboradorDisponivel[] = useMemo(() => {
    return colaboradores
      .filter(
        (c) =>
          horariosHojePorColaborador.has(c.id) &&
          !alocacoes.some((a) => a.colaborador_id === c.id)
      )
      .map((c) => ({
        ...c,
        horarioHoje: horariosHojePorColaborador.get(c.id) ?? 'Horario nao informado',
      }));
  }, [alocacoes, colaboradores, horariosHojePorColaborador]);

  const disponiveisFiltrados =
    filtroDepto === 'todos'
      ? colaboradoresDisponiveis
      : colaboradoresDisponiveis.filter((c) => c.departamento === filtroDepto);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);

    const colaborador = colaboradoresMap.get(colaboradorId);
    const caixa = caixasMap.get(caixaId);

    if (!colaborador) {
      setErro('Selecione um colaborador valido.');
      return;
    }
    if (!caixa) {
      setErro('Selecione um caixa valido.');
      return;
    }

    if (colaborador.departamento === 'self' && caixa.tipo !== 'self') {
      setErro('Operador de self-checkout so pode ser alocado em caixa self.');
      return;
    }

    const isBalcao = caixa.tipo === 'balcao';
    const colaboradorJaAlocado = alocacoes.some(
      (a) => a.colaborador_id === colaboradorId
    );
    if (!isBalcao && colaboradorJaAlocado) {
      setErro('Colaborador ja esta alocado em outro caixa.');
      return;
    }

    setLoading(true);
    try {
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
      setColaboradorId('');
      setCaixaId('');
      setJustificativa('');
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao alocar.');
    } finally {
      setLoading(false);
    }
  };

  const handleLiberar = async (alocacaoId: string) => {
    const motivo = window.prompt('Motivo da liberacao?') ?? '';
    if (!motivo.trim()) return;
    await liberarAlocacao({ alocacaoId, motivo });
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
            onChange={(e) => setFiltroDepto(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="todos">Todos os departamentos</option>
            {[...new Set(colaboradoresDisponiveis.map((c) => c.departamento))].map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="">Selecione colaborador</option>
            {disponiveisFiltrados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.departamento}) - {c.horarioHoje}
              </option>
            ))}
          </select>
          <select
            value={caixaId}
            onChange={(e) => setCaixaId(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            <option value="">Selecione caixa</option>
            {caixas.map((c) => (
              <option key={c.id} value={c.id}>
                Caixa {c.numero} ({c.tipo})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Justificativa (opcional)"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <div className="md:col-span-3">
            {erro ? <p className="text-sm text-danger mb-2">{erro}</p> : null}
            <Button type="submit" disabled={loading || updating || caixasQuery.isLoading}>
              {loading ? 'Alocando...' : 'Alocar colaborador'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="font-display text-xl">Disponiveis hoje</h3>
          {isEscalaLoading ? <p className="text-sm text-muted">Carregando escala...</p> : null}
          {disponiveisFiltrados.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhum colaborador com disponibilidade na escala de hoje.
            </p>
          ) : (
            <div className="space-y-2">
              {disponiveisFiltrados.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between rounded-lg border border-cloud px-3 py-2 text-sm gap-3"
                >
                  <div>
                    <p>
                      {c.nome} - {c.departamento}
                    </p>
                    <p className="text-xs text-muted mt-1">{c.horarioHoje}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setColaboradorId(c.id)}>
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
          <Card>
            <h3 className="font-display text-xl mb-3">Alocacoes ativas</h3>
            <div className="space-y-2">
              {alocacoes.map((alocacao) => {
                const colaborador = colaboradoresMap.get(alocacao.colaborador_id);
                const caixa = caixasMap.get(alocacao.caixa_id);
                return (
                  <div
                    key={alocacao.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-cloud px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold">{colaborador?.nome ?? 'Colaborador'}</p>
                      <p className="text-xs text-muted">
                        Caixa {caixa?.numero ?? '?'} ({caixa?.tipo ?? 'n/d'})
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Alocado em {new Date(alocacao.alocado_em).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleLiberar(alocacao.id)}>
                      Liberar
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
