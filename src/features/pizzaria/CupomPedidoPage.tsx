import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDateTime } from '../../shared/lib/dates';
import { usePizzaria } from './usePizzaria';
import { useCupomConfig } from '../cupom/useCupomConfig';
import { formatPedidoItem, parsePedidoObservacoes } from './pedidoItens';

function getFirstConfigText(
  config: Record<string, unknown> | null,
  keys: string[],
  fallback = ''
) {
  if (!config) return fallback;
  for (const key of keys) {
    const value = config[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

export default function CupomPedidoPage() {
  const { id } = useParams();
  const { pedidos, isLoading } = usePizzaria();
  const { config } = useCupomConfig();

  const pedido = pedidos.find((item) => item.id === id);
  const parsed = parsePedidoObservacoes(pedido?.observacoes);

  const nomeLoja = getFirstConfigText(
    config,
    ['nome_loja', 'loja', 'empresa_nome'],
    'Pizzaria'
  );
  const enderecoLoja = getFirstConfigText(config, ['endereco_loja', 'endereco']);
  const telefoneLoja = getFirstConfigText(config, ['telefone_loja', 'telefone']);
  const rodape = getFirstConfigText(
    config,
    ['mensagem_rodape', 'cupom_rodape', 'rodape'],
    'Obrigado pela preferencia.'
  );

  const cupomText = useMemo(() => {
    if (!pedido) return '';

    const linhasItens =
      parsed.items.length > 0
        ? parsed.items.map((item) => formatPedidoItem(item))
        : ['Sem itens detalhados'];

    const linhas = [
      nomeLoja,
      enderecoLoja || '-',
      telefoneLoja ? `Tel: ${telefoneLoja}` : '',
      '----------------------------------------',
      `Pedido: ${pedido.codigo_entrega || pedido.id}`,
      `Data: ${pedido.data_pedido || '-'}`,
      `Hora: ${pedido.horario_pedido || '-'}`,
      `Cliente: ${pedido.nome_cliente || '-'}`,
      `Telefone: ${pedido.telefone || '-'}`,
      `Endereco: ${pedido.endereco || '-'}`,
      `Bairro: ${pedido.bairro || '-'}`,
      `Referencia: ${pedido.referencia || '-'}`,
      `Status: ${pedido.status || '-'}`,
      '----------------------------------------',
      'Itens:',
      ...linhasItens,
      '----------------------------------------',
      `Observacoes: ${parsed.observacoesLivre || '-'}`,
      '----------------------------------------',
      rodape,
    ].filter(Boolean);
    return linhas.join('\n');
  }, [
    pedido,
    parsed.items,
    parsed.observacoesLivre,
    nomeLoja,
    enderecoLoja,
    telefoneLoja,
    rodape,
  ]);

  const handleCopy = async () => {
    if (!cupomText) return;
    await navigator.clipboard.writeText(cupomText);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>Carregando cupom...</Card>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="space-y-6">
        <Card>Pedido nao encontrado.</Card>
        <Link to="/pizzaria/pedidos">
          <Button variant="outline">Voltar para pedidos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style>
        {`@media print {
          .no-print { display: none !important; }
          .cupom-paper { box-shadow: none !important; border: 0 !important; margin: 0 !important; padding: 0 !important; }
          body { background: #fff !important; }
        }`}
      </style>

      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pizzaria</p>
          <h1 className="font-display text-3xl text-primary">Cupom do pedido</h1>
          <p className="text-sm text-muted mt-2">
            Pedido {pedido.codigo_entrega || pedido.id} |{' '}
            {formatDateTime(`${pedido.data_pedido}T${pedido.horario_pedido}`)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/pizzaria/pedidos">
            <Button variant="outline">Voltar</Button>
          </Link>
          <Button variant="outline" onClick={handleCopy}>
            Copiar texto
          </Button>
          <Button onClick={handlePrint}>Imprimir</Button>
        </div>
      </div>

      <Card className="cupom-paper max-w-2xl mx-auto">
        <pre className="whitespace-pre-wrap text-sm text-ink leading-6">
          {cupomText}
        </pre>
      </Card>
    </div>
  );
}
