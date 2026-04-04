export type DepartamentoTipo =
  | 'caixa'
  | 'fiscal'
  | 'pacote'
  | 'self'
  | 'gerencia'
  | 'acougue'
  | 'padaria'
  | 'hortifruti'
  | 'deposito'
  | 'limpeza'
  | 'seguranca'
  | 'outro';

export type TipoCaixa = 'normal' | 'rapido' | 'self' | 'balcao';

export type Caixa = {
  id: string;
  fiscal_id: string;
  numero: number;
  tipo: TipoCaixa;
  ativo: boolean;
  em_manutencao: boolean;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Colaborador = {
  id: string;
  fiscal_id: string;
  nome: string;
  departamento: DepartamentoTipo;
  ativo: boolean;
  observacoes?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  cpf?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Alocacao = {
  id: string;
  fiscal_id: string;
  colaborador_id: string;
  caixa_id: string;
  turno_escala_id?: string | null;
  alocado_em: string;
  liberado_em?: string | null;
  status?: string | null;
  motivo_liberacao?: string | null;
  alocado_por?: string | null;
  observacoes?: string | null;
  created_at?: string;
  intervalo_marcado_feito?: boolean | null;
};

export type PausaCafe = {
  id: string;
  fiscal_id: string;
  colaborador_id: string;
  colaborador_nome: string;
  caixa_id?: string | null;
  iniciado_em: string;
  duracao_minutos: number;
  finalizado_em?: string | null;
};

export type Entrega = {
  id: string;
  fiscal_id: string;
  numero_nota: string;
  cliente_nome: string;
  bairro?: string | null;
  cidade?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  status: string;
  separado_em: string;
  horario_marcado?: string | null;
  saiu_para_entrega_em?: string | null;
  entregue_em?: string | null;
  observacoes?: string | null;
};

export type Nota = {
  id: string;
  fiscal_id: string;
  titulo: string;
  conteudo: string;
  tipo: 'anotacao' | 'tarefa' | 'lembrete';
  concluida: boolean;
  importante: boolean;
  lembrete_ativo: boolean;
  data_lembrete?: string | null;
  foto_url?: string | null;
  foto_nome?: string | null;
  arquivo_url?: string | null;
  arquivo_nome?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Ocorrencia = {
  id: string;
  fiscal_id: string;
  tipo: string;
  descricao: string;
  gravidade: string;
  resolvida: boolean;
  registrada_em: string;
  resolvida_em?: string | null;
  caixa_id?: string | null;
  caixa_nome?: string | null;
  colaborador_id?: string | null;
  colaborador_nome?: string | null;
  foto_url?: string | null;
  foto_nome?: string | null;
  arquivo_url?: string | null;
  arquivo_nome?: string | null;
};

export type ChecklistTemplate = {
  id: string;
  fiscal_id: string;
  titulo: string;
  periodizacao: string;
  horario_notificacao?: string | null;
};

export type ChecklistExecucao = {
  id: string;
  fiscal_id: string;
  tipo: string;
  data: string;
  concluido: boolean;
};
