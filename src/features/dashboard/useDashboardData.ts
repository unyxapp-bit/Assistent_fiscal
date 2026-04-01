import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import {
  fetchAlocacoesAtivas,
  fetchCaixas,
  fetchChecklistExecucoes,
  fetchChecklistTemplates,
  fetchColaboradores,
  fetchEntregas,
  fetchNotas,
  fetchOcorrencias,
  fetchPausasHoje,
} from './api';
import type {
  ChecklistExecucao,
  ChecklistTemplate,
  PausaCafe,
} from '../../shared/types';

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseIso(value?: string | null) {
  return value ? new Date(value) : null;
}

function isWithinWindow(template: ChecklistTemplate, now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  switch (template.periodizacao) {
    case 'abertura':
      return minutes >= 6 * 60 && minutes <= 12 * 60;
    case 'fechamento':
      return minutes >= 17 * 60 && minutes <= 23 * 60 + 59;
    case 'horario_especifico': {
      if (!template.horario_notificacao) return true;
      const [h, m] = template.horario_notificacao.split(':');
      const target = (Number(h) || 0) * 60 + (Number(m) || 0);
      return Math.abs(minutes - target) <= 30;
    }
    default:
      return true;
  }
}

function execucaoConcluidaHoje(
  templateId: string,
  execucoes: ChecklistExecucao[],
  hoje: Date
) {
  return execucoes.some((exec) => {
    if (exec.tipo !== templateId) return false;
    const data = parseIso(exec.data);
    if (!data) return false;
    return isSameDay(data, hoje) && exec.concluido === true;
  });
}

function countPausasEmAtraso(pausas: PausaCafe[], now: Date) {
  return pausas.filter((pausa) => {
    if (pausa.finalizado_em) return false;
    const inicio = parseIso(pausa.iniciado_em);
    if (!inicio) return false;
    const duracao = pausa.duracao_minutos ?? 15;
    return now.getTime() - inicio.getTime() > duracao * 60 * 1000;
  }).length;
}

export function useDashboardData() {
  const { user } = useAuth();
  const fiscalId = user?.id ?? '';

  const inicioDia = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  const results = useQueries({
    queries: [
      {
        queryKey: ['colaboradores', fiscalId],
        queryFn: () => fetchColaboradores(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['caixas', fiscalId],
        queryFn: () => fetchCaixas(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['alocacoes', fiscalId],
        queryFn: () => fetchAlocacoesAtivas(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['pausas', fiscalId, inicioDia],
        queryFn: () => fetchPausasHoje(fiscalId, inicioDia),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['entregas', fiscalId],
        queryFn: () => fetchEntregas(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['notas', fiscalId],
        queryFn: () => fetchNotas(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['ocorrencias', fiscalId],
        queryFn: () => fetchOcorrencias(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['checklistTemplates', fiscalId],
        queryFn: () => fetchChecklistTemplates(fiscalId),
        enabled: !!fiscalId,
      },
      {
        queryKey: ['checklistExecucoes', fiscalId],
        queryFn: () => fetchChecklistExecucoes(fiscalId),
        enabled: !!fiscalId,
      },
    ],
  });

  const [
    colaboradoresQuery,
    caixasQuery,
    alocacoesQuery,
    pausasQuery,
    entregasQuery,
    notasQuery,
    ocorrenciasQuery,
    templatesQuery,
    execucoesQuery,
  ] = results;

  const now = new Date();

  const colaboradores = (colaboradoresQuery.data ?? []).filter((c) => c.ativo);
  const caixas = caixasQuery.data ?? [];
  const caixasAtivos = caixas.filter((c) => c.ativo && !c.em_manutencao);
  const alocacoes = alocacoesQuery.data ?? [];
  const pausas = pausasQuery.data ?? [];
  const entregas = entregasQuery.data ?? [];
  const notas = notasQuery.data ?? [];
  const ocorrencias = ocorrenciasQuery.data ?? [];
  const templates = templatesQuery.data ?? [];
  const execucoes = execucoesQuery.data ?? [];

  const emRota = entregas.filter((e) => e.status === 'em_rota').length;
  const separadas = entregas.filter((e) => e.status === 'separada').length;

  const lembretesVencidos = notas.filter((n) => {
    if (n.tipo !== 'lembrete') return false;
    if (!n.data_lembrete) return false;
    if (n.concluida) return false;
    return new Date(n.data_lembrete) < now;
  }).length;

  const ocorrenciasAbertas = ocorrencias.filter((o) => !o.resolvida).length;

  const checklistsPendentes = templates.filter((t) => {
    if (!isWithinWindow(t, now)) return false;
    return !execucaoConcluidaHoje(t.id, execucoes, now);
  }).length;

  const pausasEmAtraso = countPausasEmAtraso(pausas, now);

  return {
    isLoading: results.some((r) => r.isLoading),
    colaboradoresAtivos: colaboradores.length,
    caixasAtivos: caixasAtivos.length,
    alocados: alocacoes.length,
    livres: Math.max(caixasAtivos.length - alocacoes.length, 0),
    pausasAtivas: pausas.filter((p) => !p.finalizado_em).length,
    pausasEmAtraso,
    entregasEmRota: emRota,
    entregasSeparadas: separadas,
    lembretesVencidos,
    ocorrenciasAbertas,
    checklistsPendentes,
  };
}
