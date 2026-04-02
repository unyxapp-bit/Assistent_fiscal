import React from 'react';
import { Card } from '../../shared/ui/Card';
import { formatDateTime } from '../../shared/lib/dates';
import { useTimeline } from '../timeline/useTimeline';

export default function NotificacoesPage() {
  const { data, isLoading } = useTimeline();
  const eventos = (data ?? []).slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
        <h1 className="font-display text-3xl text-primary">NotificaÃ§Ãµes</h1>
        <p className="text-sm text-muted mt-2">
          Alertas recentes do sistema e eventos crÃ­ticos do turno.
        </p>
      </div>

      <Card>
        {isLoading ? (
          <p className="text-sm text-muted">Carregando notificaÃ§Ãµes...</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma notificaÃ§Ã£o disponÃ­vel.</p>
        ) : (
          <div className="space-y-3">
            {eventos.map((evento) => (
              <div key={evento.id} className="rounded-xl border border-cloud p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{evento.tipo}</p>
                    {evento.detalhe ? (
                      <p className="text-sm text-muted">{evento.detalhe}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted">
                    {formatDateTime(evento.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

