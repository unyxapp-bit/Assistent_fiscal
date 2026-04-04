import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { startOfTodayIso } from '../../shared/lib/dates';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchColaboradores } from '../colaboradores/api';
import {
  criarPausa,
  fetchPausas,
  finalizarPausa,
  limparHistoricoPausas,
  removerPausa,
} from './api';

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

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['pausas_cafe', fiscalId, inicioDiaIso],
    });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarPausa>[0]) => criarPausa(params),
    onSuccess: invalidate,
  });

  const finalizeMutation = useMutation({
    mutationFn: (params: Parameters<typeof finalizarPausa>[0]) => finalizarPausa(params),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: removerPausa,
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: () => limparHistoricoPausas({ fiscalId, inicioDiaIso }),
    onSuccess: invalidate,
  });

  return {
    fiscalId,
    inicioDiaIso,
    colaboradores: colaboradoresQuery.data ?? [],
    pausas: pausasQuery.data ?? [],
    isLoading: colaboradoresQuery.isLoading || pausasQuery.isLoading,
    criarPausa: createMutation.mutateAsync,
    finalizarPausa: finalizeMutation.mutateAsync,
    removerPausa: removeMutation.mutateAsync,
    limparHistorico: clearMutation.mutateAsync,
    creating: createMutation.isPending,
    updating:
      finalizeMutation.isPending || removeMutation.isPending || clearMutation.isPending,
  };
}
