export type NotificationType = "success" | "error" | "info";

export interface NotificationPayload {
  id: string;
  message: string;
  type: NotificationType;
}

const NOTIFICATION_EVENT = "gestao-notas-notification";

/**
 * Dispara uma notificação global para feedback visual de ações do usuário.
 */
export function mostrarNotificacao(message: string, type: NotificationType = "success"): void {
  window.dispatchEvent(
    new CustomEvent<NotificationPayload>(NOTIFICATION_EVENT, {
      detail: {
        id: crypto.randomUUID(),
        message,
        type,
      },
    }),
  );
}

/**
 * Retorna o nome do evento usado para sincronizar notificações globais.
 */
export function obterEventoNotificacao(): string {
  return NOTIFICATION_EVENT;
}
