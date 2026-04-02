import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useProcedimentos } from './useProcedimentos';

const categorias = ['abertura', 'fechamento', 'emergencia', 'rotina', 'fiscal', 'caixa', 'guia_rapido'];

export default function ProcedimentoFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { data, criarProcedimento, atualizarProcedimento, creating } = useProcedimentos();

  const procedimento = (data ?? []).find((p) => p.id === id);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('rotina');
  const [tempo, setTempo] = useState('');
  const [passos, setPassos] = useState('');

  useEffect(() => {
    if (!procedimento) return;
    setTitulo(procedimento.titulo ?? '');
    setDescricao(procedimento.descricao ?? '');
    setCategoria(procedimento.categoria ?? 'rotina');
    setTempo(procedimento.tempo_estimado?.toString() ?? '');
    setPassos((procedimento.passos ?? []).join('\n'));
  }, [procedimento]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim()) return;
    const passosList = passos
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    if (procedimento) {
      await atualizarProcedimento({
        id: procedimento.id,
        patch: {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          categoria,
          passos: passosList,
          tempo_estimado: tempo ? Number(tempo) : null,
        },
      });
    } else {
      await criarProcedimento({
        fiscalId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        passos: passosList,
        tempoEstimado: tempo ? Number(tempo) : null,
      });
    }
    navigate('/procedimentos');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">
            {procedimento ? 'Editar procedimento' : 'Novo procedimento'}
          </h1>
          <p className="text-sm text-muted mt-2">Documente passos e padrão de execução.</p>
        </div>
        <Link to="/procedimentos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleSubmit}>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            placeholder="Tempo (min)"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
          />
          <textarea
            value={passos}
            onChange={(e) => setPassos(e.target.value)}
            placeholder="Passos (um por linha)"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
            rows={4}
          />
          <Button type="submit" disabled={creating} className="md:col-span-4">
            Salvar procedimento
          </Button>
        </form>
      </Card>
    </div>
  );
}


