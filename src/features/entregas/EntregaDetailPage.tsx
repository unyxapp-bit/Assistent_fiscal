import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime, todayIsoDate } from '../../shared/lib/dates';
import { useEntregas } from './useEntregas';

export default function EntregaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, atualizarEntrega, deletarEntrega } = useEntregas();

  const entrega = (data ?? []).find((item) => item.id === id);
  const [clienteNome, setClienteNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [horario, setHorario] = useState('');

  useEffect(() => {
    if (!entrega) return;
    setClienteNome(entrega.cliente_nome ?? '');
    setTelefone(entrega.telefone ?? '');
    setEndereco(entrega.endereco ?? '');
    setBairro(entrega.bairro ?? '');
    setCidade(entrega.cidade ?? '');
    setObservacoes(entrega.observacoes ?? '');
    if (entrega.horario_marcado) {
      const date = new Date(entrega.horario_marcado);
      setHorario(`${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`);
    }
  }, [entrega]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando entrega...</Card>
      </div>
    );
  }

  if (!entrega) {
    return (
      <div className="space-y-6">
        <Card>Entrega não encontrada.</Card>
        <Button onClick={() => navigate('/entregas')} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    await atualizarEntrega({
      id: entrega.id,
      patch: {
        cliente_nome: clienteNome.trim(),
        telefone: telefone.trim() || null,
        endereco: endereco.trim() || null,
        bairro: bairro.trim() || null,
        cidade: cidade.trim() || null,
        observacoes: observacoes.trim() || null,
        horario_marcado: horario ? `${todayIsoDate()}T${horario}:00` : null,
      },
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Deseja excluir esta entrega?')) return;
    await deletarEntrega(entrega.id);
    navigate('/entregas');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Entrega #{entrega.numero_nota}</h1>
          <p className="text-sm text-muted mt-2">
            Status atual: {entrega.status} · Separado em {formatDateTime(entrega.separado_em)}
          </p>
        </div>
        <Link to="/entregas">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Dados do cliente</p>
        </div>
        <input
          value={clienteNome}
          onChange={(e) => setClienteNome(e.target.value)}
          placeholder="Cliente"
          className="rounded-xl border border-cloud px-4 py-2"
        />
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="Telefone"
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
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade"
          className="rounded-xl border border-cloud px-4 py-2"
        />
        <input
          type="time"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        />
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          rows={3}
        />
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button onClick={handleSave} variant="outline">
            Salvar alterações
          </Button>
          {entrega.status === 'separada' ? (
            <Button
              onClick={() =>
                atualizarEntrega({
                  id: entrega.id,
                  patch: {
                    status: 'em_rota',
                    saiu_para_entrega_em: new Date().toISOString(),
                  },
                })
              }
              variant="outline"
            >
              Marcar em rota
            </Button>
          ) : null}
          {entrega.status === 'em_rota' ? (
            <Button
              onClick={() =>
                atualizarEntrega({
                  id: entrega.id,
                  patch: {
                    status: 'entregue',
                    entregue_em: new Date().toISOString(),
                  },
                })
              }
              variant="outline"
            >
              Marcar entregue
            </Button>
          ) : null}
          {entrega.status !== 'cancelada' && entrega.status !== 'entregue' ? (
            <Button
              onClick={() =>
                atualizarEntrega({
                  id: entrega.id,
                  patch: { status: 'cancelada' },
                })
              }
              variant="ghost"
            >
              Cancelar
            </Button>
          ) : null}
          <Button onClick={handleDelete} variant="ghost">
            Excluir entrega
          </Button>
        </div>
      </Card>
    </div>
  );
}


