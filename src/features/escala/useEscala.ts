import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchColaboradores } from '../colaboradores/api';
import {
  createRegistroPonto,
  deleteRegistroPonto,
  fetchRegistrosPorColaboradores,
  fetchTurnosEscalaPorColaboradores,
  updateRegistroPonto,
} from './api';

export function useEscala() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';
  const queryClient = useQueryClient();

  const colaboradoresQuery = useQuery({
    queryKey: ['colaboradores', fiscalId],
    queryFn: () => fetchColaboradores(fiscalId),
    enabled: !!fiscalId,
  });

  const colaboradorIds = useMemo(
    () => (colaboradoresQuery.data ?? []).map((c) => c.id),
    [colaboradoresQuery.data]
  );

  const registrosQuery = useQuery({
    queryKey: ['registros_ponto', colaboradorIds],
    queryFn: () => fetchRegistrosPorColaboradores(colaboradorIds),
    enabled: colaboradorIds.length > 0,
  });

  const turnosQuery = useQuery({
    queryKey: ['turnos_escala', colaboradorIds],
    queryFn: () => fetchTurnosEscalaPorColaboradores(colaboradorIds),
    enabled: colaboradorIds.length > 0,
  });

  useRealtimeTable({
    table: 'registros_ponto',
    queryKey: ['registros_ponto', colaboradorIds],
    enabled: colaboradorIds.length > 0,
  });

  useRealtimeTable({
    table: 'turnos_escala',
    queryKey: ['turnos_escala', colaboradorIds],
    enabled: colaboradorIds.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: createRegistroPonto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros_ponto', colaboradorIds] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRegistroPonto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros_ponto', colaboradorIds] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegistroPonto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros_ponto', colaboradorIds] });
    },
  });

  return {
    colaboradores: colaboradoresQuery.data ?? [],
    registros: registrosQuery.data ?? [],
    turnos: turnosQuery.data ?? [],
    isLoading:
      colaboradoresQuery.isLoading || registrosQuery.isLoading || turnosQuery.isLoading,
    createRegistro: createMutation.mutateAsync,
    updateRegistro: updateMutation.mutateAsync,
    deleteRegistro: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
  };
}
