import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useColaboradores } from '../colaboradores/useColaboradores';
import { useOcorrencias } from './useOcorrencias';

const gravidades = ['todas', 'baixa', 'media', 'alta'];

export default function OcorrenciasPage() {
  const { data, isLoading, atualizarOcorrencia } = useOcorrencias();
  const { data: colaboradores } = useColaboradores();
  const [gravidadeFiltro, setGravidadeFiltro] = useState('todas');
  const [mostrarResolvidas, setMostrarResolvidas] = useState(true);
  const [busca, setBusca] = useState('');
  const ocorrencias = data ?? [];

  const colaboradorMap = useMemo(
    () => new Map((colaboradores ?? []).map((c) => [c.id, c.nome])),
    [colaboradores]
  );

  const filtered = useMemo(() => {
    return ocorrencias.filter((oc) => {
      if (!mostrarResolvidas && oc.resolvida) return false;
      if (gravidadeFiltro !== 'todas' && oc.gravidade !== gravidadeFiltro) return false;
      if (busca.trim()) {
        const term = busca.trim().toLowerCase();
        const stack = `${oc.tipo} ${oc.descricao} ${oc.colaborador_nome ?? ''}`.toLowerCase();
        if (!stack.includes(term)) return false;
      }
      return true;
    });
  }, [ocorrencias, mostrarResolvidas, gravidadeFiltro, busca]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Ocorrências</h1>
          <p className="text-sm text-muted mt-2">
            Registros críticos do turno com acompanhamento de resolução.
          </p>
        </div>
        <Link to="/ocorrencias/nova">
          <Button>Nova ocorrência</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={gravidadeFiltro}
          onChange={(e) => setGravidadeFiltro(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {gravidades.map((g) => (
            <option key={g} value={g}>
              {g === 'todas' ? 'Todas as gravidades' : g}
            </option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por tipo, descrição ou colaborador"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={mostrarResolvidas}
            onChange={(e) => setMostrarResolvidas(e.target.checked)}
          />
          Mostrar resolvidas
        </label>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando ocorrências...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhuma ocorrência encontrada.</Card>
        ) : (
          filtered.map((oc) => (
            <Card key={oc.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">{oc.tipo}</h3>
                  <p className="text-sm text-muted">{oc.descricao}</p>
                  <p className="text-xs text-muted">{formatDateTime(oc.registrada_em)}</p>
                  {oc.colaborador_id ? (
                    <p className="text-xs text-muted">
                      Colaborador: {colaboradorMap.get(oc.colaborador_id) ?? oc.colaborador_id}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                  {oc.resolvida ? 'Resolvida' : 'Aberta'} · {oc.gravidade}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/ocorrencias/${oc.id}`}>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </Link>
                {!oc.resolvida ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      atualizarOcorrencia({
                        id: oc.id,
                        patch: { resolvida: true, resolvida_em: new Date().toISOString() },
                      })
                    }
                  >
                    Marcar como resolvida
                  </Button>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


