import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useFormularios } from './useFormularios';

export default function FormularioRespostasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formularios, respostas, deletarResposta, isLoading } = useFormularios();

  const formulario = formularios.find((f) => f.id === id);
  const respostasFiltradas = respostas.filter((r) => r.formulario_id === id);
  const campoLabels = new Map(
    (formulario?.campos ?? []).map((campo) => [campo.id, campo.label])
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando respostas...</Card>
      </div>
    );
  }

  if (!formulario) {
    return (
      <div className="space-y-6">
        <Card>Formulário não encontrado.</Card>
        <Button onClick={() => navigate('/formularios')} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const handleDelete = async (responseId: string) => {
    if (!window.confirm('Deseja excluir esta resposta?')) return;
    await deletarResposta(responseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Respostas</h1>
          <p className="text-sm text-muted mt-2">{formulario.titulo}</p>
        </div>
        <Link to="/formularios">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {respostasFiltradas.length === 0 ? (
          <Card>Nenhuma resposta registrada.</Card>
        ) : (
          respostasFiltradas.map((r) => (
            <Card key={r.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{formatDateTime(r.preenchido_em)}</p>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                  Excluir
                </Button>
              </div>
              <div className="text-sm">
                {Object.entries(r.valores ?? {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted">{campoLabels.get(key) ?? key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

