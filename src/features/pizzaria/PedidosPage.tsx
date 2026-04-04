import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { usePizzaria } from './usePizzaria';
import {
  buildPedidoItensPreview,
  getPedidoItensQuantidade,
  parsePedidoObservacoes,
} from './pedidoItens';

const statusOptions = ['todos', 'aberto', 'pronto', 'entregue', 'cancelado'];

export default function PedidosPage() {
  const { pedidos, isLoading, atualizarPedido, deletarPedido, updating } =
    usePizzaria();
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  const pedidosComposicao = useMemo(
    () =>
      pedidos.map((pedido) => {
        const parsed = parsePedidoObservacoes(pedido.observacoes);
        return {
          pedido,
          items: parsed.items,
          observacoesLivre: parsed.observacoesLivre,
        };
      }),
    [pedidos]
  );

  const filtered = useMemo(() => {
    return pedidosComposicao.filter(({ pedido, items, observacoesLivre }) => {
      if (statusFiltro !== 'todos' && pedido.status !== statusFiltro) return false;
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const itensTexto = items
          .map((item) => `${item.nome} ${item.tamanho ?? ''}`.trim())
          .join(' ');
        const stack = `${pedido.nome_cliente ?? ''} ${
          pedido.codigo_entrega ?? ''
        } ${itensTexto} ${observacoesLivre}`.toLowerCase();
        if (!stack.includes(term)) return false;
      }
      return true;
    });
  }, [busca, pedidosComposicao, statusFiltro]);

  const handleStatus = (id: string, status: string) => {
    atualizarPedido({ id, patch: { status } });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este pedido?')) return;
    await deletarPedido(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pizzaria</p>
          <h1 className="font-display text-3xl text-primary">Pedidos</h1>
          <p className="text-sm text-muted mt-2">
            Controle de pedidos com composicao de itens e fluxo de status.
          </p>
        </div>
        <Link to="/pizzaria/novo">
          <Button>Novo pedido</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={statusFiltro}
          onChange={(event) => setStatusFiltro(event.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'todos' ? 'Todos os status' : status}
            </option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por cliente, codigo ou item"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando pedidos...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhum pedido encontrado.</Card>
        ) : (
          filtered.map(({ pedido, items, observacoesLivre }) => {
            const itensPreview = buildPedidoItensPreview(items, 4);
            const totalItens = getPedidoItensQuantidade(items);

            return (
              <Card key={pedido.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg">
                      {pedido.nome_cliente || 'Cliente'} | {pedido.status}
                    </h3>
                    <p className="text-sm text-muted">
                      {pedido.endereco ?? 'Endereco nao informado'}
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

                {items.length > 0 ? (
                  <div className="rounded-lg border border-cloud px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Itens ({totalItens})
                    </p>
                    <div className="mt-1 space-y-1">
                      {itensPreview.map((linha, index) => (
                        <p
                          key={`${pedido.id}-item-${index}`}
                          className="text-sm text-ink"
                        >
                          {linha}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {observacoesLivre ? (
                  <p className="text-xs text-muted">Obs: {observacoesLivre}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Link to={`/pizzaria/cupom/${pedido.id}`}>
                    <Button size="sm" variant="outline">
                      Ver cupom
                    </Button>
                  </Link>
                  {pedido.status === 'aberto' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(pedido.id, 'pronto')}
                      disabled={updating}
                    >
                      Marcar pronto
                    </Button>
                  ) : null}
                  {pedido.status === 'pronto' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(pedido.id, 'entregue')}
                      disabled={updating}
                    >
                      Marcar entregue
                    </Button>
                  ) : null}
                  {pedido.status !== 'cancelado' && pedido.status !== 'entregue' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatus(pedido.id, 'cancelado')}
                      disabled={updating}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(pedido.id)}
                    disabled={updating}
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
