import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { cn } from '../../shared/lib/cn';
import { useAuth } from '../auth/AuthProvider';
import { fetchDashboardLayout, saveDashboardLayout } from './api';
import { useDashboardData } from './useDashboardData';

const quickLinks = [
  { label: 'Caixas', to: '/caixas' },
  { label: 'Colaboradores', to: '/colaboradores' },
  { label: 'Escala', to: '/escala' },
  { label: 'Relatórios', to: '/relatorios' },
];

const DASHBOARD_LAYOUT_KEY = 'dashboard_home_v1';
const DEFAULT_CARD_ORDER = [
  'colaboradores',
  'caixas',
  'alocados',
  'rotas',
  'atalhos',
  'alertas',
  'checklists',
  'ocorrencias',
  'entregas',
];

function normalizeOrder(order: string[], availableIds: string[]) {
  const available = new Set(availableIds);
  const next = order.filter((id) => available.has(id));
  availableIds.forEach((id) => {
    if (!next.includes(id)) next.push(id);
  });
  return next;
}

function reorderIds(order: string[], draggedId: string, targetId: string) {
  if (draggedId === targetId) return order;
  const next = order.filter((id) => id !== draggedId);
  const targetIndex = next.indexOf(targetId);
  if (targetIndex === -1) return order;
  next.splice(targetIndex, 0, draggedId);
  return next;
}

export default function DashboardHome() {
  const data = useDashboardData();
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_CARD_ORDER);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    fetchDashboardLayout(user.id, DASHBOARD_LAYOUT_KEY)
      .then((layout) => {
        if (!mounted || !layout || !Array.isArray(layout)) return;
        setCardOrder(normalizeOrder(layout, DEFAULT_CARD_ORDER));
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const hasAlerts =
    data.pausasEmAtraso +
      data.lembretesVencidos +
      data.ocorrenciasAbertas +
      data.entregasSeparadas +
      data.checklistsPendentes >
    0;

  const alerts = [
    data.pausasEmAtraso > 0
      ? {
          label: `${data.pausasEmAtraso} pausa(s) em atraso`,
          to: '/cafe',
        }
      : null,
    data.lembretesVencidos > 0
      ? {
          label: `${data.lembretesVencidos} lembrete(s) vencidos`,
          to: '/notas',
        }
      : null,
    data.ocorrenciasAbertas > 0
      ? {
          label: `${data.ocorrenciasAbertas} ocorrência(s) abertas`,
          to: '/ocorrencias',
        }
      : null,
    data.entregasSeparadas > 0
      ? {
          label: `${data.entregasSeparadas} entrega(s) aguardando envio`,
          to: '/entregas',
        }
      : null,
    data.checklistsPendentes > 0
      ? {
          label: `${data.checklistsPendentes} checklist(s) pendentes`,
          to: '/checklists',
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; to: string }>;

  const cardDefinitions = useMemo(
    () => [
      {
        id: 'colaboradores',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Colaboradores ativos</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.colaboradoresAtivos}
            </p>
            <p className="mt-1 text-xs text-muted">Tabela `colaboradores`.</p>
          </>
        ),
      },
      {
        id: 'caixas',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Caixas disponíveis</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.caixasAtivos}
            </p>
            <p className="mt-1 text-xs text-muted">Tabela `caixas`.</p>
          </>
        ),
      },
      {
        id: 'alocados',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Alocados agora</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.alocados}
            </p>
            <p className="mt-1 text-xs text-muted">Tabela `alocações`.</p>
          </>
        ),
      },
      {
        id: 'rotas',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Em pausa / em rota</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : `${data.pausasAtivas} / ${data.entregasEmRota}`}
            </p>
            <p className="mt-1 text-xs text-muted">`pausas_cafe` e `entregas`.</p>
          </>
        ),
      },
      {
        id: 'atalhos',
        span: 'md:col-span-2 xl:col-span-2',
        content: (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-12">
              <h3 className="text-sm font-semibold text-ink">Atalhos principais</h3>
              <span className="text-xs text-muted">
                Livres agora: {data.isLoading ? '...' : data.livres} caixas
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="chip-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        ),
      },
      {
        id: 'alertas',
        span: 'md:col-span-2 xl:col-span-2',
        content: (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-12">
              <h3 className="text-sm font-semibold text-ink">Alertas do turno</h3>
              <span className="text-xs text-muted">
                {alerts.length === 0 ? 'Nenhum alerta' : `${alerts.length} alerta(s)`}
              </span>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-3 text-xs text-muted">Nenhum alerta crítico no momento.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {alerts.map((alert) => (
                  <Link
                    key={alert.label}
                    to={alert.to}
                    className="chip-link"
                  >
                    {alert.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        ),
      },
      {
        id: 'checklists',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Checklists pendentes</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.checklistsPendentes}
            </p>
            <p className="mt-1 text-xs text-muted">Monitorar abertura/fechamento.</p>
          </>
        ),
      },
      {
        id: 'ocorrencias',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Ocorrências abertas</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.ocorrenciasAbertas}
            </p>
            <p className="mt-1 text-xs text-muted">Exige follow-up rápido.</p>
          </>
        ),
      },
      {
        id: 'entregas',
        span: '',
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Entregas pendentes</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.entregasSeparadas}
            </p>
            <p className="mt-1 text-xs text-muted">Aguardando saída.</p>
          </>
        ),
      },
    ],
    [alerts, data]
  );

  const cardsById = useMemo(() => {
    const map: Record<string, (typeof cardDefinitions)[number]> = {};
    cardDefinitions.forEach((card) => {
      map[card.id] = card;
    });
    return map;
  }, [cardDefinitions]);

  const orderedIds = normalizeOrder(cardOrder, cardDefinitions.map((card) => card.id));

  const handleDrop = (targetId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain') || draggingId;
    if (!draggedId || draggedId === targetId) return;
    setCardOrder((prev) => {
      const next = reorderIds(prev, draggedId, targetId);
      if (user?.id) {
        void saveDashboardLayout(user.id, DASHBOARD_LAYOUT_KEY, next);
      }
      return next;
    });
    setDraggingId(null);
  };

  return (
    <div className="space-y-8">
      <section className="hero-surface">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
          <div className="lg:justify-self-start">
            <h1 className="font-display text-3xl text-primary">Painel do Fiscal</h1>
          </div>
          <div className="lg:justify-self-center">
            <div className="clock-card min-w-[150px] text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Horário</p>
              <p className="mt-1 text-xl font-semibold text-accent">
                {now.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="lg:justify-self-end">
            <Button className="w-full lg:w-auto">
              Começar turno
            </Button>
          </div>
        </div>
        <div
          className={`mt-4 px-4 py-3 text-sm ${
            hasAlerts ? 'alert-soft' : 'status-soft'
          }`}
        >
          {hasAlerts
            ? 'Atenção: há alertas pendentes no turno. Revise os módulos críticos.'
            : 'Turno estável: nenhum alerta crítico no momento.'}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {orderedIds.map((id) => {
          const card = cardsById[id];
          if (!card) return null;
          return (
            <div
              key={id}
              className={cn('transition-transform', card.span)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={handleDrop(id)}
            >
              <Card
                className={cn(
                  'dashboard-card',
                  draggingId === id && 'ring-2 ring-primary/30'
                )}
              >
                <button
                  type="button"
                  className="drag-handle"
                  draggable
                  onDragStart={(event) => {
                    setDraggingId(id);
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  aria-label="Arrastar card"
                  title="Arrastar card"
                >
                  ||
                </button>
                {card.content}
              </Card>
            </div>
          );
        })}
      </section>
    </div>
  );
}

