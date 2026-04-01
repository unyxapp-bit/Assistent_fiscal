import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { atualizarEntrega, criarEntrega, deletarEntrega, fetchEntregas } from './api';
import type { Entrega } from '../../shared/types';

export function useEntregas() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['entregas', fiscalId],
    queryFn: () => fetchEntregas(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'entregas',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['entregas', fiscalId],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarEntrega>[0]) => criarEntrega(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas', fiscalId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; patch: Partial<Entrega> }) =>
      atualizarEntrega(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas', fiscalId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletarEntrega(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas', fiscalId] });
    },
  });

  return {
    ...query,
    criarEntrega: createMutation.mutateAsync,
    atualizarEntrega: updateMutation.mutateAsync,
    deletarEntrega: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending || deleteMutation.isPending,
  };
}
