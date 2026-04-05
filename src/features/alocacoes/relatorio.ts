import { formatDate, formatDateTime, formatTime } from '../../shared/lib/dates';
import type { Alocacao, Caixa, Colaborador } from '../../shared/types';

export type LinhaRelatorioAlocacao = {
  caixa: string;
  colaborador: string;
  entrada: string;
  saida: string;
  status: string;
  observacoes: string;
};

function escapeHtml(text: string) {
  return text
    .split('&')
    .join('&amp;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')
    .split('"')
    .join('&quot;')
    .split("'")
    .join('&#39;');
}

function statusLabel(status?: string | null) {
  if (status === 'ativo') return 'Ativo';
  if (status === 'finalizado') return 'Finalizado';
  return status || '-';
}

function caixaLabel(caixa?: Caixa) {
  if (!caixa) return 'Caixa n/d';
  return `Caixa ${caixa.numero} (${caixa.tipo})`;
}

export function buildLinhasRelatorioAlocacao(params: {
  alocacoes: Alocacao[];
  colaboradoresMap: Map<string, Colaborador>;
  caixasMap: Map<string, Caixa>;
}) {
  return params.alocacoes.map((alocacao) => {
    const colaborador = params.colaboradoresMap.get(alocacao.colaborador_id);
    const caixa = params.caixasMap.get(alocacao.caixa_id);

    return {
      caixa: caixaLabel(caixa),
      colaborador: colaborador?.nome ?? 'Colaborador',
      entrada: formatTime(alocacao.alocado_em),
      saida: formatTime(alocacao.liberado_em ?? null),
      status: statusLabel(alocacao.status),
      observacoes: alocacao.observacoes ?? '',
    } satisfies LinhaRelatorioAlocacao;
  });
}

export function exportarCsvRelatorioAlocacao(params: {
  data: string;
  linhas: LinhaRelatorioAlocacao[];
}) {
  const header =
    'data,caixa,colaborador,entrada,saida,status,observacoes';
  const rows = params.linhas.map((linha) =>
    [
      params.data,
      linha.caixa,
      linha.colaborador,
      linha.entrada,
      linha.saida,
      linha.status,
      linha.observacoes,
    ]
      .map((value) => `"${String(value).split('"').join('""')}"`)
      .join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `alocacoes_${params.data}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function imprimirRelatorioAlocacao(params: {
  data: string;
  turno?: string;
  linhas: LinhaRelatorioAlocacao[];
}) {
  const rowsHtml = params.linhas
    .map(
      (linha) => `
        <tr>
          <td>${escapeHtml(linha.caixa)}</td>
          <td>${escapeHtml(linha.colaborador)}</td>
          <td>${escapeHtml(linha.entrada)}</td>
          <td>${escapeHtml(linha.saida)}</td>
          <td>${escapeHtml(linha.status)}</td>
          <td>${escapeHtml(linha.observacoes)}</td>
        </tr>
      `
    )
    .join('');

  const popup = window.open('', '_blank', 'width=1100,height=800');
  if (!popup) return false;

  const agora = formatDateTime(new Date().toISOString());
  popup.document.write(`
    <html>
      <head>
        <title>Relatorio de Alocacoes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          h1 { margin: 0 0 8px 0; font-size: 20px; }
          p { margin: 4px 0; font-size: 12px; color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Relatorio de Alocacoes</h1>
        <p>Data: ${escapeHtml(formatDate(params.data))}</p>
        <p>Turno: ${escapeHtml(params.turno ?? '-')}</p>
        <p>Gerado em: ${escapeHtml(agora)}</p>
        <table>
          <thead>
            <tr>
              <th>Caixa</th>
              <th>Colaborador</th>
              <th>Entrada</th>
              <th>Saida</th>
              <th>Status</th>
              <th>Observacoes</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="6">Sem dados</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}
