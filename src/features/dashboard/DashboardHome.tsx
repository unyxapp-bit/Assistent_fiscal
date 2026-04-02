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
  { label: 'RelatÃ³rios', to: '/relatorios' },
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
          label: `${data.ocorrenciasAbertas} ocorrÃªncia(s) abertas`,
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Caixas disponÃ­veis</p>
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
            <p className="mt-1 text-xs text-muted">Tabela `alocaÃ§Ãµes`.</p>
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
            <div className="flex items-center justify-between">
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
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-accent hover:border-primary hover:text-primary"
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Alertas do turno</h3>
              <span className="text-xs text-muted">
                {alerts.length === 0 ? 'Nenhum alerta' : `${alerts.length} alerta(s)`}
              </span>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-3 text-xs text-muted">Nenhum alerta crÃ­tico no momento.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {alerts.map((alert) => (
                  <Link
                    key={alert.label}
                    to={alert.to}
                    className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-accent hover:border-primary hover:text-primary"
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">OcorrÃªncias abertas</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              {data.isLoading ? '...' : data.ocorrenciasAbertas}
            </p>
            <p className="mt-1 text-xs text-muted">Exige follow-up rÃ¡pido.</p>
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
            <p className="mt-1 text-xs text-muted">Aguardando saÃ­da.</p>
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
      <section className="surface p-5 border border-border/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-primary">Painel do Fiscal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-border bg-surface px-4 py-2 text-sm shadow-[0_12px_24px_-20px_rgba(5,150,105,0.2)]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">HorÃ¡rio</p>
              <p className="mt-1 text-xl font-semibold text-accent">
                {now.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <Button className="self-start">
              ComeÃ§ar turno
            </Button>
          </div>
        </div>
        <div
          className={`mt-4 rounded-2xl border px-4 py-2.5 text-sm ${
            hasAlerts
              ? 'border-danger bg-danger/30 text-danger'
              : 'border-border bg-surface text-muted'
          }`}
        >
          {hasAlerts
            ? 'AtenÃ§Ã£o: hÃ¡ alertas pendentes no turno. Revise os mÃ³dulos crÃ­ticos.'
            : 'Turno estÃ¡vel: nenhum alerta crÃ­tico no momento.'}
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
                  'relative p-3 md:p-4 bg-surface border border-border shadow-[0_18px_36px_-24px_rgba(5,150,105,0.15)] transition hover:-translate-y-0.5 hover:border-borderDark hover:shadow-[0_22px_48px_-26px_rgba(5,150,105,0.25)]',
                  draggingId === id && 'ring-2 ring-primary/30'
                )}
              >
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-muted hover:text-primary cursor-grab active:cursor-grabbing"
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

