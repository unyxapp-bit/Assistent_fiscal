import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { fetchCaixas } from '../caixas/api';
import { fetchColaboradores } from '../colaboradores/api';
import { fetchAlocacoesAtivas } from '../alocacoes/api';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import {
  addOutroSetor,
  addPlantao,
  fetchOutroSetorHoje,
  fetchPlantaoHoje,
  removeOutroSetor,
  removePlantao,
} from './api';

export function useMapa() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const caixasQuery = useQuery({
    queryKey: ['caixas', fiscalId],
    queryFn: () => fetchCaixas(fiscalId),
    enabled: !!fiscalId,
  });

  const colaboradoresQuery = useQuery({
    queryKey: ['colaboradores', fiscalId],
    queryFn: () => fetchColaboradores(fiscalId),
    enabled: !!fiscalId,
  });

  const alocacoesQuery = useQuery({
    queryKey: ['alocacoes', fiscalId],
    queryFn: () => fetchAlocacoesAtivas(fiscalId),
    enabled: !!fiscalId,
  });

  const plantaoQuery = useQuery({
    queryKey: ['pacote_plantao', fiscalId],
    queryFn: () => fetchPlantaoHoje(fiscalId),
    enabled: !!fiscalId,
  });

  const outroSetorQuery = useQuery({
    queryKey: ['outro_setor', fiscalId],
    queryFn: () => fetchOutroSetorHoje(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'alocacoes',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['alocacoes', fiscalId],
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'caixas',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['caixas', fiscalId],
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'pacote_plantao',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['pacote_plantao', fiscalId],
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'outro_setor',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['outro_setor', fiscalId],
    enabled: !!fiscalId,
  });

  const addPlantaoMutation = useMutation({
    mutationFn: (colaboradorId: string) => addPlantao(fiscalId, colaboradorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacote_plantao', fiscalId] });
    },
  });

  const removePlantaoMutation = useMutation({
    mutationFn: removePlantao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacote_plantao', fiscalId] });
    },
  });

  const addOutroSetorMutation = useMutation({
    mutationFn: (params: { colaboradorId: string; setor: string }) =>
      addOutroSetor(fiscalId, params.colaboradorId, params.setor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outro_setor', fiscalId] });
    },
  });

  const removeOutroSetorMutation = useMutation({
    mutationFn: removeOutroSetor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outro_setor', fiscalId] });
    },
  });

  return {
    caixas: caixasQuery.data ?? [],
    colaboradores: colaboradoresQuery.data ?? [],
    alocacoes: alocacoesQuery.data ?? [],
    plantao: plantaoQuery.data ?? [],
    outroSetor: outroSetorQuery.data ?? [],
    isLoading:
      caixasQuery.isLoading ||
      colaboradoresQuery.isLoading ||
      alocacoesQuery.isLoading,
    addPlantao: addPlantaoMutation.mutateAsync,
    removePlantao: removePlantaoMutation.mutateAsync,
    addOutroSetor: addOutroSetorMutation.mutateAsync,
    removeOutroSetor: removeOutroSetorMutation.mutateAsync,
    updating:
      addPlantaoMutation.isPending ||
      removePlantaoMutation.isPending ||
      addOutroSetorMutation.isPending ||
      removeOutroSetorMutation.isPending,
  };
}
