interface CardResumoProps {
  titulo: string;
  valor: number;
  destaque: string;
}

/**
 * Mostra um indicador resumido para leitura rápida do dashboard.
 */
export function CardResumo({ titulo, valor, destaque }: CardResumoProps) {
  return (
    <div className="rounded-2xl border border-brand-100/70 bg-white/95 p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <div className="mt-3 flex items-end justify-between">
        <strong className="text-3xl text-slate-900">{valor}</strong>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${destaque}`}>{titulo}</span>
      </div>
    </div>
  );
}
