import React, { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useCafe } from './useCafe';
import { useAuth } from '../auth/AuthProvider';
import { cn } from '../../shared/lib/cn';

const tabs = [
  { id: 'disponiveis', label: 'DisponÃ­veis' },
  { id: 'em_intervalo', label: 'Em Intervalo' },
  { id: 'ja_fez', label: 'JÃ¡ fez' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function CafePage() {
  const { colaboradores, pausas, isLoading, criarPausa, finalizarPausa, creating } =
    useCafe();
  const { user } = useAuth();
  const [active, setActive] = useState<TabId>('disponiveis');
  const [colaboradorId, setColaboradorId] = useState('');
  const [duracao, setDuracao] = useState('15');
  const [caixaId, setCaixaId] = useState('');

  const colaboradorMap = useMemo(
    () => new Map(colaboradores.map((c) => [c.id, c.nome])),
    [colaboradores]
  );

  const agora = Date.now();
  const emIntervalo = pausas.filter((p) => !p.finalizado_em);
  const jaFez = pausas.filter((p) => p.finalizado_em);
  const disponiveis = colaboradores.filter(
    (c) => !pausas.some((p) => p.colaborador_id === c.id)
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    if (!colaborador) return;
    const duracaoMin = Number(duracao) || 15;
    await criarPausa({
      fiscalId: user?.id ?? '',
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      caixaId: caixaId || null,
      duracaoMinutos: duracaoMin,
    });
    setColaboradorId('');
    setCaixaId('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">GestÃ£o</p>
        <h1 className="font-display text-3xl text-primary">CafÃ© e Intervalos</h1>
        <p className="text-sm text-muted mt-2">
          Controle de pausas com tempo estimado e acompanhamento de atrasos.
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
            onChange={(e) => setColaboradorId(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          >
            <option value="">Selecionar colaborador</option>
            {disponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            placeholder="DuraÃ§Ã£o (min)"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={caixaId}
            onChange={(e) => setCaixaId(e.target.value)}
            placeholder="Caixa (opcional)"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <Button type="submit" disabled={creating} className="md:col-span-4">
            Iniciar pausa
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <Card>Carregando pausas...</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {active === 'disponiveis' ? (
            <Card>
              <h3 className="font-display text-lg mb-3">DisponÃ­veis</h3>
              {disponiveis.length === 0 ? (
                <p className="text-sm text-muted">Nenhum colaborador disponÃ­vel.</p>
              ) : (
                <div className="space-y-2">
                  {disponiveis.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-cloud px-3 py-2 text-sm"
                    >
                      <span>{c.nome}</span>
                      <Button size="sm" variant="outline" onClick={() => setColaboradorId(c.id)}>
                        Enviar para pausa
                      </Button>
                    </div>
                  ))}
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
                    const inicio = new Date(pausa.iniciado_em).getTime();
                    const duracaoMin = pausa.duracao_minutos ?? 15;
                    const emAtraso = agora - inicio > duracaoMin * 60000;
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
                          <p className="text-xs text-muted">
                            InÃ­cio {formatDateTime(pausa.iniciado_em)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => finalizarPausa(pausa.id)}>
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
            <Card>
              <h3 className="font-display text-lg mb-3">JÃ¡ fez</h3>
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
                        <p className="text-xs text-muted">
                          Finalizado {formatDateTime(pausa.finalizado_em)}
                        </p>
                      </div>
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

