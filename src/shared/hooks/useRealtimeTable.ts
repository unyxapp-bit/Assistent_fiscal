import { useEffect, useMemo } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { cleanupChannel, subscribeToTable } from '../../lib/supabase/realtime';

type RealtimeOptions = {
  table: string;
  queryKey: QueryKey;
  filter?: string;
  enabled?: boolean;
};

export function useRealtimeTable({
  table,
  queryKey,
  filter,
  enabled = true,
}: RealtimeOptions) {
  const queryClient = useQueryClient();
  const stableKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  useEffect(() => {
    if (!enabled) return undefined;
    const channel = subscribeToTable({
      table,
      filter,
      onChange: () => {
        queryClient.invalidateQueries({ queryKey: stableKey });
      },
    });

    return () => cleanupChannel(channel);
  }, [table, filter, enabled, queryClient, stableKey]);
}
