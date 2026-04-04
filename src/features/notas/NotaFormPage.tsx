import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import type { Nota } from '../../shared/types';
import { useAuth } from '../auth/AuthProvider';
import { useNotas } from './useNotas';
import { uploadAttachment } from '../../shared/lib/uploads';

const tipos: Nota['tipo'][] = ['anotacao', 'tarefa', 'lembrete'];

export default function NotaFormPage() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const navigate = useNavigate();
  const { criarNota, creating } = useNotas();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<Nota['tipo']>('anotacao');
  const [dataLembrete, setDataLembrete] = useState('');
  const [importante, setImportante] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [arquivoFile, setArquivoFile] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim() || !fiscalId) return;

    setErro(null);
    setUploading(true);

    try {
      const foto = fotoFile
        ? await uploadAttachment({
            fiscalId,
            modulo: 'notas',
            kind: 'foto',
            file: fotoFile,
          })
        : null;

      const arquivo = arquivoFile
        ? await uploadAttachment({
            fiscalId,
            modulo: 'notas',
            kind: 'arquivo',
            file: arquivoFile,
          })
        : null;

      const nota = await criarNota({
        fiscalId,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        tipo,
        dataLembrete: dataLembrete ? new Date(dataLembrete).toISOString() : null,
        importante,
        lembreteAtivo: tipo === 'lembrete',
        fotoUrl: foto?.url ?? null,
        fotoNome: foto?.nome ?? null,
        arquivoUrl: arquivo?.url ?? null,
        arquivoNome: arquivo?.nome ?? null,
      });
      navigate(`/notas/${nota.id}`);
    } catch (error: any) {
      setErro(error?.message ?? 'Falha ao salvar nota com anexos.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Operacional</p>
          <h1 className="font-display text-3xl text-primary">Nova nota</h1>
          <p className="text-sm text-muted mt-2">Registre uma nova anotacao, tarefa ou lembrete.</p>
        </div>
        <Link to="/notas">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleCreate}>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Titulo"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Nota['tipo'])}
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
              checked={importante}
              onChange={(e) => setImportante(e.target.checked)}
            />
            Importante
          </label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Conteudo"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
            rows={3}
          />
          <input
            type="datetime-local"
            value={dataLembrete}
            onChange={(e) => setDataLembrete(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
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
          </div>

          {erro ? <p className="text-sm text-danger md:col-span-4">{erro}</p> : null}

          <Button type="submit" disabled={creating || uploading} className="md:col-span-4">
            {uploading ? 'Enviando anexos...' : 'Salvar nota'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
