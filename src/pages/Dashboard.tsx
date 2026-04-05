import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardResumo } from "../components/CardResumo";
import { GraficoSimples } from "../components/GraficoSimples";
import { TabelaNotas } from "../components/TabelaNotas";
import { excluirNota, exportarNotas, listarNotas } from "../services/api";
import { DashboardAlerta, DashboardPaginacao, DashboardResumo, NotaFiscal } from "../types";

const resumoInicial: DashboardResumo = {
  atrasadas: 0,
  vencendo: 0,
  noPrazo: 0,
  total: 0,
};

const paginacaoInicial: DashboardPaginacao = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
};

const opcoesPeriodo = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "7", rotulo: "7 dias" },
  { valor: "30", rotulo: "30 dias" },
];

const opcoesStatus = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "atrasada", rotulo: "Atrasadas" },
  { valor: "venceHoje", rotulo: "Hoje" },
  { valor: "venceAmanha", rotulo: "Amanhã" },
  { valor: "venceEm3Dias", rotulo: "Até 3 dias" },
  { valor: "dentroPrazo", rotulo: "No prazo" },
];

/**
 * Exibe o painel principal com busca, alertas, paginação e ordenação operacional.
 */
export function Dashboard() {
  const [periodo, setPeriodo] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [sortBy, setSortBy] = useState<"urgencia" | "prazo" | "cliente" | "chegada">("urgencia");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [alertas, setAlertas] = useState<DashboardAlerta[]>([]);
  const [resumo, setResumo] = useState<DashboardResumo>(resumoInicial);
  const [paginacao, setPaginacao] = useState<DashboardPaginacao>(paginacaoInicial);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  /**
   * Busca as notas fiscais conforme os filtros ativos.
   */
  async function carregarDashboard(
    periodoAtual = periodo,
    statusAtual = status,
    buscaAtual = busca,
    pageAtual = page,
    sortByAtual = sortBy,
    sortOrderAtual = sortOrder,
  ) {
    setLoading(true);
    setErro("");

    try {
      const response = await listarNotas({
        periodo: periodoAtual,
        status: statusAtual,
        busca: buscaAtual,
        page: pageAtual,
        pageSize: 10,
        sortBy: sortByAtual,
        sortOrder: sortOrderAtual,
      });

      setNotas(response.notas);
      setResumo(response.resumo);
      setAlertas(response.alertas);
      setPaginacao(response.paginacao);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Atualiza o filtro de período e recarrega imediatamente.
   */
  async function selecionarPeriodo(novoPeriodo: string) {
    setPeriodo(novoPeriodo);
    setPage(1);
    await carregarDashboard(novoPeriodo, status, busca, 1, sortBy, sortOrder);
  }

  /**
   * Atualiza o filtro de status e recarrega imediatamente.
   */
  async function selecionarStatus(novoStatus: string) {
    setStatus(novoStatus);
    setPage(1);
    await carregarDashboard(periodo, novoStatus, busca, 1, sortBy, sortOrder);
  }

  /**
   * Atualiza a busca textual com resposta dinâmica.
   */
  async function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
    await carregarDashboard(periodo, status, valor, 1, sortBy, sortOrder);
  }

  /**
   * Atualiza a ordenação da listagem.
   */
  async function atualizarOrdenacao(
    novoSortBy: "urgencia" | "prazo" | "cliente" | "chegada",
    novaOrdem: "asc" | "desc",
  ) {
    setSortBy(novoSortBy);
    setSortOrder(novaOrdem);
    await carregarDashboard(periodo, status, busca, page, novoSortBy, novaOrdem);
  }

  /**
   * Navega entre páginas.
   */
  async function irParaPagina(novaPagina: number) {
    setPage(novaPagina);
    await carregarDashboard(periodo, status, busca, novaPagina, sortBy, sortOrder);
  }

  /**
   * Exporta as notas filtradas para CSV.
   */
  async function handleExportar() {
    try {
      const csv = await exportarNotas({ periodo, status, busca, sortBy, sortOrder });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "notas-fiscais.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível exportar as notas.");
    }
  }

  /**
   * Exclui uma nota fiscal e atualiza a lista.
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
    void carregarDashboard();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de notas fiscais</h1>
            <p className="mt-2 text-slate-600">
              Agora as notas aparecem ordenadas por urgência, com busca textual, alertas internos e
              navegação paginada para escalar melhor a operação.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportar}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Exportar CSV
            </button>
            <Link
              to="/notas/nova"
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Cadastrar nova nota
            </Link>
          </div>
        </div>
      </div>

      {erro ? <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

      {alertas.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-red-700">Alertas prioritários</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{alerta.titulo}</p>
                <p className="mt-1 text-sm text-slate-600">{alerta.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardResumo titulo="Atrasadas" valor={resumo.atrasadas} destaque="bg-red-100 text-red-700" />
        <CardResumo titulo="Vencendo" valor={resumo.vencendo} destaque="bg-orange-100 text-orange-700" />
        <CardResumo titulo="No prazo" valor={resumo.noPrazo} destaque="bg-green-100 text-green-700" />
        <CardResumo titulo="Total" valor={resumo.total} destaque="bg-slate-100 text-slate-700" />
      </div>

      <div className="mb-3 rounded-2xl bg-white p-4 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Busca textual
            </label>
            <input
              type="text"
              value={busca}
              onChange={(event) => void handleBusca(event.target.value)}
              placeholder="Buscar por número, cliente ou destinatário"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Período</p>
            <div className="flex flex-wrap gap-2">
              {opcoesPeriodo.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => void selecionarPeriodo(opcao.valor)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    periodo === opcao.valor
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Status</p>
            <div className="flex flex-wrap gap-2">
              {opcoesStatus.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => void selecionarStatus(opcao.valor)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    status === opcao.valor
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Ordenação</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void atualizarOrdenacao("urgencia", "asc")}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  sortBy === "urgencia" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Urgência
              </button>
              <button
                type="button"
                onClick={() => void atualizarOrdenacao("prazo", "asc")}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  sortBy === "prazo" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Prazo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-soft">
            Carregando notas fiscais...
          </div>
        ) : (
          <TabelaNotas notas={notas} onDelete={handleDelete} />
        )}
      </div>

      <div className="mb-8 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-soft">
        <p className="text-sm text-slate-600">
          Página {paginacao.page} de {paginacao.totalPages} • {paginacao.totalItems} notas encontradas
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={paginacao.page <= 1}
            onClick={() => void irParaPagina(paginacao.page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={paginacao.page >= paginacao.totalPages}
            onClick={() => void irParaPagina(paginacao.page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Entenda as prioridades</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vermelho indica atraso. Laranja representa notas que vencem hoje ou amanhã. Amarelo sinaliza
            vencimento em até três dias. Verde mostra o que ainda está confortável dentro do prazo.
          </p>
        </div>
        <GraficoSimples resumo={resumo} />
      </div>
    </section>
  );
}
