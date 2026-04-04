import { useEffect, useMemo, useState } from 'react';
import type { EventoTurno } from '../timeline/api';

type StoredState = {
  readIds: string[];
  removedIds: string[];
};

const EMPTY_STATE: StoredState = {
  readIds: [],
  removedIds: [],
};

function safeParseStored(raw: string | null): StoredState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const readIds = Array.isArray(parsed.readIds)
      ? parsed.readIds.filter((id): id is string => typeof id === 'string')
      : [];
    const removedIds = Array.isArray(parsed.removedIds)
      ? parsed.removedIds.filter((id): id is string => typeof id === 'string')
      : [];
    return { readIds, removedIds };
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(storageKey: string, state: StoredState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore storage failures to avoid blocking operational flow.
  }
}

export function useNotificacoesState(fiscalId: string, eventos: EventoTurno[]) {
  const storageKey = useMemo(
    () => `notificacoes_state:${fiscalId || 'anon'}`,
    [fiscalId]
  );

  const [state, setState] = useState<StoredState>(() => {
    if (typeof window === 'undefined') return EMPTY_STATE;
    return safeParseStored(window.localStorage.getItem(storageKey));
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setState(safeParseStored(window.localStorage.getItem(storageKey)));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveState(storageKey, state);
  }, [storageKey, state]);

  useEffect(() => {
    if (eventos.length === 0) return;
    const validIds = new Set(eventos.map((evento) => evento.id));
    setState((prev) => {
      const readIds = prev.readIds.filter((id) => validIds.has(id));
      const removedIds = prev.removedIds.filter((id) => validIds.has(id));
      if (
        readIds.length === prev.readIds.length &&
        removedIds.length === prev.removedIds.length
      ) {
        return prev;
      }
      return { readIds, removedIds };
    });
  }, [eventos]);

  const readSet = useMemo(() => new Set(state.readIds), [state.readIds]);
  const removedSet = useMemo(
    () => new Set(state.removedIds),
    [state.removedIds]
  );

  const eventosVisiveis = useMemo(
    () => eventos.filter((evento) => !removedSet.has(evento.id)),
    [eventos, removedSet]
  );

  const unreadCount = useMemo(
    () => eventosVisiveis.filter((evento) => !readSet.has(evento.id)).length,
    [eventosVisiveis, readSet]
  );

  const markAsRead = (id: string) => {
    setState((prev) => {
      if (prev.readIds.includes(id)) return prev;
      return { ...prev, readIds: [...prev.readIds, id] };
    });
  };

  const markAsUnread = (id: string) => {
    setState((prev) => ({
      ...prev,
      readIds: prev.readIds.filter((currentId) => currentId !== id),
    }));
  };

  const markAllAsRead = () => {
    const visibleIds = eventosVisiveis.map((evento) => evento.id);
    setState((prev) => ({
      ...prev,
      readIds: Array.from(new Set([...prev.readIds, ...visibleIds])),
    }));
  };

  const removeNotificacao = (id: string) => {
    setState((prev) => {
      if (prev.removedIds.includes(id)) return prev;
      return { ...prev, removedIds: [...prev.removedIds, id] };
    });
  };

  const clearVisible = () => {
    const visibleIds = eventosVisiveis.map((evento) => evento.id);
    setState((prev) => ({
      ...prev,
      removedIds: Array.from(new Set([...prev.removedIds, ...visibleIds])),
    }));
  };

  return {
    readSet,
    eventosVisiveis,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotificacao,
    clearVisible,
  };
}
