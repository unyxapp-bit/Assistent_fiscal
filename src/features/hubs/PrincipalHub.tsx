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
        <h1 className="font-display text-3xl text-primary">Acesso rápido</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="group block focus:outline-none">
            <Card
              variant="emerald"
              className="h-full cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-24px_rgba(5,150,105,0.35)] group-focus-visible:ring-2 group-focus-visible:ring-primary/40"
            >
              <h3 className="font-display text-xl text-white">{item.label}</h3>
              <p className="text-sm text-white/85 mt-2">
                Gestão completa de {item.label.toLowerCase()}.
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

