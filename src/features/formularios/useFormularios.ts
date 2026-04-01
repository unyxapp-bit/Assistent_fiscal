import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import {
  atualizarFormulario,
  criarFormulario,
  criarResposta,
  deletarFormulario,
  deletarResposta,
  fetchFormularios,
  fetchRespostas,
} from './api';

export function useFormularios() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const formulariosQuery = useQuery({
    queryKey: ['formularios', fiscalId],
    queryFn: () => fetchFormularios(fiscalId),
    enabled: !!fiscalId,
  });

  const respostasQuery = useQuery({
    queryKey: ['respostas_formulario', fiscalId],
    queryFn: () => fetchRespostas(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'formularios',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['formularios', fiscalId],
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'respostas_formulario',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['respostas_formulario', fiscalId],
    enabled: !!fiscalId,
  });

  const createFormularioMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarFormulario>[0]) => criarFormulario(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios', fiscalId] });
    },
  });

  const createRespostaMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarResposta>[0]) => criarResposta(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respostas_formulario', fiscalId] });
    },
  });

  const updateFormularioMutation = useMutation({
    mutationFn: (params: { id: string; patch: Parameters<typeof atualizarFormulario>[1] }) =>
      atualizarFormulario(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios', fiscalId] });
    },
  });

  const deleteFormularioMutation = useMutation({
    mutationFn: (id: string) => deletarFormulario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios', fiscalId] });
    },
  });

  const deleteRespostaMutation = useMutation({
    mutationFn: (id: string) => deletarResposta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respostas_formulario', fiscalId] });
    },
  });

  return {
    formularios: formulariosQuery.data ?? [],
    respostas: respostasQuery.data ?? [],
    isLoading: formulariosQuery.isLoading || respostasQuery.isLoading,
    criarFormulario: createFormularioMutation.mutateAsync,
    criarResposta: createRespostaMutation.mutateAsync,
    atualizarFormulario: updateFormularioMutation.mutateAsync,
    deletarFormulario: deleteFormularioMutation.mutateAsync,
    deletarResposta: deleteRespostaMutation.mutateAsync,
    creating:
      createFormularioMutation.isPending ||
      createRespostaMutation.isPending ||
      updateFormularioMutation.isPending ||
      deleteFormularioMutation.isPending ||
      deleteRespostaMutation.isPending,
  };
}
