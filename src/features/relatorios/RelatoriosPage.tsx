import React, { useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { deletarRelatorio } from './api';
import { useRelatorios } from './useRelatorios';

export default function RelatoriosPage() {
  const { data, isLoading } = useRelatorios();
  const [expanded, setExpanded] = useState<string | null>(null);
  const relatorios = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Relatórios</p>
        <h1 className="font-display text-3xl text-ink">Relatórios do Dia</h1>
        <p className="text-sm text-muted mt-2">
          Resumos consolidados do turno com indicadores principais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando relatórios...</Card>
        ) : relatorios.length === 0 ? (
          <Card>Nenhum relatório encontrado.</Card>
        ) : (
          relatorios.map((rel) => (
            <Card key={rel.id} className="flex flex-col gap-3">
              <div>
                <h3 className="font-display text-lg">{rel.data_str}</h3>
                <p className="text-xs text-muted">
                  Turno: {formatDateTime(rel.turno_iniciado_em)} →{' '}
                  {formatDateTime(rel.turno_encerrado_em)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Alocações: {rel.total_alocacoes}</div>
                <div>Colaboradores: {rel.total_colaboradores}</div>
                <div>Cafés: {rel.total_cafes}</div>
                <div>Intervalos: {rel.total_intervalos}</div>
                <div>Empacotadores: {rel.total_empacotadores}</div>
              </div>
              {expanded === rel.id && rel.eventos_json ? (
                <pre className="whitespace-pre-wrap text-xs text-muted bg-chalk/40 p-3 rounded-xl">
                  {rel.eventos_json}
                </pre>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      rel.eventos_json || JSON.stringify(rel, null, 2)
                    )
                  }
                >
                  Compartilhar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded(expanded === rel.id ? null : rel.id)}
                >
                  {expanded === rel.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deletarRelatorio(rel.id)}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
