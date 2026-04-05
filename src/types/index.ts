export type NotaStatus =
  | "atrasada"
  | "venceHoje"
  | "venceAmanha"
  | "venceEm3Dias"
  | "dentroPrazo";

export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  cliente: string;
  destinatario: string;
  dataEmissao: string;
  dataChegada: string;
  dataLimite: string;
  userId: string;
  diasDesdeChegada: number;
  diasRestantes: number;
  status: NotaStatus;
}

export interface DashboardResumo {
  atrasadas: number;
  vencendo: number;
  noPrazo: number;
  total: number;
}

export interface DashboardResponse {
  resumo: DashboardResumo;
  notas: NotaFiscal[];
}

export interface NotaPayload {
  numero: string;
  cliente: string;
  destinatario: string;
  dataEmissao: string;
  dataChegada: string;
  dataLimite: string;
}
