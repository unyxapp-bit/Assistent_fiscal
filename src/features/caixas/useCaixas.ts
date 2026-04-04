import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Caixa, TipoCaixa } from '../../shared/types';
import { useAuth } from '../auth/AuthProvider';
import { createCaixa, deleteCaixa, fetchCaixas, updateCaixa } from './api';

export function useCaixas() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['caixas', fiscalId],
    queryFn: () => fetchCaixas(fiscalId),
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { numero: number; tipo: TipoCaixa }) =>
      createCaixa({ ...data, fiscalId }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['caixas', fiscalId] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; patch: Partial<Caixa> }) =>
      updateCaixa(data.id, data.patch),
    onSuccess: () => client.invalidateQueries({ queryKey: ['caixas', fiscalId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCaixa(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['caixas', fiscalId] }),
  });

  return {
    ...query,
    createCaixa: createMutation.mutateAsync,
    updateCaixa: updateMutation.mutateAsync,
    deleteCaixa: deleteMutation.mutateAsync,
    updating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
