import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useAuth } from '../auth/AuthProvider';
import { useChecklists } from './useChecklists';

export default function ChecklistPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const {
    templates,
    execucoes,
    isLoading,
    iniciarExecucao,
    deletarTemplate,
    deletarExecucao,
  } = useChecklists();

  const templatesById = useMemo(() => {
    return new Map(templates.map((t) => [t.id, t]));
  }, [templates]);

  const handleStart = async (templateId: string, itens: string[]) => {
    const exec = await iniciarExecucao({
      fiscalId,
      templateId,
      itensSnapshot: itens,
    });
    navigate(`/checklists/execucao/${exec.id}`);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Deseja excluir este template?')) return;
    await deletarTemplate(id);
  };

  const handleDeleteExecucao = async (id: string) => {
    if (!window.confirm('Deseja excluir esta execução?')) return;
    await deletarExecucao(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Checklists</h1>
          <p className="text-sm text-muted mt-2">
            Templates, janelas de notificação e execuções do dia.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/checklists/novo">
            <Button>Novo template</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-lg mb-3">Templates</h2>
          {isLoading ? (
            <p className="text-sm text-muted">Carregando...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted">Nenhum template cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-cloud p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-base">{t.titulo}</h3>
                      <p className="text-xs text-muted">{t.descricao}</p>
                    </div>
                    <span className="rounded-full border border-cloud px-2 py-1 text-xs">
                      {t.periodizacao}
                    </span>
                  </div>
                  <p className="text-xs text-muted">Itens: {t.itens?.length ?? 0}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStart(t.id, t.itens ?? [])}
                    >
                      Iniciar execução
                    </Button>
                    <Link to={`/checklists/${t.id}/editar`}>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(t.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg mb-3">Execuções recentes</h2>
          {isLoading ? (
            <p className="text-sm text-muted">Carregando...</p>
          ) : execucoes.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma execução registrada.</p>
          ) : (
            <div className="space-y-3">
              {execucoes.slice(0, 8).map((exec) => {
                const template = templatesById.get(exec.tipo);
                const total = exec.itens_snapshot?.length ?? 0;
                const marcados = exec.itens_marcados
                  ? Object.values(exec.itens_marcados).filter(Boolean).length
                  : 0;
                return (
                  <div
                    key={exec.id}
                    className="rounded-xl border border-cloud p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {template?.titulo ?? 'Template'}
                        </p>
                        <p className="text-xs text-muted">{formatDateTime(exec.data)}</p>
                      </div>
                      <span className="rounded-full border border-cloud px-2 py-1 text-xs">
                        {exec.concluido ? 'Concluído' : 'Em aberto'}
                      </span>
                    </div>
                    <p className="text-xs text-muted">Progresso: {marcados}/{total}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/checklists/execucao/${exec.id}`}>
                        <Button size="sm" variant="outline">
                          Abrir
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteExecucao(exec.id)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


