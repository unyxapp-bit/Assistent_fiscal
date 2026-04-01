import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useChecklists } from './useChecklists';

export default function ChecklistExecucaoPage() {
  const { execId } = useParams();
  const navigate = useNavigate();
  const { execucoes, templates, atualizarExecucao, concluirExecucao, isLoading } = useChecklists();

  const execucao = execucoes.find((e) => e.id === execId);
  const template = templates.find((t) => t.id === execucao?.tipo);

  const itens = useMemo(() => {
    if (execucao?.itens_snapshot?.length) return execucao.itens_snapshot;
    return template?.itens ?? [];
  }, [execucao, template]);

  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (execucao?.itens_marcados) {
      setMarcados(execucao.itens_marcados);
    } else {
      setMarcados({});
    }
  }, [execucao]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando checklist...</Card>
      </div>
    );
  }

  if (!execucao) {
    return (
      <div className="space-y-6">
        <Card>Execução não encontrada.</Card>
        <Button onClick={() => navigate('/checklists')} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const handleToggle = async (item: string) => {
    const next = { ...marcados, [item]: !marcados[item] };
    setMarcados(next);
    await atualizarExecucao({ id: execucao.id, patch: { itens_marcados: next } });
  };

  const total = itens.length;
  const feitos = Object.values(marcados).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Execução do checklist</h1>
          <p className="text-sm text-muted mt-2">
            {template?.titulo ?? 'Template'} · {formatDateTime(execucao.data)}
          </p>
        </div>
        <Link to="/checklists">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="space-y-3">
        <p className="text-sm text-muted">Progresso: {feitos}/{total}</p>
        <div className="space-y-2">
          {itens.length === 0 ? (
            <p className="text-sm text-muted">Nenhum item disponível.</p>
          ) : (
            itens.map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 rounded-xl border border-cloud px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(marcados[item])}
                  onChange={() => handleToggle(item)}
                />
                <span className={marcados[item] ? 'line-through text-muted' : ''}>
                  {item}
                </span>
              </label>
            ))
          )}
        </div>
        {!execucao.concluido ? (
          <Button onClick={() => concluirExecucao(execucao.id)} variant="outline">
            Concluir checklist
          </Button>
        ) : (
          <p className="text-xs text-muted">Checklist concluído.</p>
        )}
      </Card>
    </div>
  );
}

