import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import {
  concluirExecucao,
  criarTemplate,
  deletarExecucao,
  deletarTemplate,
  fetchExecucoes,
  fetchTemplates,
  iniciarExecucao,
  atualizarExecucao,
  atualizarTemplate,
} from './api';

export function useChecklists() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['checklistTemplates', fiscalId],
    queryFn: () => fetchTemplates(fiscalId),
    enabled: !!fiscalId,
  });

  const execucoesQuery = useQuery({
    queryKey: ['checklistExecucoes', fiscalId],
    queryFn: () => fetchExecucoes(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'checklist_templates',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['checklistTemplates', fiscalId],
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'checklist_execucoes',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['checklistExecucoes', fiscalId],
    enabled: !!fiscalId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarTemplate>[0]) => criarTemplate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates', fiscalId] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (params: { id: string; patch: Parameters<typeof atualizarTemplate>[1] }) =>
      atualizarTemplate(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates', fiscalId] });
    },
  });

  const iniciarMutation = useMutation({
    mutationFn: (params: Parameters<typeof iniciarExecucao>[0]) => iniciarExecucao(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistExecucoes', fiscalId] });
    },
  });

  const concluirMutation = useMutation({
    mutationFn: concluirExecucao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistExecucoes', fiscalId] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: (params: { id: string; patch: Parameters<typeof atualizarExecucao>[1] }) =>
      atualizarExecucao(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistExecucoes', fiscalId] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => deletarTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates', fiscalId] });
    },
  });

  const deleteExecucaoMutation = useMutation({
    mutationFn: (id: string) => deletarExecucao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistExecucoes', fiscalId] });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    execucoes: execucoesQuery.data ?? [],
    isLoading: templatesQuery.isLoading || execucoesQuery.isLoading,
    criarTemplate: createTemplateMutation.mutateAsync,
    atualizarTemplate: updateTemplateMutation.mutateAsync,
    iniciarExecucao: iniciarMutation.mutateAsync,
    concluirExecucao: concluirMutation.mutateAsync,
    atualizarExecucao: atualizarMutation.mutateAsync,
    deletarTemplate: deleteTemplateMutation.mutateAsync,
    deletarExecucao: deleteExecucaoMutation.mutateAsync,
    creating: createTemplateMutation.isPending,
    updating:
      iniciarMutation.isPending ||
      concluirMutation.isPending ||
      atualizarMutation.isPending ||
      updateTemplateMutation.isPending ||
      deleteTemplateMutation.isPending ||
      deleteExecucaoMutation.isPending,
  };
}
