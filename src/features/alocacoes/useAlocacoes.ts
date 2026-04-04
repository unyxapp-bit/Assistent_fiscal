import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import {
  createAlocacao,
  fetchAlocacoesAtivas,
  liberarAlocacao,
  realocarAlocacao,
  trocarCaixasAlocacoes,
} from './api';

export function useAlocacoes() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['alocacoes', fiscalId],
    queryFn: () => fetchAlocacoesAtivas(fiscalId),
    enabled: !!fiscalId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { colaboradorId: string; caixaId: string; observacoes?: string }) =>
      createAlocacao({ fiscalId, ...data }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alocacoes', fiscalId] }),
  });

  const liberarMutation = useMutation({
    mutationFn: (data: { alocacaoId: string; motivo: string }) => liberarAlocacao(data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alocacoes', fiscalId] }),
  });

  const realocarMutation = useMutation({
    mutationFn: (data: {
      alocacaoId: string;
      caixaId: string;
      observacoes?: string;
    }) => realocarAlocacao(data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alocacoes', fiscalId] }),
  });

  const trocarMutation = useMutation({
    mutationFn: (data: {
      alocacaoOrigemId: string;
      caixaOrigemId: string;
      alocacaoDestinoId: string;
      caixaDestinoId: string;
      motivo?: string;
    }) => trocarCaixasAlocacoes(data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alocacoes', fiscalId] }),
  });

  return {
    ...query,
    createAlocacao: createMutation.mutateAsync,
    liberarAlocacao: liberarMutation.mutateAsync,
    realocarAlocacao: realocarMutation.mutateAsync,
    trocarCaixas: trocarMutation.mutateAsync,
    updating:
      createMutation.isPending ||
      liberarMutation.isPending ||
      realocarMutation.isPending ||
      trocarMutation.isPending,
  };
}
