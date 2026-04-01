import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchFiscal, upsertFiscal } from './api';

export function useFiscal() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['fiscais', fiscalId],
    queryFn: () => fetchFiscal(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'fiscais',
    filter: fiscalId ? `id=eq.${fiscalId}` : undefined,
    queryKey: ['fiscais', fiscalId],
    enabled: !!fiscalId,
  });

  const upsertMutation = useMutation({
    mutationFn: upsertFiscal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscais', fiscalId] });
    },
  });

  return {
    fiscal: query.data ?? null,
    isLoading: query.isLoading,
    salvarFiscal: upsertMutation.mutateAsync,
    saving: upsertMutation.isPending,
  };
}
