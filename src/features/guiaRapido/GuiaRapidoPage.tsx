import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useProcedimentos } from '../procedimentos/useProcedimentos';
import { useNotas } from '../notas/useNotas';

export default function GuiaRapidoPage() {
  const { data: procedimentos } = useProcedimentos();
  const { data: notas } = useNotas();

  const guias = (procedimentos ?? []).filter((p) => p.categoria === 'guia_rapido');
  const favoritos = (procedimentos ?? []).filter((p) => p.favorito);
  const importantes = (notas ?? []).filter((n) => n.importante && !n.concluida);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Guia Rápido</h1>
          <p className="text-sm text-muted mt-2">
            Situações críticas com passos rápidos e atalhos do turno.
          </p>
        </div>
        <Link to="/guia-rapido/novo">
          <Button>Novo guia</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-lg mb-3">Guias rápidos</h2>
          {guias.length === 0 ? (
            <p className="text-sm text-muted">Nenhum guia registrado.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted">
              {guias.slice(0, 6).map((proc) => (
                <li key={proc.id} className="rounded-lg border border-cloud px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span>{proc.titulo}</span>
                    <Link to={`/procedimentos/${proc.id}`} className="text-primary">
                      Abrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-lg mb-3">Procedimentos favoritos</h2>
          {favoritos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum procedimento favorito.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted">
              {favoritos.slice(0, 5).map((proc) => (
                <li key={proc.id} className="rounded-lg border border-cloud px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span>{proc.titulo}</span>
                    <Link to={`/procedimentos/${proc.id}`} className="text-primary">
                      Abrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-lg mb-3">Notas importantes</h2>
          {importantes.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma nota importante.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted">
              {importantes.slice(0, 5).map((nota) => (
                <li key={nota.id} className="rounded-lg border border-cloud px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span>{nota.titulo}</span>
                    <Link to={`/notas/${nota.id}`} className="text-primary">
                      Abrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-lg mb-3">Ações rápidas</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/procedimentos/novo">
              <Button variant="outline">Novo procedimento</Button>
            </Link>
            <Link to="/notas/nova">
              <Button variant="outline">Nova nota</Button>
            </Link>
            <Link to="/checklists">
              <Button variant="outline">Checklists</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


