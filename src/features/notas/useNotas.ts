import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { atualizarNota, criarNota, deletarNota, fetchNotas } from './api';
import type { Nota } from '../../shared/types';

export function useNotas() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notas', fiscalId],
    queryFn: () => fetchNotas(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'notas',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['notas', fiscalId],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarNota>[0]) => criarNota(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas', fiscalId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; patch: Partial<Nota> }) =>
      atualizarNota(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas', fiscalId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletarNota(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas', fiscalId] });
    },
  });

  return {
    ...query,
    criarNota: createMutation.mutateAsync,
    atualizarNota: updateMutation.mutateAsync,
    deletarNota: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending || deleteMutation.isPending,
  };
}
