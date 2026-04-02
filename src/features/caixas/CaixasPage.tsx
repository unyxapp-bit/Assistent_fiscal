import React, { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import type { TipoCaixa } from '../../shared/types';
import { useCaixas } from './useCaixas';
import { cn } from '../../shared/lib/cn';

const tipos: TipoCaixa[] = ['normal', 'rapido', 'self', 'balcao'];

export default function CaixasPage() {
  const { data, isLoading, createCaixa, updateCaixa, updating } = useCaixas();
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState<TipoCaixa>('normal');
  const [busca, setBusca] = useState('');
  const [filtroAtivos, setFiltroAtivos] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [erro, setErro] = useState<string | null>(null);
  const caixas = data ?? [];

  const stats = useMemo(
    () => ({
      total: caixas.length,
      ativos: caixas.filter((c) => c.ativo).length,
      manutencao: caixas.filter((c) => c.em_manutencao).length,
    }),
    [caixas]
  );

  const filtrados = caixas.filter((c) => {
    if (filtroAtivos === 'ativos' && !c.ativo) return false;
    if (filtroAtivos === 'inativos' && c.ativo) return false;
    if (busca && !`${c.numero}`.includes(busca)) return false;
    return true;
  });

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);
    const num = Number(numero);
    if (!num) return;
    if (caixas.some((c) => c.numero === num)) {
      setErro('J? existe um caixa com esse n?mero.');
      return;
    }
    await createCaixa({ numero: num, tipo });
    setNumero('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Gest?o</p>
        <h1 className="font-display text-3xl text-primary">Caixas</h1>
        <p className="text-sm text-muted mt-2">
          Configure caixas, status e manuten??o. Sincronizado com Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-muted">Total</p>
          <h2 className="text-2xl font-semibold">{stats.total}</h2>
        </Card>
        <Card>
          <p className="text-sm text-muted">Ativos</p>
          <h2 className="text-2xl font-semibold">{stats.ativos}</h2>
        </Card>
        <Card>
          <p className="text-sm text-muted">Em manuten??o</p>
          <h2 className="text-2xl font-semibold">{stats.manutencao}</h2>
        </Card>
      </div>

      <Card>
        <form className="flex flex-col md:flex-row gap-3" onSubmit={handleCreate}>
          <input
            type="number"
            placeholder="N?mero"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full md:w-40 rounded-xl border border-cloud px-4 py-2"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoCaixa)}
            className="w-full md:w-44 rounded-xl border border-cloud px-4 py-2"
          >
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={updating}>
            Adicionar caixa
          </Button>
        </form>
        {erro ? <p className="text-sm text-danger mt-2">{erro}</p> : null}
      </Card>

      <Card className="flex flex-wrap items-center gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar n?mero"
          className="rounded-xl border border-cloud px-4 py-2"
        />
        {(['ativos', 'inativos', 'todos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltroAtivos(f)}
            className={cn(
              'rounded-full px-4 py-2 text-sm border',
              filtroAtivos === f ? 'bg-primary text-white border-primary' : 'border-cloud'
            )}
          >
            {f === 'todos' ? 'Todos' : f === 'ativos' ? 'Ativos' : 'Inativos'}
          </button>
        ))}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando caixas...</Card>
        ) : filtrados.length === 0 ? (
          <Card>Nenhum caixa encontrado.</Card>
        ) : (
          filtrados.map((caixa) => (
            <Card key={caixa.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl">Caixa {caixa.numero}</h3>
                  <p className="text-sm text-muted">Tipo: {caixa.tipo}</p>
                </div>
                <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                  {caixa.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() =>
                    updateCaixa({
                      id: caixa.id,
                      patch: { ativo: !caixa.ativo },
                    })
                  }
                >
                  {caixa.ativo ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() =>
                    updateCaixa({
                      id: caixa.id,
                      patch: { em_manutencao: !caixa.em_manutencao },
                    })
                  }
                >
                  {caixa.em_manutencao ? 'Liberar' : 'Manuten??o'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

