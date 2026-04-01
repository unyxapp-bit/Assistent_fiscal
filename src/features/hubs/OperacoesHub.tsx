import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';

const ops = [
  { label: 'Entregas', to: '/entregas' },
  { label: 'Ocorrências', to: '/ocorrencias' },
  { label: 'Checklist', to: '/checklists' },
  { label: 'Passagem de Turno', to: '/passagem-turno' },
  { label: 'Guia Rápido', to: '/guia-rapido' },
  { label: 'Anotações', to: '/notas' },
  { label: 'Formulários', to: '/formularios' },
  { label: 'Procedimentos', to: '/procedimentos' },
  { label: 'Notificações', to: '/notificacoes' },
];

export default function OperacoesHub() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Operações</p>
        <h1 className="font-display text-3xl text-ink">Controle operacional</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ops.map((item) => (
          <Card key={item.to}>
            <h3 className="font-display text-xl">{item.label}</h3>
            <p className="text-sm text-muted mt-2">
              Acompanhe registros, alertas e rotinas em tempo real.
            </p>
            <Link
              to={item.to}
              className="inline-flex mt-4 text-sm font-semibold text-primary"
            >
              Abrir módulo →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
