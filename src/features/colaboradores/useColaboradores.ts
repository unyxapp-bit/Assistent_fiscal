import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { createColaborador, fetchColaboradores, updateColaborador } from './api';

export function useColaboradores() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['colaboradores', fiscalId],
    queryFn: () => fetchColaboradores(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'colaboradores',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['colaboradores', fiscalId],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof createColaborador>[1]) =>
      createColaborador(fiscalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores', fiscalId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores', fiscalId] });
    },
  });

  return {
    ...query,
    createColaborador: createMutation.mutateAsync,
    updateColaborador: updateMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
  };
}
