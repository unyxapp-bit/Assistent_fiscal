import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';

type SetorInput = {
  id: string;
  nome: string;
  demandaHora: number;
  capacidadeHoraPorColaborador: number;
  alocados: number;
};

type SetorResultado = {
  id: string;
  nome: string;
  demandaHora: number;
  capacidadeHoraPorColaborador: number;
  alocados: number;
  capacidadeMinima: number;
  folga: number;
  utilizacao: number;
  risco: 'baixo' | 'medio' | 'alto';
};

function parseTurnoTime(value: string) {
  const [h, m] = value.split(':');
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

function capacidadeMinima(demandaHora: number, capacidadeHoraPorColaborador: number) {
  if (demandaHora <= 0 || capacidadeHoraPorColaborador <= 0) return 0;
  return Math.ceil(demandaHora / capacidadeHoraPorColaborador);
}

function calcularPorSetor(setor: SetorInput): SetorResultado {
  const minima = capacidadeMinima(setor.demandaHora, setor.capacidadeHoraPorColaborador);
  const folga = setor.alocados - minima;
  const capacidadeTotal = setor.alocados * Math.max(setor.capacidadeHoraPorColaborador, 0);
  const utilizacao = capacidadeTotal > 0 ? Math.min((setor.demandaHora / capacidadeTotal) * 100, 999) : 0;

  let risco: SetorResultado['risco'] = 'baixo';
  if (folga < 0 || utilizacao >= 95) risco = 'alto';
  else if (folga === 0 || utilizacao >= 80) risco = 'medio';

  return {
    ...setor,
    capacidadeMinima: minima,
    folga,
    utilizacao,
    risco,
  };
}

const setoresIniciais: SetorInput[] = [
  {
    id: 'setor_caixas',
    nome: 'Caixas',
    demandaHora: 120,
    capacidadeHoraPorColaborador: 35,
    alocados: 3,
  },
  {
    id: 'setor_self',
    nome: 'Self-checkout',
    demandaHora: 80,
    capacidadeHoraPorColaborador: 40,
    alocados: 2,
  },
  {
    id: 'setor_embalagem',
    nome: 'Pacote',
    demandaHora: 95,
    capacidadeHoraPorColaborador: 30,
    alocados: 3,
  },
];

export default function GargaloCalculatorPage() {
  const [inicio, setInicio] = useState('08:00');
  const [fim, setFim] = useState('18:00');
  const [intervaloMin, setIntervaloMin] = useState(30);
  const [setores, setSetores] = useState<SetorInput[]>(setoresIniciais);

  const turnoMin = useMemo(() => {
    const start = parseTurnoTime(inicio);
    const end = parseTurnoTime(fim);
    if (end <= start) return 0;
    return end - start;
  }, [fim, inicio]);

  const resultados = useMemo(() => setores.map(calcularPorSetor), [setores]);
  const gargalos = resultados.filter((r) => r.folga < 0);
  const noLimite = resultados.filter((r) => r.folga === 0);

  const totalDemanda = resultados.reduce((acc, r) => acc + r.demandaHora, 0);
  const totalCapacidade = resultados.reduce(
    (acc, r) => acc + r.alocados * Math.max(r.capacidadeHoraPorColaborador, 0),
    0
  );
  const capacidadeGlobal = totalCapacidade > 0 ? (totalDemanda / totalCapacidade) * 100 : 0;
  const janelas = intervaloMin > 0 ? Math.floor(turnoMin / intervaloMin) : 0;

  const updateSetor = (id: string, patch: Partial<SetorInput>) => {
    setSetores((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addSetor = () => {
    const id = `setor_${Date.now()}`;
    setSetores((prev) => [
      ...prev,
      {
        id,
        nome: 'Novo setor',
        demandaHora: 0,
        capacidadeHoraPorColaborador: 25,
        alocados: 1,
      },
    ]);
  };

  const removeSetor = (id: string) => {
    setSetores((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestao</p>
          <h1 className="font-display text-3xl text-primary">Calculadora de Gargalo</h1>
          <p className="text-sm text-muted mt-2">
            Estime capacidade minima por setor e identifique gargalos do turno.
          </p>
        </div>
        <Link to="/gestao">
          <Button variant="outline">Voltar para gestao</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="text-sm text-muted">
          Inicio do turno
          <input
            type="time"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="mt-2 w-full rounded-xl border border-cloud px-4 py-2"
          />
        </label>
        <label className="text-sm text-muted">
          Fim do turno
          <input
            type="time"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="mt-2 w-full rounded-xl border border-cloud px-4 py-2"
          />
        </label>
        <label className="text-sm text-muted">
          Janela (min)
          <input
            type="number"
            min={5}
            step={5}
            value={intervaloMin}
            onChange={(e) => setIntervaloMin(Math.max(Number(e.target.value) || 0, 0))}
            className="mt-2 w-full rounded-xl border border-cloud px-4 py-2"
          />
        </label>
        <div className="text-sm text-muted flex items-end">
          Turno: {Math.floor(turnoMin / 60)}h {turnoMin % 60}m • Janelas: {janelas}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-muted">Setores em gargalo</p>
          <p className="text-2xl font-semibold text-ink">{gargalos.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Setores no limite</p>
          <p className="text-2xl font-semibold text-ink">{noLimite.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Utilizacao global</p>
          <p className="text-2xl font-semibold text-ink">{capacidadeGlobal.toFixed(1)}%</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg">Entradas por setor</h2>
          <Button variant="outline" onClick={addSetor}>
            Adicionar setor
          </Button>
        </div>

        <div className="space-y-3">
          {setores.map((setor) => (
            <div
              key={setor.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 rounded-xl border border-cloud p-3"
            >
              <input
                value={setor.nome}
                onChange={(e) => updateSetor(setor.id, { nome: e.target.value })}
                className="rounded-xl border border-cloud px-4 py-2"
                placeholder="Setor"
              />
              <input
                type="number"
                min={0}
                value={setor.demandaHora}
                onChange={(e) =>
                  updateSetor(setor.id, {
                    demandaHora: Math.max(Number(e.target.value) || 0, 0),
                  })
                }
                className="rounded-xl border border-cloud px-4 py-2"
                placeholder="Demanda/h"
              />
              <input
                type="number"
                min={1}
                value={setor.capacidadeHoraPorColaborador}
                onChange={(e) =>
                  updateSetor(setor.id, {
                    capacidadeHoraPorColaborador: Math.max(Number(e.target.value) || 1, 1),
                  })
                }
                className="rounded-xl border border-cloud px-4 py-2"
                placeholder="Capacidade por colab/h"
              />
              <input
                type="number"
                min={0}
                value={setor.alocados}
                onChange={(e) =>
                  updateSetor(setor.id, {
                    alocados: Math.max(Number(e.target.value) || 0, 0),
                  })
                }
                className="rounded-xl border border-cloud px-4 py-2"
                placeholder="Alocados"
              />
              <Button variant="ghost" onClick={() => removeSetor(setor.id)}>
                Remover
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {resultados.map((resultado) => (
          <Card key={resultado.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg">{resultado.nome || 'Setor'}</h3>
                <p className="text-sm text-muted">
                  Demanda/h {resultado.demandaHora} • Capacidade/h por colab{' '}
                  {resultado.capacidadeHoraPorColaborador}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs ${
                  resultado.risco === 'alto'
                    ? 'border-danger/40 bg-danger/10 text-danger'
                    : resultado.risco === 'medio'
                      ? 'border-warning/40 bg-warning/10 text-ink'
                      : 'border-cloud bg-success-light text-primary'
                }`}
              >
                Risco {resultado.risco}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>Alocados: {resultado.alocados}</div>
              <div>Minimo: {resultado.capacidadeMinima}</div>
              <div>Folga: {resultado.folga}</div>
            </div>
            <p className="text-sm text-muted">Utilizacao: {resultado.utilizacao.toFixed(1)}%</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
