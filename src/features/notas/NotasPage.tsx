import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import type { Nota } from '../../shared/types';
import { useNotas } from './useNotas';

const tipos: Array<Nota['tipo'] | 'todas'> = ['todas', 'anotacao', 'tarefa', 'lembrete'];

export default function NotasPage() {
  const { data, isLoading, atualizarNota } = useNotas();
  const [tipoFiltro, setTipoFiltro] = useState<'todas' | Nota['tipo']>('todas');
  const [mostrarConcluidas, setMostrarConcluidas] = useState(true);
  const [busca, setBusca] = useState('');

  const notas = data ?? [];

  const filtered = useMemo(() => {
    return notas.filter((nota) => {
      if (!mostrarConcluidas && nota.concluida) return false;
      if (tipoFiltro !== 'todas' && nota.tipo !== tipoFiltro) return false;
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const stack = `${nota.titulo} ${nota.conteudo}`.toLowerCase();
        if (!stack.includes(term)) return false;
      }
      return true;
    });
  }, [notas, mostrarConcluidas, tipoFiltro, busca]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Notas</h1>
          <p className="text-sm text-muted mt-2">
            Anotações rápidas, tarefas e lembretes com alertas.
          </p>
        </div>
        <Link to="/notas/nova">
          <Button>Nova nota</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as typeof tipoFiltro)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t === 'todas' ? 'Todos os tipos' : t}
            </option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou conteúdo"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={mostrarConcluidas}
            onChange={(e) => setMostrarConcluidas(e.target.checked)}
          />
          Mostrar concluídas
        </label>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando notas...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhuma nota encontrada.</Card>
        ) : (
          filtered.map((nota) => (
            <Card key={nota.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">{nota.titulo}</h3>
                  <p className="text-sm text-muted">{nota.conteudo}</p>
                  {nota.data_lembrete ? (
                    <p className="text-xs text-muted">
                      Lembrete: {formatDateTime(nota.data_lembrete)}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                  {nota.tipo}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/notas/${nota.id}`}>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    atualizarNota({
                      id: nota.id,
                      patch: { concluida: !nota.concluida },
                    })
                  }
                >
                  {nota.concluida ? 'Reabrir' : 'Concluir'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    atualizarNota({
                      id: nota.id,
                      patch: { importante: !nota.importante },
                    })
                  }
                >
                  {nota.importante ? 'Remover destaque' : 'Destacar'}
                </Button>
                {nota.tipo === 'lembrete' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      atualizarNota({
                        id: nota.id,
                        patch: { lembrete_ativo: !nota.lembrete_ativo },
                      })
                    }
                  >
                    {nota.lembrete_ativo ? 'Silenciar' : 'Ativar alerta'}
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


