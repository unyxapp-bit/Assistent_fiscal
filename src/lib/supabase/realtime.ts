import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './client';

type ChangeHandler = () => void;

type SubscribeOptions = {
  table: string;
  filter?: string;
  onChange: ChangeHandler;
};

export function subscribeToTable({ table, filter, onChange }: SubscribeOptions): RealtimeChannel {
  const channel = supabase
    .channel(`rt:${table}:${filter ?? 'all'}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      () => onChange()
    )
    .subscribe();

  return channel;
}

export function cleanupChannel(channel?: RealtimeChannel) {
  if (!channel) return;
  supabase.removeChannel(channel);
}
