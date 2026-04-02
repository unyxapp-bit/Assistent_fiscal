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
        <h1 className="font-display text-3xl text-primary">Controle operacional</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ops.map((item) => (
          <Link key={item.to} to={item.to} className="group block focus:outline-none">
            <Card
              variant="emerald"
              className="h-full cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-24px_rgba(5,150,105,0.35)] group-focus-visible:ring-2 group-focus-visible:ring-primary/40"
            >
              <h3 className="font-display text-xl text-white">{item.label}</h3>
              <p className="text-sm text-white/85 mt-2">
                Acompanhe registros, alertas e rotinas em tempo real.
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

