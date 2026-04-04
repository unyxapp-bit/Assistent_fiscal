import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRealtimeTable } from '../../shared/hooks/useRealtimeTable';
import {
  atualizarPedido,
  deletarPedido,
  deletarPizza,
  atualizarPizza,
  criarPedido,
  criarPizza,
  fetchPedidos,
  fetchPizzas,
} from './api';
import type { PedidoPizza, Pizza } from './api';

export function usePizzaria() {
  const queryClient = useQueryClient();

  const pizzasQuery = useQuery({
    queryKey: ['pizzas'],
    queryFn: fetchPizzas,
  });

  const pedidosQuery = useQuery({
    queryKey: ['pedidos_pizza'],
    queryFn: fetchPedidos,
  });

  useRealtimeTable({
    table: 'pizzas',
    queryKey: ['pizzas'],
    enabled: true,
  });

  useRealtimeTable({
    table: 'pedidos_pizza',
    queryKey: ['pedidos_pizza'],
    enabled: true,
  });

  const createPizzaMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarPizza>[0]) => criarPizza(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzas'] });
    },
  });

  const updatePizzaMutation = useMutation({
    mutationFn: (params: { id: string; patch: Partial<Pizza> }) =>
      atualizarPizza(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzas'] });
    },
  });

  const deletePizzaMutation = useMutation({
    mutationFn: (id: string) => deletarPizza(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzas'] });
    },
  });

  const createPedidoMutation = useMutation({
    mutationFn: (params: Parameters<typeof criarPedido>[0]) => criarPedido(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos_pizza'] });
    },
  });

  const updatePedidoMutation = useMutation({
    mutationFn: (params: { id: string; patch: Partial<PedidoPizza> }) =>
      atualizarPedido(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos_pizza'] });
    },
  });

  const deletePedidoMutation = useMutation({
    mutationFn: (id: string) => deletarPedido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos_pizza'] });
    },
  });

  return {
    pizzas: pizzasQuery.data ?? [],
    pedidos: pedidosQuery.data ?? [],
    isLoading: pizzasQuery.isLoading || pedidosQuery.isLoading,
    criarPizza: createPizzaMutation.mutateAsync,
    atualizarPizza: updatePizzaMutation.mutateAsync,
    deletarPizza: deletePizzaMutation.mutateAsync,
    criarPedido: createPedidoMutation.mutateAsync,
    atualizarPedido: updatePedidoMutation.mutateAsync,
    deletarPedido: deletePedidoMutation.mutateAsync,
    creating: createPizzaMutation.isPending || createPedidoMutation.isPending,
    updating:
      updatePizzaMutation.isPending ||
      deletePizzaMutation.isPending ||
      updatePedidoMutation.isPending ||
      deletePedidoMutation.isPending,
  };
}
