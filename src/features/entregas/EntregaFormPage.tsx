import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { todayIsoDate } from '../../shared/lib/dates';
import { useAuth } from '../auth/AuthProvider';
import { useEntregas } from './useEntregas';

export default function EntregaFormPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { criarEntrega, creating } = useEntregas();
  const [numeroNota, setNumeroNota] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const horarioMarcado = useMemo(() => {
    if (!horario) return null;
    return `${todayIsoDate()}T${horario}:00`;
  }, [horario]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!numeroNota.trim() || !clienteNome.trim()) return;
    const entrega = await criarEntrega({
      fiscalId,
      numeroNota: numeroNota.trim(),
      clienteNome: clienteNome.trim(),
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      endereco: endereco.trim() || null,
      telefone: telefone.trim() || null,
      observacoes: observacoes.trim() || null,
      horarioMarcado,
    });
    navigate(`/entregas/${entrega.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Nova entrega</h1>
          <p className="text-sm text-muted mt-2">
            Registre a nota fiscal e os dados do cliente para acompanhar o fluxo.
          </p>
        </div>
        <Link to="/entregas">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <input
            value={numeroNota}
            onChange={(e) => setNumeroNota(e.target.value)}
            placeholder="Número da NF"
            className="rounded-xl border border-cloud px-4 py-2"
          />
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
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
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
            Salvar entrega
          </Button>
        </form>
      </Card>
    </div>
  );
}

