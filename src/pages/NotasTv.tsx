import { useEffect, useState } from "react";
import { listarNotas } from "../services/api";
import { NotaFiscal } from "../types";
import { formatarData, obterClasseStatus, obterRotuloStatus } from "../utils/dateUtils";

/**
 * Exibe somente a listagem de notas para uso em Smart TV ou monitor operacional.
 */
export function NotasTv() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  /**
   * Carrega as notas ativas em ordem de urgencia para visualizacao em tela cheia.
   */
  async function carregarNotasTv() {
    try {
      setErro("");
      const response = await listarNotas({
        periodo: "todos",
        status: "todos",
        visao: "ativas",
        busca: "",
        page: 1,
        pageSize: 1000,
        sortBy: "urgencia",
        sortOrder: "asc",
      });

      setNotas(response.notas);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel carregar as notas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarNotasTv();
    const intervalId = window.setInterval(() => void carregarNotasTv(), 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white 2xl:p-10">
      {erro ? (
        <div className="flex min-h-[70vh] items-center justify-center rounded-3xl border border-red-400/40 bg-red-950/40 p-8 text-center text-3xl font-semibold text-red-100">
          {erro}
        </div>
      ) : null}

      {!erro && loading ? (
        <div className="flex min-h-[70vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-3xl font-semibold text-slate-200">
          Carregando notas fiscais...
        </div>
      ) : null}

      {!erro && !loading && notas.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-3xl font-semibold text-slate-200">
          Nenhuma nota ativa para exibir.
        </div>
      ) : null}

      {!erro && !loading && notas.length > 0 ? (
        <section className="mx-auto w-full max-w-[1900px] overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
          <table className="w-full table-fixed text-left">
            <thead className="bg-slate-900 text-lg font-bold uppercase tracking-[0.12em] text-white">
              <tr>
                <th className="w-[15%] px-6 py-5">Nota</th>
                <th className="w-[20%] px-6 py-5">Cidade</th>
                <th className="w-[28%] px-6 py-5">Destinatario</th>
                <th className="w-[14%] px-6 py-5">Prazo</th>
                <th className="w-[23%] px-6 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="text-2xl font-semibold text-slate-900 2xl:text-3xl">
              {notas.map((nota) => (
                <tr key={nota.id} className={`border-t border-slate-200 ${obterClasseStatus(nota.status)}`}>
                  <td className="px-6 py-5">{nota.numero}</td>
                  <td className="px-6 py-5">{nota.cliente}</td>
                  <td className="truncate px-6 py-5">{nota.destinatario}</td>
                  <td className="px-6 py-5">{formatarData(nota.dataLimite)}</td>
                  <td className="px-6 py-5">
                    <span className="block">{obterRotuloStatus(nota.status)}</span>
                    <span className="mt-1 block text-base font-medium text-slate-700 2xl:text-lg">
                      {nota.indicadorPrazo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
