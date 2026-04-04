export type PedidoItem = {
  pizza_id?: string | null;
  nome: string;
  tamanho?: string | null;
  quantidade: number;
  observacoes?: string | null;
};

const ITEMS_START = '[itens_pedido]';
const ITEMS_END = '[/itens_pedido]';

function normalizeItem(raw: unknown): PedidoItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  const nome =
    typeof candidate.nome === 'string' ? candidate.nome.trim() : '';
  if (!nome) return null;

  const quantidadeRaw =
    typeof candidate.quantidade === 'number'
      ? candidate.quantidade
      : Number(candidate.quantidade);
  const quantidade = Number.isFinite(quantidadeRaw)
    ? Math.max(1, Math.floor(quantidadeRaw))
    : 1;

  const pizzaId =
    typeof candidate.pizza_id === 'string' && candidate.pizza_id.trim()
      ? candidate.pizza_id.trim()
      : null;
  const tamanho =
    typeof candidate.tamanho === 'string' && candidate.tamanho.trim()
      ? candidate.tamanho.trim()
      : null;
  const observacoes =
    typeof candidate.observacoes === 'string' && candidate.observacoes.trim()
      ? candidate.observacoes.trim()
      : null;

  return {
    pizza_id: pizzaId,
    nome,
    tamanho,
    quantidade,
    observacoes,
  };
}

function normalizeItems(items: PedidoItem[]) {
  return items
    .map((item) => normalizeItem(item))
    .filter((item): item is PedidoItem => item !== null);
}

export function formatPedidoItem(item: PedidoItem) {
  const base = `${item.quantidade}x ${item.nome}${
    item.tamanho ? ` (${item.tamanho})` : ''
  }`;
  if (!item.observacoes) return base;
  return `${base} - ${item.observacoes}`;
}

export function getPedidoItensQuantidade(items: PedidoItem[]) {
  return items.reduce((acc, item) => acc + Math.max(item.quantidade, 0), 0);
}

export function buildPedidoItensPreview(items: PedidoItem[], limit = 3) {
  const lines = items.map((item) => formatPedidoItem(item));
  if (lines.length <= limit) return lines;
  return [
    ...lines.slice(0, limit),
    `+${lines.length - limit} item(ns)`,
  ];
}

export function serializePedidoObservacoes(params: {
  items: PedidoItem[];
  observacoesLivre?: string | null;
}) {
  const itemsNormalized = normalizeItems(params.items);
  const observacoesLivre = params.observacoesLivre?.trim() ?? '';

  if (itemsNormalized.length === 0) {
    return observacoesLivre || null;
  }

  const encoded = encodeURIComponent(JSON.stringify(itemsNormalized));
  const block = `${ITEMS_START}${encoded}${ITEMS_END}`;
  if (!observacoesLivre) return block;
  return `${block}\n${observacoesLivre}`;
}

export function parsePedidoObservacoes(observacoes?: string | null) {
  const text = observacoes ?? '';
  const startIdx = text.indexOf(ITEMS_START);
  const endIdx = text.indexOf(ITEMS_END, startIdx + ITEMS_START.length);

  if (startIdx < 0 || endIdx < 0) {
    return {
      items: [] as PedidoItem[],
      observacoesLivre: text.trim(),
    };
  }

  const encoded = text
    .slice(startIdx + ITEMS_START.length, endIdx)
    .trim();

  let items: PedidoItem[] = [];
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as unknown;
    if (Array.isArray(parsed)) {
      items = parsed
        .map((item) => normalizeItem(item))
        .filter((item): item is PedidoItem => item !== null);
    }
  } catch {
    items = [];
  }

  const before = text.slice(0, startIdx).trim();
  const after = text.slice(endIdx + ITEMS_END.length).trim();
  const observacoesLivre = [before, after]
    .filter(Boolean)
    .join('\n')
    .trim();

  return {
    items,
    observacoesLivre,
  };
}
