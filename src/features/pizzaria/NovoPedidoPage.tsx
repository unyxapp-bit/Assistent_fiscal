import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { usePizzaria } from './usePizzaria';

export default function NovoPedidoPage() {
  const { criarPedido, creating } = usePizzaria();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState('');
  const [codigoEntrega, setCodigoEntrega] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [referencia, setReferencia] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!horario) return;
    await criarPedido({
      nome_cliente: cliente.trim() || null,
      codigo_entrega: codigoEntrega.trim() || null,
      telefone: telefone.trim() || null,
      endereco: endereco.trim() || null,
      bairro: bairro.trim() || null,
      referencia: referencia.trim() || null,
      horario_pedido: horario,
      observacoes: observacoes.trim() || null,
    });
    navigate('/pizzaria/pedidos');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pizzaria</p>
          <h1 className="font-display text-3xl text-primary">Novo pedido</h1>
          <p className="text-sm text-muted mt-2">Registre um novo pedido manualmente.</p>
        </div>
        <Link to="/pizzaria/pedidos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Cliente"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={codigoEntrega}
            onChange={(e) => setCodigoEntrega(e.target.value)}
            placeholder="Código"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Endereço"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <input
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Bairro"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Referência"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
            rows={3}
          />
          <Button type="submit" disabled={creating} className="md:col-span-2">
            Salvar pedido
          </Button>
        </form>
      </Card>
    </div>
  );
}


