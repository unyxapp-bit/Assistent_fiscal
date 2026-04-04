import React, { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useCafe } from './useCafe';
import { cn } from '../../shared/lib/cn';
import { criarOcorrencia } from '../ocorrencias/api';

const tabs = [
  { id: 'disponiveis', label: 'Disponiveis' },
  { id: 'em_intervalo', label: 'Em intervalo' },
  { id: 'ja_fez', label: 'Ja fez' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function minutosDecorridos(iniciadoEm: string) {
  const inicio = new Date(iniciadoEm).getTime();
  const agora = Date.now();
  return Math.max(Math.floor((agora - inicio) / 60000), 0);
}

export default function CafePage() {
  const {
    colaboradores,
    pausas,
    isLoading,
    criarPausa,
    finalizarPausa,
    removerPausa,
    limparHistorico,
    fiscalId,
    creating,
    updating,
  } = useCafe();

  const [active, setActive] = useState<TabId>('disponiveis');
  const [colaboradorId, setColaboradorId] = useState('');
  const [duracao, setDuracao] = useState('15');
  const [caixaId, setCaixaId] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const colaboradorMap = useMemo(
    () => new Map(colaboradores.map((colaborador) => [colaborador.id, colaborador.nome])),
    [colaboradores]
  );

  const emIntervalo = pausas.filter((pausa) => !pausa.finalizado_em);
  const jaFez = pausas.filter((pausa) => pausa.finalizado_em);

  const pausasFinalizadasPorColaborador = useMemo(() => {
    const map = new Map<string, number>();
    jaFez.forEach((pausa) => {
      map.set(pausa.colaborador_id, (map.get(pausa.colaborador_id) ?? 0) + 1);
    });
    return map;
  }, [jaFez]);

  const disponiveis = colaboradores.filter(
    (colaborador) => !emIntervalo.some((pausa) => pausa.colaborador_id === colaborador.id)
  );

  const jaFezSelecionado = colaboradorId
    ? (pausasFinalizadasPorColaborador.get(colaboradorId) ?? 0) > 0
    : false;

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);

    const colaborador = colaboradores.find((item) => item.id === colaboradorId);
    if (!colaborador) {
      setErro('Selecione um colaborador valido.');
      return;
    }

    const emPausa = emIntervalo.some((pausa) => pausa.colaborador_id === colaborador.id);
    if (emPausa) {
      setErro('Este colaborador ja esta em pausa.');
      return;
    }

    const duracaoMin = Number(duracao) || 15;
    const pausasJaFinalizadas = pausasFinalizadasPorColaborador.get(colaborador.id) ?? 0;

    let motivoExtra: string | null = null;
    if (pausasJaFinalizadas > 0) {
      const confirmouExtra = window.confirm(
        `${colaborador.nome} ja realizou ${pausasJaFinalizadas} intervalo(s) hoje. Registrar novo intervalo extra?`
      );
      if (!confirmouExtra) return;

      const motivo = window.prompt('Informe a justificativa do intervalo extra:') ?? '';
      if (!motivo.trim()) {
        setErro('A justificativa e obrigatoria para intervalo extra.');
        return;
      }
      motivoExtra = motivo.trim();
    }

    try {
      await criarPausa({
        fiscalId,
        colaboradorId: colaborador.id,
        colaboradorNome: colaborador.nome,
        caixaId: caixaId || null,
        duracaoMinutos: duracaoMin,
      });

      if (motivoExtra && fiscalId) {
        await criarOcorrencia({
          fiscalId,
          tipo: 'intervalo_extra',
          gravidade: 'baixa',
          colaboradorId: colaborador.id,
          caixaId: caixaId || null,
          descricao: `Intervalo extra autorizado: ${motivoExtra}`,
        });
      }

      setColaboradorId('');
      setCaixaId('');
      setDuracao('15');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao iniciar pausa.';
      setErro(message);
    }
  };

  const handleFinalizar = async (pausaId: string) => {
    setErro(null);

    const pausa = emIntervalo.find((item) => item.id === pausaId);
    if (!pausa) return;

    const decorrido = minutosDecorridos(pausa.iniciado_em);
    const duracaoPrevista = pausa.duracao_minutos ?? 15;

    let motivoAntecipacao: string | null = null;
    if (decorrido < duracaoPrevista) {
      const confirmou = window.confirm(
        `Pausa com ${decorrido} min de ${duracaoPrevista} min previstos. Finalizar mesmo assim?`
      );
      if (!confirmou) return;

      const motivo = window.prompt('Informe o motivo da finalizacao antecipada:') ?? '';
      if (!motivo.trim()) {
        setErro('O motivo e obrigatorio para finalizar antes do tempo previsto.');
        return;
      }
      motivoAntecipacao = motivo.trim();
    }

    try {
      await finalizarPausa({ pausaId: pausa.id });

      if (motivoAntecipacao && fiscalId) {
        await criarOcorrencia({
          fiscalId,
          tipo: 'intervalo_incompleto',
          gravidade: 'media',
          colaboradorId: pausa.colaborador_id,
          caixaId: pausa.caixa_id ?? null,
          descricao: `Intervalo encerrado antes do previsto (${decorrido}/${duracaoPrevista} min): ${motivoAntecipacao}`,
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao finalizar pausa.';
      setErro(message);
    }
  };

  const handleRemoverHistorico = async (pausaId: string) => {
    const confirmou = window.confirm('Remover este registro de pausa do historico?');
    if (!confirmou) return;

    setErro(null);
    try {
      await removerPausa(pausaId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao remover registro de pausa.';
      setErro(message);
    }
  };

  const handleLimparHistorico = async () => {
    const confirmou = window.confirm('Limpar todo o historico de pausas finalizadas de hoje?');
    if (!confirmou) return;

    setErro(null);
    try {
      await limparHistorico();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao limpar historico de pausas.';
      setErro(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestao</p>
        <h1 className="font-display text-3xl text-primary">Cafe e Intervalos</h1>
        <p className="text-sm text-muted mt-2">
          Controle de pausas com regras de intervalo extra e finalizacao assistida.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm border',
              active === tab.id ? 'bg-primary text-white border-primary' : 'border-cloud'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleCreate}>
          <select
            value={colaboradorId}
            onChange={(event) => setColaboradorId(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          >
            <option value="">Selecionar colaborador</option>
            {disponiveis.map((colaborador) => (
              <option key={colaborador.id} value={colaborador.id}>
                {colaborador.nome}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={duracao}
            onChange={(event) => setDuracao(event.target.value)}
            placeholder="Duracao (min)"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={caixaId}
            onChange={(event) => setCaixaId(event.target.value)}
            placeholder="Caixa (opcional)"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <Button type="submit" disabled={creating} className="md:col-span-4">
            Iniciar pausa
          </Button>
          {jaFezSelecionado ? (
            <p className="text-xs text-danger md:col-span-4">
              Este colaborador ja fez intervalo hoje. O sistema vai exigir justificativa de intervalo extra.
            </p>
          ) : null}
          {erro ? <p className="text-sm text-danger md:col-span-4">{erro}</p> : null}
        </form>
      </Card>

      {isLoading ? (
        <Card>Carregando pausas...</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {active === 'disponiveis' ? (
            <Card>
              <h3 className="font-display text-lg mb-3">Disponiveis</h3>
              {disponiveis.length === 0 ? (
                <p className="text-sm text-muted">Nenhum colaborador disponivel.</p>
              ) : (
                <div className="space-y-2">
                  {disponiveis.map((colaborador) => {
                    const pausasFinalizadas =
                      pausasFinalizadasPorColaborador.get(colaborador.id) ?? 0;

                    return (
                      <div
                        key={colaborador.id}
                        className="flex items-center justify-between rounded-lg border border-cloud px-3 py-2 text-sm"
                      >
                        <div>
                          <span>{colaborador.nome}</span>
                          {pausasFinalizadas > 0 ? (
                            <p className="text-xs text-danger">
                              Ja fez {pausasFinalizadas} intervalo(s) hoje
                            </p>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setColaboradorId(colaborador.id)}
                        >
                          Enviar para pausa
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : null}

          {active === 'em_intervalo' ? (
            <Card>
              <h3 className="font-display text-lg mb-3">Em intervalo</h3>
              {emIntervalo.length === 0 ? (
                <p className="text-sm text-muted">Nenhuma pausa em andamento.</p>
              ) : (
                <div className="space-y-2">
                  {emIntervalo.map((pausa) => {
                    const duracaoPrevista = pausa.duracao_minutos ?? 15;
                    const decorrido = minutosDecorridos(pausa.iniciado_em);
                    const emAtraso = decorrido > duracaoPrevista;

                    return (
                      <div
                        key={pausa.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                          emAtraso ? 'border-danger/40 bg-danger/5 text-danger' : 'border-cloud'
                        )}
                      >
                        <div>
                          <p>{colaboradorMap.get(pausa.colaborador_id) ?? pausa.colaborador_nome}</p>
                          <p className="text-xs text-muted">Inicio {formatDateTime(pausa.iniciado_em)}</p>
                          <p className="text-xs text-muted">
                            {decorrido} min de {duracaoPrevista} min
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating}
                          onClick={() => void handleFinalizar(pausa.id)}
                        >
                          Finalizar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : null}

          {active === 'ja_fez' ? (
            <Card className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg">Ja fez</h3>
                <Button size="sm" variant="ghost" disabled={updating} onClick={() => void handleLimparHistorico()}>
                  Limpar historico
                </Button>
              </div>
              {jaFez.length === 0 ? (
                <p className="text-sm text-muted">Nenhum intervalo finalizado.</p>
              ) : (
                <div className="space-y-2">
                  {jaFez.map((pausa) => (
                    <div
                      key={pausa.id}
                      className="flex items-center justify-between rounded-lg border border-cloud px-3 py-2 text-sm"
                    >
                      <div>
                        <p>{colaboradorMap.get(pausa.colaborador_id) ?? pausa.colaborador_nome}</p>
                        <p className="text-xs text-muted">Finalizado {formatDateTime(pausa.finalizado_em)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updating}
                        onClick={() => void handleRemoverHistorico(pausa.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
