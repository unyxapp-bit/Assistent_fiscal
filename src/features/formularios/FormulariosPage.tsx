import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useFormularios } from './useFormularios';

export default function FormulariosPage() {
  const { formularios, respostas, isLoading, deletarFormulario } = useFormularios();
  const [busca, setBusca] = useState('');

  const respostasPorFormulario = useMemo(() => {
    return respostas.reduce<Record<string, number>>((acc, r) => {
      acc[r.formulario_id] = (acc[r.formulario_id] ?? 0) + 1;
      return acc;
    }, {});
  }, [respostas]);

  const filtered = useMemo(() => {
    if (!busca.trim()) return formularios;
    const term = busca.trim().toLowerCase();
    return formularios.filter((f) =>
      `${f.titulo} ${f.descricao ?? ''}`.toLowerCase().includes(term)
    );
  }, [formularios, busca]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este formulário?')) return;
    await deletarFormulario(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Formulários</h1>
          <p className="text-sm text-muted mt-2">Templates e respostas do time.</p>
        </div>
        <Link to="/formularios/novo">
          <Button>Novo formulário</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou descrição"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <div className="text-xs text-muted flex items-center">
          Total: {formularios.length} · Respostas: {respostas.length}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando formulários...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhum formulário cadastrado.</Card>
        ) : (
          filtered.map((f) => (
            <Card key={f.id} className="flex flex-col gap-3">
              <div>
                <h3 className="font-display text-lg">{f.titulo}</h3>
                <p className="text-sm text-muted">{f.descricao}</p>
              </div>
              <p className="text-xs text-muted">
                Campos: {f.campos?.length ?? 0} · Respostas: {respostasPorFormulario[f.id] ?? 0}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/formularios/${f.id}/preencher`}>
                  <Button size="sm" variant="outline">
                    Preencher
                  </Button>
                </Link>
                <Link to={`/formularios/${f.id}/editar`}>
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                </Link>
                <Link to={`/formularios/${f.id}/respostas`}>
                  <Button size="sm" variant="outline">
                    Respostas
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(f.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {respostas.length > 0 ? (
        <Card>
          <h2 className="font-display text-lg mb-3">Respostas recentes</h2>
          <div className="space-y-2">
            {respostas.slice(0, 5).map((r) => (
              <div key={r.id} className="text-sm text-muted">
                {formatDateTime(r.preenchido_em)} · {r.formulario_id}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}


