import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useProcedimentos } from './useProcedimentos';

export default function ProcedimentoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, atualizarProcedimento } = useProcedimentos();
  const procedimento = (data ?? []).find((p) => p.id === id);

  const passos = procedimento?.passos ?? [];
  const storageKey = `procedimento_progress_${procedimento?.id ?? ''}`;

  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!procedimento) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setMarcados(JSON.parse(stored));
    } else {
      setMarcados({});
    }
  }, [procedimento, storageKey]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando procedimento...</Card>
      </div>
    );
  }

  if (!procedimento) {
    return (
      <div className="space-y-6">
        <Card>Procedimento não encontrado.</Card>
        <Button onClick={() => navigate('/procedimentos')} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const handleToggle = (item: string) => {
    const next = { ...marcados, [item]: !marcados[item] };
    setMarcados(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const progresso = passos.length
    ? Math.round((Object.values(marcados).filter(Boolean).length / passos.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">{procedimento.titulo}</h1>
          <p className="text-sm text-muted mt-2">
            Categoria: {procedimento.categoria ?? 'rotina'} · Tempo estimado:{' '}
            {procedimento.tempo_estimado ?? '-'} min
          </p>
        </div>
        <Link to="/procedimentos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Progresso: {progresso}%</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                atualizarProcedimento({
                  id: procedimento.id,
                  patch: { favorito: !procedimento.favorito },
                })
              }
            >
              {procedimento.favorito ? 'Remover favorito' : 'Favoritar'}
            </Button>
            <Link to={`/procedimentos/${procedimento.id}/editar`}>
              <Button variant="outline">Editar</Button>
            </Link>
          </div>
        </div>
        {procedimento.descricao ? (
          <p className="text-sm text-muted">{procedimento.descricao}</p>
        ) : null}
        <div className="space-y-2">
          {passos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum passo registrado.</p>
          ) : (
            passos.map((passo) => (
              <label
                key={passo}
                className="flex items-center gap-3 rounded-xl border border-cloud px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(marcados[passo])}
                  onChange={() => handleToggle(passo)}
                />
                <span className={marcados[passo] ? 'line-through text-muted' : ''}>
                  {passo}
                </span>
              </label>
            ))
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setMarcados({});
            localStorage.removeItem(storageKey);
          }}
        >
          Reiniciar progresso
        </Button>
      </Card>
    </div>
  );
}


