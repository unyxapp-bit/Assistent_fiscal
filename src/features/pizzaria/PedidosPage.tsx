import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { usePizzaria } from './usePizzaria';
import {
  type PedidoItem,
  buildPedidoItensPreview,
  formatPedidoItem,
  getPedidoItensQuantidade,
  parsePedidoObservacoes,
  serializePedidoObservacoes,
} from './pedidoItens';

const statusOptions = ['todos', 'aberto', 'pronto', 'entregue', 'cancelado'];

function normalizeHorarioInput(value?: string | null) {
  if (!value) return '';
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export default function PedidosPage() {
  const { pedidos, pizzas, isLoading, atualizarPedido, deletarPedido, updating } =
    usePizzaria();
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editCliente, setEditCliente] = useState('');
  const [editCodigo, setEditCodigo] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editReferencia, setEditReferencia] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editObsLivre, setEditObsLivre] = useState('');
  const [editItems, setEditItems] = useState<PedidoItem[]>([]);
  const [editPizzaId, setEditPizzaId] = useState('');
  const [editQuantidade, setEditQuantidade] = useState('1');
  const [editItemObs, setEditItemObs] = useState('');

  const pizzasAtivas = useMemo(
    () => pizzas.filter((pizza) => pizza.ativa),
    [pizzas]
  );

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

  const startEdit = (entry: (typeof filtered)[number]) => {
    setErro(null);
    setEditId(entry.pedido.id);
    setEditCliente(entry.pedido.nome_cliente ?? '');
    setEditCodigo(entry.pedido.codigo_entrega ?? '');
    setEditTelefone(entry.pedido.telefone ?? '');
    setEditEndereco(entry.pedido.endereco ?? '');
    setEditBairro(entry.pedido.bairro ?? '');
    setEditReferencia(entry.pedido.referencia ?? '');
    setEditHorario(normalizeHorarioInput(entry.pedido.horario_pedido));
    setEditObsLivre(entry.observacoesLivre ?? '');
    setEditItems(entry.items);
    setEditPizzaId('');
    setEditQuantidade('1');
    setEditItemObs('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditItems([]);
    setEditObsLivre('');
    setErro(null);
  };

  const handleStatus = (id: string, status: string) => {
    atualizarPedido({ id, patch: { status } });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este pedido?')) return;
    await deletarPedido(id);
  };

  const handleAddEditItem = () => {
    setErro(null);
    if (!editPizzaId) {
      setErro('Selecione uma pizza para adicionar ao pedido.');
      return;
    }

    const pizza = pizzasAtivas.find((item) => item.id === editPizzaId);
    if (!pizza) {
      setErro('Pizza selecionada nao encontrada.');
      return;
    }

    const quantidade = Math.max(1, Number(editQuantidade) || 1);
    setEditItems((prev) => [
      ...prev,
      {
        pizza_id: pizza.id,
        nome: pizza.nome,
        tamanho: pizza.tamanho,
        quantidade,
        observacoes: editItemObs.trim() || null,
      },
    ]);
    setEditPizzaId('');
    setEditQuantidade('1');
    setEditItemObs('');
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (
    pedidoId: string,
    statusAtual: string
  ) => {
    setErro(null);
    if (!editHorario) {
      setErro('Informe o horario do pedido para salvar.');
      return;
    }

    const observacoes = serializePedidoObservacoes({
      items: editItems,
      observacoesLivre: editObsLivre.trim() || null,
    });

    await atualizarPedido({
      id: pedidoId,
      patch: {
        nome_cliente: editCliente.trim() || null,
        codigo_entrega: editCodigo.trim() || null,
        telefone: editTelefone.trim() || null,
        endereco: editEndereco.trim() || null,
        bairro: editBairro.trim() || null,
        referencia: editReferencia.trim() || null,
        horario_pedido: editHorario,
        observacoes,
        status: statusAtual,
      },
    });

    cancelEdit();
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

      {erro ? <Card className="text-sm text-danger">{erro}</Card> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando pedidos...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhum pedido encontrado.</Card>
        ) : (
          filtered.map((entry) => {
            const { pedido, items, observacoesLivre } = entry;
            const isEditing = editId === pedido.id;
            const itensPreview = buildPedidoItensPreview(items, 4);
            const totalItens = getPedidoItensQuantidade(items);
            const totalEditItens = getPedidoItensQuantidade(editItems);

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

                {isEditing ? (
                  <div className="space-y-3 rounded-lg border border-cloud p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Editar pedido
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={editCliente}
                        onChange={(event) => setEditCliente(event.target.value)}
                        placeholder="Cliente"
                        className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      />
                      <input
                        value={editCodigo}
                        onChange={(event) => setEditCodigo(event.target.value)}
                        placeholder="Codigo"
                        className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      />
                      <input
                        value={editTelefone}
                        onChange={(event) => setEditTelefone(event.target.value)}
                        placeholder="Telefone"
                        className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      />
                      <input
                        type="time"
                        value={editHorario}
                        onChange={(event) => setEditHorario(event.target.value)}
                        className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      />
                      <input
                        value={editEndereco}
                        onChange={(event) => setEditEndereco(event.target.value)}
                        placeholder="Endereco"
                        className="rounded-xl border border-cloud px-3 py-2 text-sm md:col-span-2"
                      />
                      <input
                        value={editBairro}
                        onChange={(event) => setEditBairro(event.target.value)}
                        placeholder="Bairro"
                        className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      />
                      <input
                        value={editReferencia}
                        onChange={(event) => setEditReferencia(event.target.value)}
                        placeholder="Referencia"
                        className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        Itens ({totalEditItens})
                      </p>
                      {editItems.length === 0 ? (
                        <p className="text-sm text-muted">Sem itens no pedido.</p>
                      ) : (
                        editItems.map((item, index) => (
                          <div
                            key={`${pedido.id}-edit-item-${index}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-cloud px-3 py-2 text-sm"
                          >
                            <span>{formatPedidoItem(item)}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveEditItem(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <select
                          value={editPizzaId}
                          onChange={(event) => setEditPizzaId(event.target.value)}
                          className="rounded-xl border border-cloud px-3 py-2 text-sm md:col-span-2"
                        >
                          <option value="">Selecionar pizza</option>
                          {pizzasAtivas.map((pizza) => (
                            <option key={pizza.id} value={pizza.id}>
                              {pizza.nome} ({pizza.tamanho})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={editQuantidade}
                          onChange={(event) => setEditQuantidade(event.target.value)}
                          placeholder="Qtd"
                          className="rounded-xl border border-cloud px-3 py-2 text-sm"
                        />
                        <input
                          value={editItemObs}
                          onChange={(event) => setEditItemObs(event.target.value)}
                          placeholder="Obs do item"
                          className="rounded-xl border border-cloud px-3 py-2 text-sm"
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={handleAddEditItem}>
                        Adicionar item
                      </Button>
                    </div>

                    <textarea
                      value={editObsLivre}
                      onChange={(event) => setEditObsLivre(event.target.value)}
                      placeholder="Observacoes gerais"
                      className="rounded-xl border border-cloud px-3 py-2 text-sm"
                      rows={2}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating}
                        onClick={() => void handleSaveEdit(pedido.id, pedido.status)}
                      >
                        Salvar edicao
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link to={`/pizzaria/cupom/${pedido.id}`}>
                    <Button size="sm" variant="outline">
                      Ver cupom
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating}
                    onClick={() => startEdit(entry)}
                  >
                    Editar
                  </Button>
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
                    onClick={() => void handleDelete(pedido.id)}
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
