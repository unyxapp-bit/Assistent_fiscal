import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import type { Nota } from '../../shared/types';
import { useNotas } from './useNotas';

const tipos: Nota['tipo'][] = ['anotacao', 'tarefa', 'lembrete'];

export default function NotaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, atualizarNota, deletarNota } = useNotas();
  const nota = (data ?? []).find((item) => item.id === id);

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<Nota['tipo']>('anotacao');
  const [dataLembrete, setDataLembrete] = useState('');
  const [importante, setImportante] = useState(false);

  useEffect(() => {
    if (!nota) return;
    setTitulo(nota.titulo ?? '');
    setConteudo(nota.conteudo ?? '');
    setTipo(nota.tipo);
    setImportante(nota.importante ?? false);
    if (nota.data_lembrete) {
      const date = new Date(nota.data_lembrete);
      const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDataLembrete(iso);
    }
  }, [nota]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando nota...</Card>
      </div>
    );
  }

  if (!nota) {
    return (
      <div className="space-y-6">
        <Card>Nota não encontrada.</Card>
        <Button onClick={() => navigate('/notas')} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    await atualizarNota({
      id: nota.id,
      patch: {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        tipo,
        importante,
        data_lembrete: dataLembrete ? new Date(dataLembrete).toISOString() : null,
        lembrete_ativo: tipo === 'lembrete',
      },
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Deseja excluir esta nota?')) return;
    await deletarNota(nota.id);
    navigate('/notas');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Detalhe da nota</h1>
          <p className="text-sm text-muted mt-2">
            Criada em {formatDateTime(nota.created_at ?? null)}
          </p>
        </div>
        <Link to="/notas">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Nota['tipo'])}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={importante}
            onChange={(e) => setImportante(e.target.checked)}
          />
          Importante
        </label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Conteúdo"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
          rows={3}
        />
        <input
          type="datetime-local"
          value={dataLembrete}
          onChange={(e) => setDataLembrete(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button onClick={handleSave} variant="outline">
            Salvar alterações
          </Button>
          <Button
            onClick={() =>
              atualizarNota({
                id: nota.id,
                patch: { concluida: !nota.concluida },
              })
            }
            variant="outline"
          >
            {nota.concluida ? 'Reabrir' : 'Concluir'}
          </Button>
          <Button onClick={handleDelete} variant="ghost">
            Excluir nota
          </Button>
        </div>
      </Card>
    </div>
  );
}

