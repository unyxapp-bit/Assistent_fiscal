import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { atualizarOcorrencia, criarOcorrencia, deletarOcorrencia, fetchOcorrencias } from './api';
import type { Ocorrencia } from '../../shared/types';

export function useOcorrencias() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ocorrencias', fiscalId],
    queryFn: () => fetchOcorrencias(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'ocorrencias',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['ocorrencias', fiscalId],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarOcorrencia>[0]) => criarOcorrencia(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias', fiscalId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; patch: Partial<Ocorrencia> }) =>
      atualizarOcorrencia(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias', fiscalId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletarOcorrencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias', fiscalId] });
    },
  });

  return {
    ...query,
    criarOcorrencia: createMutation.mutateAsync,
    atualizarOcorrencia: updateMutation.mutateAsync,
    deletarOcorrencia: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending || deleteMutation.isPending,
  };
}
