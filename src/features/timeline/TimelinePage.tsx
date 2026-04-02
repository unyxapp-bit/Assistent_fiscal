import React, { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime, todayIsoDate } from '../../shared/lib/dates';
import { useAuth } from '../auth/AuthProvider';
import { useDashboardData } from '../dashboard/useDashboardData';
import { criarRelatorio } from '../relatorios/api';
import { useTimeline } from './useTimeline';

export default function TimelinePage() {
  const { data, isLoading } = useTimeline();
  const { user } = useAuth();
  const dashboard = useDashboardData();
  const [closing, setClosing] = useState(false);
  const eventos = data ?? [];

  const exportText = useMemo(() => {
    if (!eventos.length) return '';
    return eventos
      .map((evento) => {
        const when = formatDateTime(evento.timestamp);
        const detail = evento.detalhe ? ` â€¢ ${evento.detalhe}` : '';
        const colab = evento.colaborador_nome ? ` â€¢ ${evento.colaborador_nome}` : '';
        return `${when} â€” ${evento.tipo}${detail}${colab}`;
      })
      .join('\n');
  }, [eventos]);

  const handleExport = async () => {
    if (!exportText) return;
    await navigator.clipboard.writeText(exportText);
  };

  const handleEncerrarTurno = async () => {
    if (!user?.id) return;
    if (!window.confirm('Encerrar turno e gerar relatÃ³rio? Esta aÃ§Ã£o Ã© definitiva.')) return;
    setClosing(true);
    const inicio = eventos.length
      ? eventos[eventos.length - 1].timestamp
      : new Date().toISOString();
    const agora = new Date().toISOString();
    await criarRelatorio({
      fiscalId: user.id,
      data_str: todayIsoDate(),
      turno_iniciado_em: inicio,
      turno_encerrado_em: agora,
      total_alocacoes: dashboard.alocados,
      total_colaboradores: dashboard.colaboradoresAtivos,
      total_cafes: dashboard.pausasAtivas,
      total_intervalos: dashboard.pausasEmAtraso,
      total_empacotadores: 0,
      eventos_json: exportText || null,
    });
    setClosing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">RelatÃ³rios</p>
        <h1 className="font-display text-3xl text-primary">Timeline do Turno</h1>
        <p className="text-sm text-muted mt-2">
          HistÃ³rico cronolÃ³gico de eventos registrados durante o turno.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button size="sm" variant="outline" onClick={handleExport} disabled={!exportText}>
            Exportar para clipboard
          </Button>
          <Button size="sm" onClick={handleEncerrarTurno} disabled={closing}>
            Encerrar turno
          </Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted">Carregando eventos...</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-muted">Nenhum evento registrado.</p>
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
                    {evento.colaborador_nome ? (
                      <p className="text-xs text-muted">Colaborador: {evento.colaborador_nome}</p>
                    ) : null}
                    {evento.caixa_nome ? (
                      <p className="text-xs text-muted">Caixa: {evento.caixa_nome}</p>
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

