import { supabase } from '../../lib/supabase/client';

const DEFAULT_BUCKET = 'anexos';
const SUPABASE_STORAGE_BUCKET = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined)?.trim();

function safeBucket() {
  return SUPABASE_STORAGE_BUCKET && SUPABASE_STORAGE_BUCKET.length > 0
    ? SUPABASE_STORAGE_BUCKET
    : DEFAULT_BUCKET;
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'arquivo';
}

function buildUploadPath(params: {
  fiscalId: string;
  modulo: string;
  kind: 'foto' | 'arquivo';
  fileName: string;
}) {
  const timestamp = Date.now();
  const safeName = sanitizeFileName(params.fileName);
  return `${params.fiscalId}/${params.modulo}/${params.kind}/${timestamp}_${safeName}`;
}

export type UploadedAsset = {
  url: string;
  nome: string;
  path: string;
};

export async function uploadAttachment(params: {
  fiscalId: string;
  modulo: string;
  kind: 'foto' | 'arquivo';
  file: File;
}): Promise<UploadedAsset> {
  const bucket = safeBucket();
  const path = buildUploadPath({
    fiscalId: params.fiscalId,
    modulo: params.modulo,
    kind: params.kind,
    fileName: params.file.name,
  });

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, params.file, {
    cacheControl: '3600',
    upsert: false,
    contentType: params.file.type || undefined,
  });

  if (uploadError) {
    throw new Error(`Falha no upload do anexo (${params.kind}): ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Upload concluido, mas nao foi possivel obter URL publica do arquivo.');
  }

  return {
    url: data.publicUrl,
    nome: params.file.name,
    path,
  };
}
