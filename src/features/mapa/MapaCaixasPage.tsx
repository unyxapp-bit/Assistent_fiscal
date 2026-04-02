import React, { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useMapa } from './useMapa';

const tipos = ['rapido', 'normal', 'self', 'balcao'] as const;

export default function MapaCaixasPage() {
  const {
    caixas,
    colaboradores,
    alocacoes,
    plantao,
    outroSetor,
    isLoading,
    addPlantao,
    removePlantao,
    addOutroSetor,
    removeOutroSetor,
    updating,
  } = useMapa();

  const [plantaoId, setPlantaoId] = useState('');
  const [outroId, setOutroId] = useState('');
  const [setor, setSetor] = useState('');

  const colaboradorMap = useMemo(
    () => new Map(colaboradores.map((c) => [c.id, c.nome])),
    [colaboradores]
  );

  const alocacaoPorCaixa = useMemo(() => {
    const map = new Map<string, (typeof alocacoes)[number]>();
    alocacoes.forEach((a) => map.set(a.caixa_id, a));
    return map;
  }, [alocacoes]);

  const caixasPorTipo = useMemo(() => {
    const grouped: Record<string, typeof caixas> = {};
    tipos.forEach((t) => (grouped[t] = []));
    caixas.forEach((c) => {
      const key = grouped[c.tipo] ? c.tipo : 'normal';
      grouped[key].push(c);
    });
    return grouped;
  }, [caixas]);

  const handleAddPlantao = async () => {
    if (!plantaoId) return;
    await addPlantao(plantaoId);
    setPlantaoId('');
  };

  const handleAddOutro = async () => {
    if (!outroId || !setor.trim()) return;
    await addOutroSetor({ colaboradorId: outroId, setor: setor.trim() });
    setOutroId('');
    setSetor('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">GestÃ£o</p>
        <h1 className="font-display text-3xl text-primary">Mapa de Caixas</h1>
        <p className="text-sm text-muted mt-2">
          VisualizaÃ§Ã£o por tipo de caixa, empacotadores e colaboradores em outros setores.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 space-y-4">
          <h2 className="font-display text-lg">Mapa por tipo</h2>
          {isLoading ? (
            <p className="text-sm text-muted">Carregando mapa...</p>
          ) : (
            tipos.map((tipo) => (
              <div key={tipo}>
                <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">{tipo}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(caixasPorTipo[tipo] ?? []).map((caixa) => {
                    const alocacao = alocacaoPorCaixa.get(caixa.id);
                    const colaboradorNome = alocacao
                      ? colaboradorMap.get(alocacao.colaborador_id) ?? 'Colaborador'
                      : null;
                    const status = !caixa.ativo
                      ? 'Inativo'
                      : caixa.em_manutencao
                        ? 'ManutenÃ§Ã£o'
                        : alocacao
                          ? 'Ocupado'
                          : 'Livre';
                    return (
                      <div
                        key={caixa.id}
                        className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-2 text-ink"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-base">Caixa {caixa.numero}</h3>
                            <p className="text-xs text-muted">Tipo: {caixa.tipo}</p>
                          </div>
                          <span className="rounded-full border border-border px-2 py-1 text-xs text-muted bg-emerald-50">
                            {status}
                          </span>
                        </div>
                        {alocacao ? (
                          <div className="text-sm">
                            <p>{colaboradorNome}</p>
                            <p className="text-xs text-muted">
                              Alocado em {formatDateTime(alocacao.alocado_em)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted">Caixa livre no momento.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-display text-lg mb-3">Empacotadores (plantÃ£o)</h2>
            <div className="flex gap-2">
              <select
                value={plantaoId}
                onChange={(e) => setPlantaoId(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-ink"
              >
                <option value="">Selecionar colaborador</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleAddPlantao} disabled={updating}>
                Adicionar
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {plantao.length === 0 ? (
                <p className="text-xs text-muted">Nenhum empacotador registrado.</p>
              ) : (
                plantao.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <span>{colaboradorMap.get(item.colaborador_id) ?? item.colaborador_id}</span>
                    <Button size="sm" variant="ghost" onClick={() => removePlantao(item.id)}>
                      Remover
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg mb-3">Outro setor</h2>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={outroId}
                onChange={(e) => setOutroId(e.target.value)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-ink"
              >
                <option value="">Selecionar colaborador</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <input
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Setor"
                className="rounded-xl border border-border bg-surface px-4 py-2 text-ink"
              />
              <Button size="sm" onClick={handleAddOutro} disabled={updating}>
                Registrar
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {outroSetor.length === 0 ? (
                <p className="text-xs text-muted">Nenhum registro hoje.</p>
              ) : (
                outroSetor.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <div>
                      <p>{colaboradorMap.get(item.colaborador_id) ?? item.colaborador_id}</p>
                      <p className="text-xs text-muted">{item.setor}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeOutroSetor(item.id)}>
                      Remover
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

