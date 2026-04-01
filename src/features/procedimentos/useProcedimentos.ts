import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import {
  atualizarProcedimento,
  criarProcedimento,
  deletarProcedimento,
  fetchProcedimentos,
} from './api';
import type { Procedimento } from './api';

export function useProcedimentos() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['procedimentos', fiscalId],
    queryFn: () => fetchProcedimentos(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'procedimentos',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['procedimentos', fiscalId],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarProcedimento>[0]) => criarProcedimento(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos', fiscalId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; patch: Partial<Procedimento> }) =>
      atualizarProcedimento(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos', fiscalId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletarProcedimento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos', fiscalId] });
    },
  });

  return {
    ...query,
    criarProcedimento: createMutation.mutateAsync,
    atualizarProcedimento: updateMutation.mutateAsync,
    deletarProcedimento: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending || deleteMutation.isPending,
  };
}
