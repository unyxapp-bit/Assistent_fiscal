import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useFormularios } from './useFormularios';

const tipos = ['texto', 'numero', 'data', 'hora', 'opcao'];

export default function FormularioEditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { formularios, criarFormulario, atualizarFormulario, creating } = useFormularios();

  const formulario = formularios.find((f) => f.id === id);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [campos, setCampos] = useState<
    Array<{ id: string; label: string; tipo: string; obrigatorio: boolean; opcoes: string[] }>
  >([]);

  useEffect(() => {
    if (!formulario) return;
    setTitulo(formulario.titulo ?? '');
    setDescricao(formulario.descricao ?? '');
    setCampos(formulario.campos ?? []);
  }, [formulario]);

  const handleAddCampo = () => {
    setCampos((prev) => [
      ...prev,
      {
        id: `campo_${Date.now()}`,
        label: 'Novo campo',
        tipo: 'texto',
        obrigatorio: true,
        opcoes: [],
      },
    ]);
  };

  const handleUpdateCampo = (index: number, patch: Partial<(typeof campos)[number]>) => {
    setCampos((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  };

  const handleRemoveCampo = (index: number) => {
    setCampos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim()) return;
    if (formulario) {
      await atualizarFormulario({
        id: formulario.id,
        patch: {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          campos,
        },
      });
    } else {
      await criarFormulario({
        fiscalId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        campos,
      });
    }
    navigate('/formularios');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">
            {formulario ? 'Editar formulário' : 'Novo formulário'}
          </h1>
          <p className="text-sm text-muted mt-2">
            Configure campos, obrigatoriedade e opções do formulário.
          </p>
        </div>
        <Link to="/formularios">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="space-y-4">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="rounded-xl border border-cloud px-4 py-2"
          />

          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Campos</h2>
              <Button type="button" variant="outline" onClick={handleAddCampo}>
                Adicionar campo
              </Button>
            </div>

            {campos.length === 0 ? (
              <p className="text-sm text-muted">Nenhum campo adicionado.</p>
            ) : (
              campos.map((campo, index) => (
                <div
                  key={campo.id}
                  className="rounded-xl border border-cloud p-3 grid grid-cols-1 md:grid-cols-4 gap-3"
                >
                  <input
                    value={campo.label}
                    onChange={(e) => handleUpdateCampo(index, { label: e.target.value })}
                    placeholder="Rótulo"
                    className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
                  />
                  <select
                    value={campo.tipo}
                    onChange={(e) => handleUpdateCampo(index, { tipo: e.target.value })}
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
                      checked={campo.obrigatorio}
                      onChange={(e) =>
                        handleUpdateCampo(index, { obrigatorio: e.target.checked })
                      }
                    />
                    Obrigatório
                  </label>
                  {campo.tipo === 'opcao' ? (
                    <input
                      value={campo.opcoes.join(', ')}
                      onChange={(e) =>
                        handleUpdateCampo(index, {
                          opcoes: e.target.value
                            .split(',')
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Opções (separadas por vírgula)"
                      className="rounded-xl border border-cloud px-4 py-2 md:col-span-3"
                    />
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveCampo(index)}
                    className="md:col-span-1"
                  >
                    Remover
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button type="submit" disabled={creating} className="md:col-span-2">
            Salvar formulário
          </Button>
        </form>
      </Card>
    </div>
  );
}


