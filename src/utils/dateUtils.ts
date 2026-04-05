import { NotaStatus } from "../types";

/**
 * Formata datas ISO no padrão brasileiro para exibição na interface.
 */
export function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(data));
}

/**
 * Converte uma data ISO para o formato aceito pelo input date.
 */
export function formatarParaInput(data?: string): string {
  if (!data) {
    return "";
  }

  return new Date(data).toISOString().slice(0, 10);
}

/**
 * Traduz o status técnico em um rótulo amigável para o usuário.
 */
export function obterRotuloStatus(status: NotaStatus): string {
  const mapa: Record<NotaStatus, string> = {
    atrasada: "Atrasada",
    venceHoje: "Vence hoje",
    venceAmanha: "Vence amanhã",
    venceEm3Dias: "Vence em até 3 dias",
    dentroPrazo: "Dentro do prazo",
  };

  return mapa[status];
}

/**
 * Retorna as classes Tailwind de fundo para destacar cada nível de prioridade.
 */
export function obterClasseStatus(status: NotaStatus): string {
  const mapa: Record<NotaStatus, string> = {
    atrasada: "bg-red-100",
    venceHoje: "bg-orange-100",
    venceAmanha: "bg-orange-100",
    venceEm3Dias: "bg-yellow-100",
    dentroPrazo: "bg-green-100",
  };

  return mapa[status];
}
