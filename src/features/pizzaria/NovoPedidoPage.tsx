import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { usePizzaria } from './usePizzaria';
import {
  type PedidoItem,
  formatPedidoItem,
  getPedidoItensQuantidade,
  serializePedidoObservacoes,
} from './pedidoItens';

export default function NovoPedidoPage() {
  const { pizzas, criarPedido, creating } = usePizzaria();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState('');
  const [codigoEntrega, setCodigoEntrega] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [referencia, setReferencia] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const [pizzaSelecionadaId, setPizzaSelecionadaId] = useState('');
  const [quantidadeItem, setQuantidadeItem] = useState('1');
  const [obsItem, setObsItem] = useState('');
  const [items, setItems] = useState<PedidoItem[]>([]);

  const pizzasAtivas = useMemo(
    () => pizzas.filter((pizza) => pizza.ativa),
    [pizzas]
  );

  const totalItens = useMemo(
    () => getPedidoItensQuantidade(items),
    [items]
  );

  const handleAdicionarItem = () => {
    setErro(null);
    if (!pizzaSelecionadaId) {
      setErro('Selecione uma pizza para adicionar.');
      return;
    }

    const pizza = pizzasAtivas.find((item) => item.id === pizzaSelecionadaId);
    if (!pizza) {
      setErro('Pizza selecionada nao encontrada.');
      return;
    }

    const quantidade = Math.max(1, Number(quantidadeItem) || 1);
    setItems((prev) => [
      ...prev,
      {
        pizza_id: pizza.id,
        nome: pizza.nome,
        tamanho: pizza.tamanho,
        quantidade,
        observacoes: obsItem.trim() || null,
      },
    ]);

    setPizzaSelecionadaId('');
    setQuantidadeItem('1');
    setObsItem('');
  };

  const handleRemoverItem = (index: number) => {
    setItems((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);

    if (!horario) {
      setErro('Informe o horario do pedido.');
      return;
    }

    if (pizzasAtivas.length > 0 && items.length === 0) {
      setErro('Adicione pelo menos um item ao pedido.');
      return;
    }

    const observacoesPayload = serializePedidoObservacoes({
      items,
      observacoesLivre: observacoes.trim() || null,
    });

    await criarPedido({
      nome_cliente: cliente.trim() || null,
      codigo_entrega: codigoEntrega.trim() || null,
      telefone: telefone.trim() || null,
      endereco: endereco.trim() || null,
      bairro: bairro.trim() || null,
      referencia: referencia.trim() || null,
      horario_pedido: horario,
      observacoes: observacoesPayload,
    });
    navigate('/pizzaria/pedidos');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pizzaria</p>
          <h1 className="font-display text-3xl text-primary">Novo pedido</h1>
          <p className="text-sm text-muted mt-2">
            Registre o pedido com composicao de itens e observacoes.
          </p>
        </div>
        <Link to="/pizzaria/pedidos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="space-y-3">
        <h2 className="font-display text-xl">Itens do pedido</h2>
        {pizzasAtivas.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhuma pizza ativa no cardapio. Cadastre em Cardapio para usar selecao rapida.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={pizzaSelecionadaId}
                onChange={(event) => setPizzaSelecionadaId(event.target.value)}
                className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
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
                value={quantidadeItem}
                onChange={(event) => setQuantidadeItem(event.target.value)}
                className="rounded-xl border border-cloud px-4 py-2"
                placeholder="Qtd"
              />
              <input
                value={obsItem}
                onChange={(event) => setObsItem(event.target.value)}
                className="rounded-xl border border-cloud px-4 py-2"
                placeholder="Obs do item"
              />
            </div>
            <Button variant="outline" onClick={handleAdicionarItem}>
              Adicionar item
            </Button>
          </>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-muted">Nenhum item adicionado ainda.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.nome}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cloud px-3 py-2 text-sm"
              >
                <span>{formatPedidoItem(item)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoverItem(index)}
                >
                  Remover
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted">Total de itens: {totalItens}</p>
          </div>
        )}
      </Card>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <input
            value={cliente}
            onChange={(event) => setCliente(event.target.value)}
            placeholder="Cliente"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={codigoEntrega}
            onChange={(event) => setCodigoEntrega(event.target.value)}
            placeholder="Codigo"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={telefone}
            onChange={(event) => setTelefone(event.target.value)}
            placeholder="Telefone"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            type="time"
            value={horario}
            onChange={(event) => setHorario(event.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={endereco}
            onChange={(event) => setEndereco(event.target.value)}
            placeholder="Endereco"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <input
            value={bairro}
            onChange={(event) => setBairro(event.target.value)}
            placeholder="Bairro"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={referencia}
            onChange={(event) => setReferencia(event.target.value)}
            placeholder="Referencia"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <textarea
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            placeholder="Observacoes gerais"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
            rows={3}
          />
          {erro ? <p className="text-sm text-danger md:col-span-2">{erro}</p> : null}
          <Button type="submit" disabled={creating} className="md:col-span-2">
            Salvar pedido
          </Button>
        </form>
      </Card>
    </div>
  );
}
