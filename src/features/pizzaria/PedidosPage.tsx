import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { usePizzaria } from './usePizzaria';

const statusOptions = ['todos', 'aberto', 'pronto', 'entregue', 'cancelado'];

export default function PedidosPage() {
  const { pedidos, isLoading, atualizarPedido } = usePizzaria();
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  const filtered = useMemo(() => {
    return pedidos.filter((pedido) => {
      if (statusFiltro !== 'todos' && pedido.status !== statusFiltro) return false;
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const stack = `${pedido.nome_cliente ?? ''} ${pedido.codigo_entrega ?? ''}`.toLowerCase();
        if (!stack.includes(term)) return false;
      }
      return true;
    });
  }, [pedidos, statusFiltro, busca]);

  const handleStatus = (id: string, status: string) => {
    atualizarPedido({ id, patch: { status } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pizzaria</p>
          <h1 className="font-display text-3xl text-primary">Pedidos</h1>
          <p className="text-sm text-muted mt-2">Controle de pedidos do balcão e delivery.</p>
        </div>
        <Link to="/pizzaria/novo">
          <Button>Novo pedido</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === 'todos' ? 'Todos os status' : s}
            </option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cliente ou código"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando pedidos...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhum pedido encontrado.</Card>
        ) : (
          filtered.map((pedido) => (
            <Card key={pedido.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">
                    {pedido.nome_cliente || 'Cliente'} · {pedido.status}
                  </h3>
                  <p className="text-sm text-muted">
                    {pedido.endereco ?? 'Endereço não informado'}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(`${pedido.data_pedido}T${pedido.horario_pedido}`)}
                  </p>
                </div>
                {pedido.codigo_entrega ? (
                  <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                    {pedido.codigo_entrega}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {pedido.status === 'aberto' ? (
                  <Button size="sm" variant="outline" onClick={() => handleStatus(pedido.id, 'pronto')}>
                    Marcar pronto
                  </Button>
                ) : null}
                {pedido.status === 'pronto' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatus(pedido.id, 'entregue')}
                  >
                    Marcar entregue
                  </Button>
                ) : null}
                {pedido.status !== 'cancelado' && pedido.status !== 'entregue' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatus(pedido.id, 'cancelado')}
                  >
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


