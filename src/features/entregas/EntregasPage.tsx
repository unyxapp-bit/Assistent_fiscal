import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useEntregas } from './useEntregas';

const statusOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'separada', label: 'Separadas' },
  { value: 'em_rota', label: 'Em rota' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelada', label: 'Canceladas' },
];

export default function EntregasPage() {
  const { data, isLoading, atualizarEntrega } = useEntregas();
  const [statusFiltro, setStatusFiltro] = useState('todas');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [busca, setBusca] = useState('');

  const entregas = data ?? [];

  const counts = useMemo(() => {
    return entregas.reduce<Record<string, number>>((acc, entrega) => {
      acc[entrega.status] = (acc[entrega.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [entregas]);

  const filtered = useMemo(() => {
    return entregas.filter((entrega) => {
      if (statusFiltro !== 'todas' && entrega.status !== statusFiltro) return false;
      if (cidadeFiltro.trim()) {
        const city = entrega.cidade?.toLowerCase() ?? '';
        if (!city.includes(cidadeFiltro.trim().toLowerCase())) return false;
      }
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const stack = `${entrega.numero_nota} ${entrega.cliente_nome} ${entrega.endereco ?? ''}`;
        if (!stack.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [entregas, statusFiltro, cidadeFiltro, busca]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Entregas</h1>
          <p className="text-sm text-muted mt-2">
            Controle de pedidos separados, em rota e concluídos com status em tempo real.
          </p>
        </div>
        <Link to="/entregas/nova">
          <Button>Nova entrega</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          value={cidadeFiltro}
          onChange={(e) => setCidadeFiltro(e.target.value)}
          placeholder="Filtrar por cidade"
          className="rounded-xl border border-cloud px-4 py-2"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nota, cliente ou endereço"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <div className="text-xs text-muted md:col-span-4 flex flex-wrap gap-3">
          <span>Separadas: {counts.separada ?? 0}</span>
          <span>Em rota: {counts.em_rota ?? 0}</span>
          <span>Entregues: {counts.entregue ?? 0}</span>
          <span>Canceladas: {counts.cancelada ?? 0}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando entregas...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhuma entrega encontrada.</Card>
        ) : (
          filtered.map((entrega) => (
            <Card key={entrega.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">
                    NF {entrega.numero_nota} · {entrega.cliente_nome}
                  </h3>
                  <p className="text-sm text-muted">
                    {entrega.endereco ?? 'Endereço não informado'}
                    {entrega.bairro ? ` · ${entrega.bairro}` : ''}
                    {entrega.cidade ? ` · ${entrega.cidade}` : ''}
                  </p>
                  <p className="text-xs text-muted">
                    Separado em {formatDateTime(entrega.separado_em)}
                  </p>
                </div>
                <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                  {entrega.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/entregas/${entrega.id}`}>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </Link>
                {entrega.status === 'separada' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      atualizarEntrega({
                        id: entrega.id,
                        patch: {
                          status: 'em_rota',
                          saiu_para_entrega_em: new Date().toISOString(),
                        },
                      })
                    }
                  >
                    Marcar em rota
                  </Button>
                ) : null}
                {entrega.status === 'em_rota' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      atualizarEntrega({
                        id: entrega.id,
                        patch: {
                          status: 'entregue',
                          entregue_em: new Date().toISOString(),
                        },
                      })
                    }
                  >
                    Marcar entregue
                  </Button>
                ) : null}
                {entrega.status !== 'cancelada' && entrega.status !== 'entregue' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      atualizarEntrega({
                        id: entrega.id,
                        patch: { status: 'cancelada' },
                      })
                    }
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

