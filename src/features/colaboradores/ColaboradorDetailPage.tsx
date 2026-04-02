import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { fetchColaboradorById, updateColaborador } from './api';
import { createRegistroPonto, fetchRegistrosPorColaboradores } from '../escala/api';

export default function ColaboradorDetailPage() {
  const { id } = useParams();
  const colaboradorId = id ?? '';
  const [entrada, setEntrada] = useState('');
  const [saida, setSaida] = useState('');
  const [observacao, setObservacao] = useState('');

  const colaboradorQuery = useQuery({
    queryKey: ['colaborador', colaboradorId],
    queryFn: () => fetchColaboradorById(colaboradorId),
    enabled: !!colaboradorId,
  });

  const registrosQuery = useQuery({
    queryKey: ['registros_ponto', colaboradorId],
    queryFn: () => fetchRegistrosPorColaboradores([colaboradorId]),
    enabled: !!colaboradorId,
  });

  const colaborador = colaboradorQuery.data;
  const registros = registrosQuery.data ?? [];

  const ultimosRegistros = useMemo(() => registros.slice(0, 5), [registros]);

  const handleSalvarRegistro = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!colaboradorId) return;
    const hoje = new Date().toISOString().substring(0, 10);
    await createRegistroPonto({
      colaborador_id: colaboradorId,
      data: hoje,
      entrada: entrada || null,
      saida: saida || null,
      observacao: observacao || null,
    });
    setEntrada('');
    setSaida('');
    setObservacao('');
    registrosQuery.refetch();
  };

  if (colaboradorQuery.isLoading) {
    return <Card>Carregando colaborador...</Card>;
  }

  if (!colaborador) {
    return <Card>Colaborador nÃ£o encontrado.</Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Colaboradores</p>
        <h1 className="font-display text-3xl text-primary">{colaborador.nome}</h1>
        <p className="text-sm text-muted mt-2">Departamento: {colaborador.departamento}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-2">
          <h2 className="font-display text-lg">Detalhes</h2>
          <p className="text-sm text-muted">Telefone: {colaborador.telefone ?? 'â€”'}</p>
          <p className="text-sm text-muted">Cargo: {colaborador.cargo ?? 'â€”'}</p>
          <p className="text-sm text-muted">CPF: {colaborador.cpf ?? 'â€”'}</p>
          <Button
            variant="outline"
            onClick={() => updateColaborador({ id: colaborador.id, patch: { ativo: !colaborador.ativo } })}
          >
            {colaborador.ativo ? 'Desativar' : 'Ativar'}
          </Button>
        </Card>

        <Card>
          <h2 className="font-display text-lg mb-3">Registro rÃ¡pido</h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={handleSalvarRegistro}>
            <input
              type="time"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              className="rounded-xl border border-cloud px-4 py-2"
            />
            <input
              type="time"
              value={saida}
              onChange={(e) => setSaida(e.target.value)}
              className="rounded-xl border border-cloud px-4 py-2"
            />
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Obs"
              className="rounded-xl border border-cloud px-4 py-2"
            />
            <Button type="submit" className="md:col-span-3">
              Salvar registro
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-lg mb-3">Ãšltimos registros</h2>
        {ultimosRegistros.length === 0 ? (
          <p className="text-sm text-muted">Nenhum registro encontrado.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {ultimosRegistros.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-cloud px-3 py-2">
                <span>{r.data}</span>
                <span>Entrada {r.entrada ?? 'â€”'} â€¢ SaÃ­da {r.saida ?? 'â€”'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

