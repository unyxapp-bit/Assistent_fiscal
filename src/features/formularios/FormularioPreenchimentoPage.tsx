import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useFormularios } from './useFormularios';

export default function FormularioPreenchimentoPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { formularios, criarResposta, creating, isLoading } = useFormularios();

  const formulario = formularios.find((f) => f.id === id);
  const campos = formulario?.campos ?? [];
  const initialValues = useMemo(() => {
    return campos.reduce<Record<string, unknown>>((acc, campo) => {
      acc[campo.id] = '';
      return acc;
    }, {});
  }, [campos]);

  const [valores, setValores] = useState<Record<string, unknown>>(initialValues);

  useEffect(() => {
    setValores(initialValues);
  }, [initialValues]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando formulário...</Card>
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

  const handleChange = (campoId: string, value: unknown) => {
    setValores((prev) => ({ ...prev, [campoId]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await criarResposta({
      fiscalId,
      formularioId: formulario.id,
      valores,
    });
    navigate(`/formularios/${formulario.id}/respostas`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-ink">Preencher formulário</h1>
          <p className="text-sm text-muted mt-2">{formulario.titulo}</p>
        </div>
        <Link to="/formularios">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
          {campos.map((campo) => (
            <div key={campo.id} className="flex flex-col gap-2">
              <label className="text-sm text-muted">{campo.label}</label>
              {campo.tipo === 'opcao' ? (
                <select
                  value={(valores[campo.id] as string) ?? ''}
                  onChange={(e) => handleChange(campo.id, e.target.value)}
                  className="rounded-xl border border-cloud px-4 py-2"
                >
                  <option value="">Selecione</option>
                  {campo.opcoes.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={
                    campo.tipo === 'numero'
                      ? 'number'
                      : campo.tipo === 'data'
                        ? 'date'
                        : campo.tipo === 'hora'
                          ? 'time'
                          : 'text'
                  }
                  value={(valores[campo.id] as string) ?? ''}
                  onChange={(e) => handleChange(campo.id, e.target.value)}
                  className="rounded-xl border border-cloud px-4 py-2"
                />
              )}
            </div>
          ))}
          <Button type="submit" disabled={creating} className="md:col-span-2">
            Enviar resposta
          </Button>
        </form>
      </Card>
    </div>
  );
}
