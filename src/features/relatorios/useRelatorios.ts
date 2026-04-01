import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import { fetchRelatorios } from './api';

export function useRelatorios() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';

  const query = useQuery({
    queryKey: ['relatorios_dia', fiscalId],
    queryFn: () => fetchRelatorios(fiscalId),
    enabled: !!fiscalId,
  });

  useRealtimeTable({
    table: 'relatorios_dia',
    filter: fiscalId ? `fiscal_id=eq.${fiscalId}` : undefined,
    queryKey: ['relatorios_dia', fiscalId],
    enabled: !!fiscalId,
  });

  return query;
}
