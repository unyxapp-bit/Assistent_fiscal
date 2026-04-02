import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useChecklists } from './useChecklists';

const periodos = ['qualquer_horario', 'abertura', 'fechamento', 'horario_especifico'];

export default function ChecklistTemplateFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { templates, criarTemplate, atualizarTemplate, creating } = useChecklists();

  const template = templates.find((t) => t.id === id);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [periodizacao, setPeriodizacao] = useState('qualquer_horario');
  const [horario, setHorario] = useState('');
  const [itens, setItens] = useState('');

  useEffect(() => {
    if (!template) return;
    setTitulo(template.titulo ?? '');
    setDescricao(template.descricao ?? '');
    setPeriodizacao(template.periodizacao ?? 'qualquer_horario');
    setHorario(template.horario_notificacao ?? '');
    setItens((template.itens ?? []).join('\n'));
  }, [template]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim()) return;
    const itensList = itens
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);
    if (template) {
      await atualizarTemplate({
        id: template.id,
        patch: {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          itens: itensList,
          periodizacao,
          horario_notificacao: periodizacao === 'horario_especifico' ? horario || null : null,
        },
      });
    } else {
      await criarTemplate({
        fiscalId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        itens: itensList,
        periodizacao,
        horarioNotificacao: periodizacao === 'horario_especifico' ? horario || null : null,
      });
    }
    navigate('/checklists');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">
            {template ? 'Editar template' : 'Novo template'}
          </h1>
          <p className="text-sm text-muted mt-2">
            Defina o roteiro, janela de execução e itens do checklist.
          </p>
        </div>
        <Link to="/checklists">
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
            value={periodizacao}
            onChange={(e) => setPeriodizacao(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            placeholder="Horário"
            disabled={periodizacao !== 'horario_especifico'}
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
          />
          <textarea
            value={itens}
            onChange={(e) => setItens(e.target.value)}
            placeholder="Itens do checklist (um por linha)"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
            rows={4}
          />
          <Button type="submit" disabled={creating} className="md:col-span-4">
            Salvar template
          </Button>
        </form>
      </Card>
    </div>
  );
}


