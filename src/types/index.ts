export type NotaStatus =
  | "atrasada"
  | "venceHoje"
  | "venceAmanha"
  | "venceEm3Dias"
  | "dentroPrazo";

export type UserRole = "ADMIN" | "OPERADOR";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface NotaHistorico {
  id: string;
  numeroNota: string;
  acao: string;
  descricao: string;
  alteracoes: Record<string, unknown> | null;
  userId: string;
  userNome: string;
  createdAt: string;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  cliente: string;
  destinatario: string;
  observacoes: string | null;
  criadoPorNome: string;
  dataEmissao: string;
  dataChegada: string;
  dataLimite: string;
  userId: string;
  diasDesdeChegada: number;
  diasRestantes: number;
  status: NotaStatus;
  indicadorPrazo: string;
  prioridadePeso: number;
  historicoRecente: NotaHistorico[];
  historicoCompleto?: NotaHistorico[];
}

export interface DashboardResumo {
  atrasadas: number;
  vencendo: number;
  noPrazo: number;
  total: number;
}

export interface DashboardAlerta {
  id: string;
  titulo: string;
  descricao: string;
  status: NotaStatus;
  numero: string;
}

export interface DashboardPaginacao {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface DashboardResponse {
  resumo: DashboardResumo;
  alertas: DashboardAlerta[];
  notas: NotaFiscal[];
  paginacao: DashboardPaginacao;
  filtrosAplicados: {
    busca: string;
    periodo: string;
    status: string;
    sortBy: "urgencia" | "prazo" | "cliente" | "chegada";
    sortOrder: "asc" | "desc";
  };
}

export interface NotaPayload {
  numero: string;
  cliente: string;
  destinatario: string;
  observacoes?: string;
  dataEmissao: string;
  dataChegada: string;
  dataLimite: string;
}

export interface SugestoesResponse {
  clientes: string[];
  destinatarios: string[];
}

export interface AuthProfile extends User {
  createdAt: string;
}
