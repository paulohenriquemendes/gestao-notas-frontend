import { useEffect, useState } from "react";
import { CardResumo } from "../components/CardResumo";
import { GraficoSimples } from "../components/GraficoSimples";
import { TabelaNotas } from "../components/TabelaNotas";
import { excluirNota, listarNotas } from "../services/api";
import { DashboardResumo, NotaFiscal } from "../types";

const resumoInicial: DashboardResumo = {
  atrasadas: 0,
  vencendo: 0,
  noPrazo: 0,
  total: 0,
};

/**
 * Exibe o painel principal com resumo, filtros, gráfico e tabela de notas fiscais.
 */
export function Dashboard() {
  const [periodo, setPeriodo] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [resumo, setResumo] = useState<DashboardResumo>(resumoInicial);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  /**
   * Busca as notas fiscais sempre que os filtros forem alterados.
   */
  async function carregarDashboard() {
    setLoading(true);
    setErro("");

    try {
      const response = await listarNotas(periodo, status);
      setNotas(response.notas);
      setResumo(response.resumo);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Exclui uma nota fiscal e atualiza a lista sem recarregar a página inteira.
   */
  async function handleDelete(id: string) {
    const confirmado = window.confirm("Deseja realmente excluir esta nota fiscal?");

    if (!confirmado) {
      return;
    }

    try {
      await excluirNota(id);
      await carregarDashboard();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível excluir a nota.");
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, [periodo, status]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de notas fiscais</h1>
          <p className="mt-2 text-slate-600">
            Visualize prioridades por cor para agir antes da chegada do motorista.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Período</label>
            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="todos">Todos</option>
              <option value="7">Próximos 7 dias</option>
              <option value="30">Próximos 30 dias</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="todos">Todos</option>
              <option value="atrasada">Atrasadas</option>
              <option value="venceHoje">Vence hoje</option>
              <option value="venceAmanha">Vence amanhã</option>
              <option value="venceEm3Dias">Vence em até 3 dias</option>
              <option value="dentroPrazo">Dentro do prazo</option>
            </select>
          </div>
        </div>
      </div>

      {erro ? <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardResumo titulo="Atrasadas" valor={resumo.atrasadas} destaque="bg-red-100 text-red-700" />
        <CardResumo titulo="Vencendo" valor={resumo.vencendo} destaque="bg-orange-100 text-orange-700" />
        <CardResumo titulo="No prazo" valor={resumo.noPrazo} destaque="bg-green-100 text-green-700" />
        <CardResumo titulo="Total" valor={resumo.total} destaque="bg-slate-100 text-slate-700" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GraficoSimples resumo={resumo} />

        <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Leitura operacional</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vermelho indica atraso. Laranja representa notas que vencem hoje ou amanhã. Amarelo sinaliza
            vencimento em até três dias. Verde mostra o que ainda está confortável dentro do prazo.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-soft">
            Carregando notas fiscais...
          </div>
        ) : (
          <TabelaNotas notas={notas} onDelete={handleDelete} />
        )}
      </div>
    </section>
  );
}
