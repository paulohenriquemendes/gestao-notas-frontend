import { Link } from "react-router-dom";
import { NotaFiscal } from "../types";
import { formatarData, obterClasseStatus, obterRotuloStatus } from "../utils/dateUtils";

interface TabelaNotasProps {
  notas: NotaFiscal[];
  onDelete: (id: string) => void;
}

/**
 * Renderiza a tabela principal com as notas fiscais coloridas conforme prioridade.
 */
export function TabelaNotas({ notas, onDelete }: TabelaNotasProps) {
  if (notas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Nenhuma nota fiscal encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Destinatário</th>
              <th className="px-4 py-3">Emissão</th>
              <th className="px-4 py-3">Chegada</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Dias restantes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <tr key={nota.id} className={`border-t border-slate-100 ${obterClasseStatus(nota.status)}`}>
                <td className="px-4 py-3 font-semibold text-slate-800">{nota.numero}</td>
                <td className="px-4 py-3">{nota.cliente}</td>
                <td className="px-4 py-3">{nota.destinatario}</td>
                <td className="px-4 py-3">{formatarData(nota.dataEmissao)}</td>
                <td className="px-4 py-3">{formatarData(nota.dataChegada)}</td>
                <td className="px-4 py-3">{formatarData(nota.dataLimite)}</td>
                <td className="px-4 py-3">{nota.diasRestantes}</td>
                <td className="px-4 py-3">{obterRotuloStatus(nota.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/notas/${nota.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-white"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(nota.id)}
                      className="rounded-md bg-red-500 px-3 py-1 font-medium text-white hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
