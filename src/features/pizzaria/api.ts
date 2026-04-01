import { supabase } from '../../lib/supabase/client';

export type Pizza = {
  id: string;
  nome: string;
  tamanho: string;
  ingredientes?: string | null;
  ativa: boolean;
};

export type PedidoPizza = {
  id: string;
  nome_cliente?: string | null;
  codigo_entrega?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  telefone?: string | null;
  referencia?: string | null;
  data_pedido: string;
  horario_pedido: string;
  observacoes?: string | null;
  status: string;
};

export async function fetchPizzas() {
  const { data, error } = await supabase
    .from('pizzas')
    .select('*')
    .order('tamanho')
    .order('nome');
  if (error) throw error;
  return (data ?? []) as Pizza[];
}

export async function criarPizza(params: {
  nome: string;
  tamanho: string;
  ingredientes?: string | null;
}) {
  const { data, error } = await supabase
    .from('pizzas')
    .insert({
      nome: params.nome,
      tamanho: params.tamanho,
      ingredientes: params.ingredientes ?? null,
      ativa: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Pizza;
}

export async function atualizarPizza(id: string, patch: Partial<Pizza>) {
  const { data, error } = await supabase
    .from('pizzas')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Pizza;
}

export async function fetchPedidos() {
  const { data, error } = await supabase
    .from('pedidos_pizza')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PedidoPizza[];
}

export async function criarPedido(params: {
  nome_cliente?: string | null;
  codigo_entrega?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  telefone?: string | null;
  referencia?: string | null;
  horario_pedido: string;
  observacoes?: string | null;
}) {
  const today = new Date();
  const dataPedido = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const { data, error } = await supabase
    .from('pedidos_pizza')
    .insert({
      nome_cliente: params.nome_cliente ?? null,
      codigo_entrega: params.codigo_entrega ?? null,
      endereco: params.endereco ?? null,
      bairro: params.bairro ?? null,
      telefone: params.telefone ?? null,
      referencia: params.referencia ?? null,
      data_pedido: dataPedido,
      horario_pedido: params.horario_pedido,
      observacoes: params.observacoes ?? null,
      status: 'aberto',
    })
    .select()
    .single();
  if (error) throw error;
  return data as PedidoPizza;
}

export async function atualizarPedido(id: string, patch: Partial<PedidoPizza>) {
  const { data, error } = await supabase
    .from('pedidos_pizza')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PedidoPizza;
}
