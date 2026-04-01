import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchEventos } from './api';

export function useTimeline() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';

  const query = useQuery({
    queryKey: ['eventos_turno', fiscalId],
    queryFn: () => fetchEventos(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'eventos_turno',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['eventos_turno', fiscalId],
    enabled: !!fiscalId,
  });

  return query;
}
