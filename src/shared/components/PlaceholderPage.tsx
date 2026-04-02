import React from 'react';
import { Card } from '../ui/Card';

export type PlaceholderPageProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PlaceholderPage({ title, subtitle, children }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Em construção</p>
        <h1 className="font-display text-3xl text-primary">{title}</h1>
        {subtitle ? <p className="text-muted mt-2 max-w-2xl">{subtitle}</p> : null}
      </div>
      <Card className="bg-surfaceStrong">
        <p className="text-sm text-muted">
          Esta área será reescrita com a lógica original do Flutter. O layout final terá
          KPIs, filtros e integrações Supabase do módulo.
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
      </Card>
    </div>
  );
}

