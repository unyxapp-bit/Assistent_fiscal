import React from 'react';
import { Card } from '../../shared/ui/Card';

export default function LojaHub() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Loja</p>
        <h1 className="font-display text-3xl text-primary">Panorama do turno</h1>
      </div>
      <Card variant="emerald">
        <h3 className="font-display text-xl text-white">Saúde operacional</h3>
        <p className="text-sm text-white/85 mt-2">
          Resumo de alertas críticos e indicadores de fluxo. Aqui entra a visão de
          gargalos, ocupação de caixas e produtividade.
        </p>
      </Card>
    </div>
  );
}

