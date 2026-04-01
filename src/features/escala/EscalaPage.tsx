import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDate, todayIsoDate } from '../../shared/lib/dates';
import { useEscala } from './useEscala';

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function EscalaPage() {
  const { registros, isLoading } = useEscala();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  const dias = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const registrosPorDia = useMemo(() => {
    return registros.reduce<Record<string, number>>((acc, registro) => {
      acc[registro.data] = (acc[registro.data] ?? 0) + 1;
      return acc;
    }, {});
  }, [registros]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestão</p>
          <h1 className="font-display text-3xl text-ink">Escala</h1>
          <p className="text-sm text-muted mt-2">
            Planejamento semanal e registros de ponto do time.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/escala/importar">
            <Button variant="outline">Importar escala</Button>
          </Link>
          <Link to={`/escala/dia/${todayIsoDate()}`}>
            <Button>Hoje</Button>
          </Link>
        </div>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          Semana anterior
        </Button>
        <p className="text-sm text-muted">
          Semana de {formatDate(weekStart.toISOString())}
        </p>
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Próxima semana
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dias.map((dia) => {
          const iso = dia.toISOString().slice(0, 10);
          const total = registrosPorDia[iso] ?? 0;
          return (
            <Card key={iso} className="flex flex-col gap-2">
              <h3 className="font-display text-lg">{formatDate(iso)}</h3>
              <p className="text-sm text-muted">Registros: {total}</p>
              <Link to={`/escala/dia/${iso}`}>
                <Button size="sm" variant="outline">
                  Abrir dia
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <Card>Carregando registros...</Card>
      ) : null}
    </div>
  );
}

