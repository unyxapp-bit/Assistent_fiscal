import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useProcedimentos } from './useProcedimentos';

const categorias = [
  'todas',
  'abertura',
  'fechamento',
  'emergencia',
  'rotina',
  'fiscal',
  'caixa',
  'guia_rapido',
];

export default function ProcedimentosPage() {
  const { data, isLoading, atualizarProcedimento, deletarProcedimento } = useProcedimentos();
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [busca, setBusca] = useState('');

  const procedimentos = data ?? [];

  const filtered = useMemo(() => {
    return procedimentos.filter((proc) => {
      if (categoriaFiltro !== 'todas' && proc.categoria !== categoriaFiltro) return false;
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const stack = `${proc.titulo} ${proc.descricao ?? ''}`.toLowerCase();
        if (!stack.includes(term)) return false;
      }
      return true;
    });
  }, [procedimentos, categoriaFiltro, busca]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este procedimento?')) return;
    await deletarProcedimento(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Procedimentos</h1>
          <p className="text-sm text-muted mt-2">
            Base de procedimentos internos e favoritos de consulta rápida.
          </p>
        </div>
        <Link to="/procedimentos/novo">
          <Button>Novo procedimento</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === 'todas' ? 'Todas as categorias' : c}
            </option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou descrição"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando procedimentos...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhum procedimento cadastrado.</Card>
        ) : (
          filtered.map((proc) => (
            <Card key={proc.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">{proc.titulo}</h3>
                  <p className="text-xs text-muted">{proc.categoria}</p>
                  <p className="text-sm text-muted">{proc.descricao}</p>
                </div>
                <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                  {proc.favorito ? 'Favorito' : 'Normal'}
                </span>
              </div>
              {proc.passos && proc.passos.length > 0 ? (
                <ul className="text-sm text-muted list-disc pl-5">
                  {proc.passos.slice(0, 3).map((passo, index) => (
                    <li key={index}>{passo}</li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Link to={`/procedimentos/${proc.id}`}>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </Link>
                <Link to={`/procedimentos/${proc.id}/editar`}>
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    atualizarProcedimento({
                      id: proc.id,
                      patch: { favorito: !proc.favorito },
                    })
                  }
                >
                  {proc.favorito ? 'Remover favorito' : 'Favoritar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(proc.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

