import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';

export default function PizzariaHub() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Turno</p>
        <h1 className="font-display text-3xl text-primary">Pizzaria</h1>
        <p className="text-sm text-muted mt-2">
          Catálogo de pizzas e fluxo de pedidos do balcão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg">Pedidos</h2>
          <p className="text-sm text-muted">Acompanhe status, horários e clientes.</p>
          <Link to="/pizzaria/pedidos">
            <Button>Ver pedidos</Button>
          </Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg">Cardápio</h2>
          <p className="text-sm text-muted">Gerencie pizzas, tamanhos e disponibilidade.</p>
          <Link to="/pizzaria/pizzas">
            <Button>Gerenciar cardápio</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}


