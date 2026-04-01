import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchCupomConfig, upsertCupomConfig } from './api';

export function useCupomConfig() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['cupom_configuracoes', fiscalId],
    queryFn: () => fetchCupomConfig(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'cupom_configuracoes',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['cupom_configuracoes', fiscalId],
    enabled: !!fiscalId,
  });

  const saveMutation = useMutation({
    mutationFn: (config: Parameters<typeof upsertCupomConfig>[1]) =>
      upsertCupomConfig(fiscalId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupom_configuracoes', fiscalId] });
    },
  });

  return {
    config: query.data ?? null,
    isLoading: query.isLoading,
    salvar: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
  };
}
