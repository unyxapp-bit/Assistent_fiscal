import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { todayIsoDate } from '../../shared/lib/dates';
import { useEscala } from './useEscala';

function extractTimes(line: string) {
  return line.match(/\d{1,2}:\d{2}/g) ?? [];
}

export default function ImportarEscalaPage() {
  const { colaboradores, createRegistro, creating } = useEscala();
  const navigate = useNavigate();
  const [data, setData] = useState(todayIsoDate());
  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState<
    Array<{
      linha: string;
      nome: string;
      colaboradorId?: string;
      times: string[];
    }>
  >([]);

  const colaboradorMap = useMemo(() => {
    return new Map(colaboradores.map((c) => [c.nome.toLowerCase(), c.id]));
  }, [colaboradores]);

  const handlePreview = () => {
    const lines = texto
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const mapped = lines.map((linha) => {
      const times = extractTimes(linha);
      const nome = linha.replace(/\d{1,2}:\d{2}/g, '').replace(/[-;|]/g, ' ').trim();
      const colaboradorId = colaboradorMap.get(nome.toLowerCase());
      return { linha, nome, colaboradorId, times };
    });
    setPreview(mapped);
  };

  const handleImport = async () => {
    const valid = preview.filter((p) => p.colaboradorId);
    for (const item of valid) {
      const [entrada, intervaloSaida, intervaloRetorno, saida] = item.times;
      await createRegistro({
        colaborador_id: item.colaboradorId!,
        data,
        entrada: entrada ?? null,
        intervalo_saida: intervaloSaida ?? null,
        intervalo_retorno: intervaloRetorno ?? null,
        saida: saida ?? null,
        observacao: null,
      });
    }
    navigate(`/escala/dia/${data}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestão</p>
          <h1 className="font-display text-3xl text-ink">Importar escala</h1>
          <p className="text-sm text-muted mt-2">
            Cole linhas com nome e horários. Ex: "Maria 08:00 12:00 13:00 17:00".
          </p>
        </div>
        <Link to="/escala">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-muted">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          />
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
          rows={6}
          placeholder="Cole aqui a escala..."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePreview}>
            Gerar prévia
          </Button>
          <Button disabled={creating || preview.length === 0} onClick={handleImport}>
            Importar registros
          </Button>
        </div>
      </Card>

      {preview.length > 0 ? (
        <Card>
          <h2 className="font-display text-lg mb-3">Prévia</h2>
          <div className="space-y-2 text-sm">
            {preview.map((p, index) => (
              <div key={`${p.linha}-${index}`} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.nome || 'Sem nome'}</p>
                  <p className="text-xs text-muted">Horários: {p.times.join(' · ')}</p>
                </div>
                <span className="text-xs">
                  {p.colaboradorId ? 'OK' : 'Colaborador não encontrado'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

