import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { startOfTodayIso } from '../../shared/lib/dates';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchColaboradores } from '../colaboradores/api';
import { criarPausa, fetchPausas, finalizarPausa } from './api';

export function useCafe() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();
  const inicioDiaIso = useMemo(() => startOfTodayIso(), []);

  const colaboradoresQuery = useQuery({
    queryKey: ['colaboradores', fiscalId],
    queryFn: () => fetchColaboradores(fiscalId),
    enabled: !!fiscalId,
  });

  const pausasQuery = useQuery({
    queryKey: ['pausas_cafe', fiscalId, inicioDiaIso],
    queryFn: () => fetchPausas(fiscalId, inicioDiaIso),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'pausas_cafe',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['pausas_cafe', fiscalId, inicioDiaIso],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarPausa>[0]) => criarPausa(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pausas_cafe', fiscalId, inicioDiaIso],
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: finalizarPausa,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pausas_cafe', fiscalId, inicioDiaIso],
      });
    },
  });

  return {
    colaboradores: colaboradoresQuery.data ?? [],
    pausas: pausasQuery.data ?? [],
    isLoading: colaboradoresQuery.isLoading || pausasQuery.isLoading,
    criarPausa: createMutation.mutateAsync,
    finalizarPausa: finalizeMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: finalizeMutation.isPending,
  };
}
