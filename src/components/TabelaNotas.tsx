import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { NotaFiscal } from "../types";
import { formatarData, obterClasseStatus, obterRotuloStatus } from "../utils/dateUtils";

interface TabelaNotasProps {
  notas: NotaFiscal[];
  onDelete: (id: string) => void;
  onEntregue: (id: string) => void;
}

/**
 * Renderiza a tabela principal com detalhes expansiveis e historico recente da nota.
 */
export function TabelaNotas({ notas, onDelete, onEntregue }: TabelaNotasProps) {
  const [notaExpandida, setNotaExpandida] = useState<string | null>(null);

  /**
   * Alterna a expansao de detalhes da nota.
   */
  function alternarExpansao(id: string) {
    setNotaExpandida((atual) => (atual === id ? null : id));
  }

  if (notas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Nenhuma nota fiscal encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1650px] overflow-hidden rounded-2xl border border-brand-100/70 bg-white/95 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-base">
          <thead className="bg-slate-100 text-left text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
            <tr>
              <th className="px-5 py-4">Nota</th>
              <th className="px-5 py-4">Cidade</th>
              <th className="px-5 py-4">Destinatário</th>
              <th className="px-5 py-4">Prazo</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <Fragment key={nota.id}>
                <tr className={`border-t border-slate-100 ${obterClasseStatus(nota.status)}`}>
                  <td className="px-5 py-4 text-base font-semibold text-slate-800">{nota.numero}</td>
                  <td className="px-5 py-4 text-slate-700">{nota.cliente}</td>
                  <td className="px-5 py-4 text-slate-700">{nota.destinatario}</td>
                  <td className="px-5 py-4 text-slate-700">{formatarData(nota.dataLimite)}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{obterRotuloStatus(nota.status)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => alternarExpansao(nota.id)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                      >
                        {notaExpandida === nota.id ? "Ocultar detalhes" : "Ver detalhes"}
                      </button>
                      <Link
                        to={`/notas/${nota.id}`}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                      >
                        Editar
                      </Link>
                      {!nota.arquivada ? (
                        <button
                          type="button"
                          onClick={() => onEntregue(nota.id)}
                          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Entregue
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onDelete(nota.id)}
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>

                {notaExpandida === nota.id ? (
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td colSpan={6} className="px-5 py-5">
                      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-2xl bg-white p-4">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Detalhes da nota
                          </h3>
                          <div className="mt-3 grid gap-2 text-sm text-slate-700">
                            <p><strong>Cadastrada por:</strong> {nota.criadoPorNome}</p>
                            <p><strong>Cidade:</strong> {nota.cliente}</p>
                            <p><strong>Destinatário:</strong> {nota.destinatario}</p>
                            <p><strong>Observações:</strong> {nota.observacoes || "Sem observações."}</p>
                            <p><strong>Emissão:</strong> {formatarData(nota.dataEmissao)}</p>
                            <p><strong>Chegada:</strong> {formatarData(nota.dataChegada)}</p>
                            <p><strong>Prazo:</strong> {formatarData(nota.dataLimite)}</p>
                            <p><strong>Entregue em:</strong> {nota.entregueEm ? formatarData(nota.entregueEm) : "Ainda nao entregue"}</p>
                            <p><strong>Dias desde a chegada:</strong> {nota.diasDesdeChegada}</p>
                            <p><strong>Dias restantes:</strong> {nota.diasRestantes}</p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Historico recente
                          </h3>
                          <div className="mt-3 space-y-3">
                            {nota.historicoRecente.length === 0 ? (
                              <p className="text-sm text-slate-500">Ainda nao ha registros no historico.</p>
                            ) : (
                              nota.historicoRecente.map((item) => (
                                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                                  <p className="text-sm font-semibold text-slate-800">{item.descricao}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {item.userNome} • {formatarData(item.createdAt)}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
