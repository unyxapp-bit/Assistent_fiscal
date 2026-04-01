import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';

const items = [
  { label: 'Caixas', to: '/caixas' },
  { label: 'Colaboradores', to: '/colaboradores' },
  { label: 'Relatórios', to: '/relatorios' },
  { label: 'Escala', to: '/escala' },
];

export default function PrincipalHub() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Principal</p>
        <h1 className="font-display text-3xl text-ink">Acesso rápido</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card key={item.to}>
            <h3 className="font-display text-xl">{item.label}</h3>
            <p className="text-sm text-muted mt-2">
              Abra o módulo {item.label.toLowerCase()} para gestão completa.
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
