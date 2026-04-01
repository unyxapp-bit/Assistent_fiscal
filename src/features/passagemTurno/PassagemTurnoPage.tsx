import React, { useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useAuth } from '../auth/AuthProvider';
import { usePassagemTurno } from './usePassagemTurno';

export default function PassagemTurnoPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const { data, isLoading, criarPassagem, deletarPassagem, creating } = usePassagemTurno();
  const [resumo, setResumo] = useState('');
  const [pendencias, setPendencias] = useState('');
  const [recados, setRecados] = useState('');

  const passagens = data ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumo.trim()) return;
    await criarPassagem({
      fiscalId,
      resumo: resumo.trim(),
      pendencias: pendencias.trim(),
      recados: recados.trim(),
    });
    setResumo('');
    setPendencias('');
    setRecados('');
  };

  const handleCopy = async (texto: string) => {
    await navigator.clipboard.writeText(texto);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
        <h1 className="font-display text-3xl text-ink">Passagem de Turno</h1>
        <p className="text-sm text-muted mt-2">
          Resumos diários, pendências e recados entre turnos.
        </p>
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-3" onSubmit={handleCreate}>
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            placeholder="Resumo do turno"
            className="rounded-xl border border-cloud px-4 py-2"
            rows={2}
          />
          <textarea
            value={pendencias}
            onChange={(e) => setPendencias(e.target.value)}
            placeholder="Pendências"
            className="rounded-xl border border-cloud px-4 py-2"
            rows={2}
          />
          <textarea
            value={recados}
            onChange={(e) => setRecados(e.target.value)}
            placeholder="Recados"
            className="rounded-xl border border-cloud px-4 py-2"
            rows={2}
          />
          <Button type="submit" disabled={creating}>
            Registrar passagem
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando passagens...</Card>
        ) : passagens.length === 0 ? (
          <Card>Nenhuma passagem registrada.</Card>
        ) : (
          passagens.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div>
                <h3 className="font-display text-lg">Resumo</h3>
                <p className="text-sm text-muted">{p.resumo}</p>
                <p className="text-xs text-muted mt-1">{formatDateTime(p.registrada_em)}</p>
              </div>
              {p.pendencias ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Pendências</p>
                  <p className="text-sm">{p.pendencias}</p>
                </div>
              ) : null}
              {p.recados ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Recados</p>
                  <p className="text-sm">{p.recados}</p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopy(`Resumo: ${p.resumo}\nPendências: ${p.pendencias}\nRecados: ${p.recados}`)
                  }
                >
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deletarPassagem(p.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

