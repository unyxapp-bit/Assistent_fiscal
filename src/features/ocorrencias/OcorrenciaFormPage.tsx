import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useCaixas } from '../caixas/useCaixas';
import { useColaboradores } from '../colaboradores/useColaboradores';
import { useOcorrencias } from './useOcorrencias';
import { uploadAttachment } from '../../shared/lib/uploads';

const gravidades = ['baixa', 'media', 'alta'];

export default function OcorrenciaFormPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { criarOcorrencia, creating } = useOcorrencias();
  const { data: colaboradores } = useColaboradores();
  const { data: caixas } = useCaixas();
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [gravidade, setGravidade] = useState('media');
  const [colaboradorId, setColaboradorId] = useState('');
  const [caixaId, setCaixaId] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [arquivoFile, setArquivoFile] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tipo.trim() || !descricao.trim() || !fiscalId) return;

    setErro(null);
    setUploading(true);

    try {
      const foto = fotoFile
        ? await uploadAttachment({
            fiscalId,
            modulo: 'ocorrencias',
            kind: 'foto',
            file: fotoFile,
          })
        : null;

      const arquivo = arquivoFile
        ? await uploadAttachment({
            fiscalId,
            modulo: 'ocorrencias',
            kind: 'arquivo',
            file: arquivoFile,
          })
        : null;

      const ocorrencia = await criarOcorrencia({
        fiscalId,
        tipo: tipo.trim(),
        descricao: descricao.trim(),
        gravidade,
        colaboradorId: colaboradorId || null,
        caixaId: caixaId || null,
        fotoUrl: foto?.url ?? null,
        fotoNome: foto?.nome ?? null,
        arquivoUrl: arquivo?.url ?? null,
        arquivoNome: arquivo?.nome ?? null,
      });
      navigate(`/ocorrencias/${ocorrencia.id}`);
    } catch (error: any) {
      setErro(error?.message ?? 'Falha ao registrar ocorrencia com anexos.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Nova ocorrencia</h1>
          <p className="text-sm text-muted mt-2">Registre um evento critico do turno.</p>
        </div>
        <Link to="/ocorrencias">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
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
            placeholder="Descricao"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
            rows={3}
          />

          <label className="text-sm text-muted">
            Foto
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-xl border border-cloud px-4 py-2"
            />
          </label>
          <label className="text-sm text-muted">
            Arquivo
            <input
              type="file"
              onChange={(e) => setArquivoFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-xl border border-cloud px-4 py-2"
            />
          </label>

          {fotoFile ? (
            <div className="rounded-xl border border-cloud px-3 py-2 text-xs text-muted flex items-center justify-between gap-2">
              <span>Foto: {fotoFile.name}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setFotoFile(null)}>
                Remover
              </Button>
            </div>
          ) : null}
          {arquivoFile ? (
            <div className="rounded-xl border border-cloud px-3 py-2 text-xs text-muted flex items-center justify-between gap-2">
              <span>Arquivo: {arquivoFile.name}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setArquivoFile(null)}>
                Remover
              </Button>
            </div>
          ) : null}

          {erro ? <p className="text-sm text-danger md:col-span-2">{erro}</p> : null}

          <Button type="submit" disabled={creating || uploading} className="md:col-span-2">
            {uploading ? 'Enviando anexos...' : 'Registrar ocorrencia'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
