import React, { useEffect, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';

export default function FolgaPage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Folga</p>
        <h1 className="font-display text-3xl text-ink">Modo Folga</h1>
        <p className="text-sm text-muted mt-2">
          Tela de descanso com relógio e atalhos rápidos.
        </p>
      </div>

      <Card className="text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Agora</p>
        <h2 className="font-display text-4xl">
          {now.toLocaleTimeString('pt-BR')}
        </h2>
        <p className="text-sm text-muted">
          Próximo turno: verificar escala (integração em andamento)
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display text-lg">Atalhos rápidos</h3>
          <p className="text-sm text-muted mt-2">
            Voltar para o painel de gestão ou revisar alertas do turno.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline">Ver alertas</Button>
            <Button>Voltar ao painel</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
