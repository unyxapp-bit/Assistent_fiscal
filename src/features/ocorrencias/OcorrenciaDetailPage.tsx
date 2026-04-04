import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { useCaixas } from '../caixas/useCaixas';
import { useColaboradores } from '../colaboradores/useColaboradores';
import { useOcorrencias } from './useOcorrencias';

const gravidades = ['baixa', 'media', 'alta'];

export default function OcorrenciaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, atualizarOcorrencia, deletarOcorrencia } = useOcorrencias();
  const { data: colaboradores } = useColaboradores();
  const { data: caixas } = useCaixas();

  const ocorrencia = (data ?? []).find((item) => item.id === id);
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [gravidade, setGravidade] = useState('media');
  const [colaboradorId, setColaboradorId] = useState('');
  const [caixaId, setCaixaId] = useState('');

  useEffect(() => {
    if (!ocorrencia) return;
    setTipo(ocorrencia.tipo ?? '');
    setDescricao(ocorrencia.descricao ?? '');
    setGravidade(ocorrencia.gravidade ?? 'media');
    setColaboradorId(ocorrencia.colaborador_id ?? '');
    setCaixaId(ocorrencia.caixa_id ?? '');
  }, [ocorrencia]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando ocorrência...</Card>
      </div>
    );
  }

  if (!ocorrencia) {
    return (
      <div className="space-y-6">
        <Card>Ocorrência não encontrada.</Card>
        <Button onClick={() => navigate('/ocorrencias')} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    await atualizarOcorrencia({
      id: ocorrencia.id,
      patch: {
        tipo: tipo.trim(),
        descricao: descricao.trim(),
        gravidade,
        colaborador_id: colaboradorId || null,
        caixa_id: caixaId || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Deseja excluir esta ocorrência?')) return;
    await deletarOcorrencia(ocorrencia.id);
    navigate('/ocorrencias');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Ocorrência</h1>
          <p className="text-sm text-muted mt-2">
            Registrada em {formatDateTime(ocorrencia.registrada_em)}
          </p>
        </div>
        <Link to="/ocorrencias">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Tipo"
          className="rounded-xl border border-cloud px-4 py-2"
        />
        <select
          value={gravidade}
          onChange={(e) => setGravidade(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          {gravidades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={colaboradorId}
          onChange={(e) => setColaboradorId(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          <option value="">Colaborador (opcional)</option>
          {(colaboradores ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <select
          value={caixaId}
          onChange={(e) => setCaixaId(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          <option value="">Caixa (opcional)</option>
          {(caixas ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              Caixa {c.numero}
            </option>
          ))}
        </select>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          rows={4}
        />
        {ocorrencia.foto_url ? (
          <div className="text-sm text-muted md:col-span-2">
            Foto:{' '}
            <a className="text-primary" href={ocorrencia.foto_url} target="_blank" rel="noreferrer">
              {ocorrencia.foto_nome || ocorrencia.foto_url}
            </a>
          </div>
        ) : null}
        {ocorrencia.arquivo_url ? (
          <div className="text-sm text-muted md:col-span-2">
            Arquivo:{' '}
            <a
              className="text-primary"
              href={ocorrencia.arquivo_url}
              target="_blank"
              rel="noreferrer"
            >
              {ocorrencia.arquivo_nome || ocorrencia.arquivo_url}
            </a>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button onClick={handleSave} variant="outline">
            Salvar alterações
          </Button>
          {!ocorrencia.resolvida ? (
            <Button
              onClick={() =>
                atualizarOcorrencia({
                  id: ocorrencia.id,
                  patch: { resolvida: true, resolvida_em: new Date().toISOString() },
                })
              }
              variant="outline"
            >
              Marcar como resolvida
            </Button>
          ) : null}
          <Button onClick={handleDelete} variant="ghost">
            Excluir ocorrência
          </Button>
        </div>
      </Card>
    </div>
  );
}

