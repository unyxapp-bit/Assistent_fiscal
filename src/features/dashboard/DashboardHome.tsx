import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useDashboardData } from './useDashboardData';

const quickLinks = [
  { label: 'Caixas', to: '/caixas' },
  { label: 'Colaboradores', to: '/colaboradores' },
  { label: 'Escala', to: '/escala' },
  { label: 'Relatórios', to: '/relatorios' },
];

export default function DashboardHome() {
  const data = useDashboardData();
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

  return (
    <div className="space-y-8">
      <section className="surface p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Início do turno</p>
            <h1 className="font-display text-3xl text-ink">Painel do Fiscal</h1>
            <p className="text-sm text-muted mt-2 max-w-2xl">
              Dados sincronizados com Supabase em tempo real. Atualize o turno e
              monitore as operações do dia.
            </p>
          </div>
          <Button className="self-start">Começar turno</Button>
        </div>
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            hasAlerts ? 'border-danger/40 bg-danger/5 text-danger' : 'border-cloud bg-white'
          }`}
        >
          {hasAlerts
            ? 'Atenção: há alertas pendentes no turno. Revise os módulos críticos.'
            : 'Turno estável: nenhum alerta crítico no momento.'}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-muted">Colaboradores ativos</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : data.colaboradoresAtivos}
          </h2>
          <p className="text-xs text-muted mt-2">Tabela `colaboradores`.</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Caixas disponíveis</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : data.caixasAtivos}
          </h2>
          <p className="text-xs text-muted mt-2">Tabela `caixas`.</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Alocados agora</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : data.alocados}
          </h2>
          <p className="text-xs text-muted mt-2">Tabela `alocacoes`.</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Em pausa / em rota</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : `${data.pausasAtivas} / ${data.entregasEmRota}`}
          </h2>
          <p className="text-xs text-muted mt-2">`pausas_cafe` e `entregas`.</p>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display text-xl">Atalhos principais</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full border border-cloud px-4 py-2 text-sm hover:border-primary hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-sm text-muted">
            Livres agora: {data.isLoading ? '...' : data.livres} caixas
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-xl">Alertas do turno</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted mt-2">Nenhum alerta crítico no momento.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {alerts.map((alert) => (
                <li key={alert.label}>
                  <Link
                    to={alert.to}
                    className="inline-flex rounded-full border border-cloud px-4 py-2 text-sm hover:border-primary hover:text-primary"
                  >
                    {alert.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-muted">Checklists pendentes</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : data.checklistsPendentes}
          </h2>
          <p className="text-xs text-muted mt-2">Monitorar abertura/fechamento.</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Ocorrências abertas</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : data.ocorrenciasAbertas}
          </h2>
          <p className="text-xs text-muted mt-2">Exige follow-up rápido.</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Entregas pendentes</p>
          <h2 className="text-2xl font-semibold">
            {data.isLoading ? '...' : data.entregasSeparadas}
          </h2>
          <p className="text-xs text-muted mt-2">Aguardando saída.</p>
        </Card>
      </section>
    </div>
  );
}
