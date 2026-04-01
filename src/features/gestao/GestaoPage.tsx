import React, { useMemo, useState } from 'react';
import AlocacaoPage from '../alocacoes/AlocacaoPage';
import MapaCaixasPage from '../mapa/MapaCaixasPage';
import CafePage from '../cafe/CafePage';
import { useDashboardData } from '../dashboard/useDashboardData';
import { Card } from '../../shared/ui/Card';
import { cn } from '../../shared/lib/cn';

const tabs = [
  { id: 'alocacao', label: 'Alocação' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'cafe', label: 'Café' },
  { id: 'visao', label: 'Visão' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function VisaoGargaloPanel() {
  const data = useDashboardData();
  const now = new Date();

  const slots = Array.from({ length: 8 }).map((_, index) => {
    const d = new Date(now);
    d.setMinutes(now.getMinutes() + index * 30);
    return d;
  });

  return (
    <Card>
      <h3 className="font-display text-xl mb-4">Projeção de gargalos (4h)</h3>
      <div className="space-y-2">
        {slots.map((slot) => {
          const hora = slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const disponiveis = Math.max(data.colaboradoresAtivos - data.pausasAtivas, 0);
          const risco = disponiveis < Math.max(data.alocados * 0.6, 1);
          return (
            <div
              key={hora}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-2 text-sm',
                risco ? 'border-danger/40 bg-danger/5 text-danger' : 'border-cloud'
              )}
            >
              <span>{hora}</span>
              <span>
                {risco ? 'Risco de gargalo' : 'Cobertura estável'} · Disponíveis {disponiveis}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function GestaoPage() {
  const [active, setActive] = useState<TabId>('alocacao');
  const data = useDashboardData();

  const badges = useMemo<Record<TabId, number>>(
    () => ({
      alocacao: 0,
      mapa: 0,
      cafe: data.pausasEmAtraso,
      visao: data.pausasEmAtraso > 0 ? 1 : 0,
    }),
    [data.pausasEmAtraso]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestão Operacional</p>
        <h1 className="font-display text-3xl text-ink">Painel de Gestão</h1>
        <p className="text-sm text-muted mt-2">
          Alterna entre alocação, mapa e pausas mantendo os dados vivos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm border',
              active === tab.id ? 'bg-primary text-white border-primary' : 'border-cloud text-ink'
            )}
          >
            {tab.label}
            {badges[tab.id] ? (
              <span className="ml-2 rounded-full bg-danger text-white px-2 py-0.5 text-xs">
                {badges[tab.id]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className={active === 'alocacao' ? 'block' : 'hidden'}>
        <AlocacaoPage />
      </div>
      <div className={active === 'mapa' ? 'block' : 'hidden'}>
        <MapaCaixasPage />
      </div>
      <div className={active === 'cafe' ? 'block' : 'hidden'}>
        <CafePage />
      </div>
      <div className={active === 'visao' ? 'block' : 'hidden'}>
        <VisaoGargaloPanel />
      </div>
    </div>
  );
}
