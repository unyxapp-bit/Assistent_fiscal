import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useCupomConfig } from './useCupomConfig';

type EditableValue = string | number | boolean | null;

const READONLY_KEYS = ['id', 'fiscal_id', 'created_at', 'updated_at'];

export default function CupomConfigPage() {
  const { config, isLoading, salvar, saving } = useCupomConfig();
  const [draft, setDraft] = useState<Record<string, EditableValue>>({});

  useEffect(() => {
    if (!config) return;
    const base: Record<string, EditableValue> = {};
    Object.entries(config).forEach(([key, value]) => {
      if (READONLY_KEYS.includes(key)) return;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        base[key] = value;
      } else if (value === null || value === undefined) {
        base[key] = null;
      }
    });
    setDraft(base);
  }, [config]);

  const fields = useMemo(() => Object.keys(draft), [draft]);

  const handleChange = (key: string, value: EditableValue) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await salvar(draft);
  };

  const previewText = useMemo(() => {
    const lines: string[] = [];
    fields.forEach((key) => {
      const value = draft[key];
      if (value === null || value === undefined || value === '') return;
      lines.push(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`);
    });
    return lines.join('\n');
  }, [draft, fields]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Configurações</p>
        <h1 className="font-display text-3xl text-ink">Configuração do Cupom</h1>
        <p className="text-sm text-muted mt-2">
          Edite campos do cupom fiscal, alternando flags e textos exibidos.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-lg mb-3">Campos</h2>
          {isLoading ? (
            <p className="text-sm text-muted">Carregando configuração...</p>
          ) : fields.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhuma configuração encontrada. Ajuste os campos no Supabase ou salve
              uma nova configuração.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((key) => {
                const value = draft[key];
                if (typeof value === 'boolean') {
                  return (
                    <label key={key} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{key.replace(/_/g, ' ')}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleChange(key, e.target.checked)}
                      />
                    </label>
                  );
                }
                return (
                  <label key={key} className="block text-sm text-ink">
                    {key.replace(/_/g, ' ')}
                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value ?? ''}
                      onChange={(e) =>
                        handleChange(
                          key,
                          typeof value === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-cloud px-4 py-2"
                    />
                  </label>
                );
              })}
            </div>
          )}
          <Button className="mt-4" onClick={handleSave} disabled={saving || isLoading}>
            Salvar configuração
          </Button>
        </Card>

        <Card>
          <h2 className="font-display text-lg mb-3">Pré-visualização</h2>
          {previewText ? (
            <pre className="whitespace-pre-wrap text-sm text-muted">{previewText}</pre>
          ) : (
            <p className="text-sm text-muted">Sem dados para exibir.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
