import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import type { Nota } from '../../shared/types';
import { useAuth } from '../auth/AuthProvider';
import { useNotas } from './useNotas';

const tipos: Nota['tipo'][] = ['anotacao', 'tarefa', 'lembrete'];

export default function NotaFormPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { criarNota, creating } = useNotas();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<Nota['tipo']>('anotacao');
  const [dataLembrete, setDataLembrete] = useState('');
  const [importante, setImportante] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim()) return;
    const nota = await criarNota({
      fiscalId,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      tipo,
      dataLembrete: dataLembrete ? new Date(dataLembrete).toISOString() : null,
      importante,
      lembreteAtivo: tipo === 'lembrete',
    });
    navigate(`/notas/${nota.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Nova nota</h1>
          <p className="text-sm text-muted mt-2">Registre uma nova anotação, tarefa ou lembrete.</p>
        </div>
        <Link to="/notas">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleCreate}>
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
          <Button type="submit" disabled={creating} className="md:col-span-2">
            Salvar nota
          </Button>
        </form>
      </Card>
    </div>
  );
}


