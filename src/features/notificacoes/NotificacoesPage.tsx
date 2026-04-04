import React, { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { cn } from '../../shared/lib/cn';
import { useAuth } from '../auth/AuthProvider';
import { useTimeline } from '../timeline/useTimeline';
import { useNotificacoesState } from './useNotificacoesState';

type FiltroId = 'todas' | 'nao_lidas';

export default function NotificacoesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useTimeline();
  const [filtro, setFiltro] = useState<FiltroId>('todas');

  const eventosRecentes = (data ?? []).slice(0, 50);
  const {
    readSet,
    eventosVisiveis,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotificacao,
    clearVisible,
  } = useNotificacoesState(user?.id ?? '', eventosRecentes);

  const eventosFiltrados = useMemo(() => {
    if (filtro === 'todas') return eventosVisiveis;
    return eventosVisiveis.filter((evento) => !readSet.has(evento.id));
  }, [eventosVisiveis, filtro, readSet]);

  const handleClear = () => {
    if (!eventosVisiveis.length) return;
    const confirmou = window.confirm(
      'Limpar a lista de notificacoes visiveis?'
    );
    if (!confirmou) return;
    clearVisible();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Operacional
        </p>
        <h1 className="font-display text-3xl text-primary">Notificacoes</h1>
        <p className="text-sm text-muted mt-2">
          Alertas recentes com controle de leitura, remocao e limpeza.
        </p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'rounded-full px-3 py-1 text-xs border',
              filtro === 'todas'
                ? 'bg-primary text-white border-primary'
                : 'border-cloud'
            )}
            onClick={() => setFiltro('todas')}
          >
            Todas
          </button>
          <button
            className={cn(
              'rounded-full px-3 py-1 text-xs border',
              filtro === 'nao_lidas'
                ? 'bg-primary text-white border-primary'
                : 'border-cloud'
            )}
            onClick={() => setFiltro('nao_lidas')}
          >
            Nao lidas ({unreadCount})
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={markAllAsRead}
            disabled={eventosVisiveis.length === 0 || unreadCount === 0}
          >
            Marcar todas como lidas
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            disabled={eventosVisiveis.length === 0}
          >
            Limpar lista
          </Button>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <p className="text-sm text-muted">Carregando notificacoes...</p>
        ) : eventosFiltrados.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma notificacao disponivel.</p>
        ) : (
          <div className="space-y-3">
            {eventosFiltrados.map((evento) => {
              const lida = readSet.has(evento.id);
              return (
                <div
                  key={evento.id}
                  className={cn(
                    'rounded-xl border p-4',
                    lida
                      ? 'border-cloud bg-white'
                      : 'border-primary/25 bg-primary/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{evento.tipo}</p>
                        {!lida ? (
                          <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-primary">
                            Nova
                          </span>
                        ) : null}
                      </div>
                      {evento.detalhe ? (
                        <p className="text-sm text-muted mt-1">{evento.detalhe}</p>
                      ) : null}
                      <div className="text-xs text-muted mt-2">
                        {evento.colaborador_nome ? (
                          <p>Colaborador: {evento.colaborador_nome}</p>
                        ) : null}
                        {evento.caixa_nome ? <p>Caixa: {evento.caixa_nome}</p> : null}
                      </div>
                    </div>
                    <span className="text-xs text-muted">
                      {formatDateTime(evento.timestamp)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {lida ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsUnread(evento.id)}
                      >
                        Marcar como nao lida
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(evento.id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotificacao(evento.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
