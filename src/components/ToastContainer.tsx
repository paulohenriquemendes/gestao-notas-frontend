import { useEffect, useState } from "react";
import {
  NotificationPayload,
  obterEventoNotificacao,
} from "../services/notifications";

/**
 * Exibe notificações temporárias no canto superior da aplicação.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    function handleNotification(event: Event) {
      const customEvent = event as CustomEvent<NotificationPayload>;
      const payload = customEvent.detail;

      setToasts((current) => [...current, payload]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== payload.id));
      }, 2600);
    }

    window.addEventListener(obterEventoNotificacao(), handleNotification);

    return () => {
      window.removeEventListener(obterEventoNotificacao(), handleNotification);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 shadow-soft ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-brand-100 bg-white text-slate-800"
          }`}
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
