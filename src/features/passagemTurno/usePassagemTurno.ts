import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { criarPassagem, deletarPassagem, fetchPassagens } from './api';

export function usePassagemTurno() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['passagens_turno', fiscalId],
    queryFn: () => fetchPassagens(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'passagens_turno',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['passagens_turno', fiscalId],
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarPassagem>[0]) => criarPassagem(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passagens_turno', fiscalId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletarPassagem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passagens_turno', fiscalId] });
    },
  });

  return {
    ...query,
    criarPassagem: createMutation.mutateAsync,
    deletarPassagem: deleteMutation.mutateAsync,
    creating: createMutation.isPending || deleteMutation.isPending,
  };
}
