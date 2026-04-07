import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardResumo } from "../components/CardResumo";
import { GraficoSimples } from "../components/GraficoSimples";
import { TabelaNotas } from "../components/TabelaNotas";
import { excluirNota, exportarNotas, listarNotas } from "../services/api";
import { mostrarNotificacao } from "../services/notifications";
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
  { valor: "venceAmanha", rotulo: "Amanha" },
  { valor: "venceEm3Dias", rotulo: "Ate 3 dias" },
  { valor: "dentroPrazo", rotulo: "No prazo" },
];

/**
 * Exibe o painel principal com filtros, tabela operacional e exportacoes.
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
  const [exportando, setExportando] = useState<"" | "pdf" | "csv" | "excel">("");
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
      setErro(error instanceof Error ? error.message : "Nao foi possivel carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Atualiza o filtro de periodo e recarrega imediatamente.
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
   * Atualiza a busca textual com resposta dinamica.
   */
  async function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
    await carregarDashboard(periodo, status, valor, 1, sortBy, sortOrder);
  }

  /**
   * Atualiza a ordenacao da listagem.
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
   * Navega entre paginas.
   */
  async function irParaPagina(novaPagina: number) {
    setPage(novaPagina);
    await carregarDashboard(periodo, status, busca, novaPagina, sortBy, sortOrder);
  }

  /**
   * Exporta as notas filtradas no formato selecionado.
   */
  async function handleExportar(formato: "pdf" | "csv" | "excel") {
    try {
      setExportando(formato);
      const arquivo = await exportarNotas({ periodo, status, busca, sortBy, sortOrder, formato });
      const url = window.URL.createObjectURL(arquivo.blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", arquivo.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      mostrarNotificacao(`Exportacao ${formato.toUpperCase()} concluida com sucesso.`);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel exportar as notas.");
      mostrarNotificacao("Nao foi possivel exportar as notas.", "error");
    } finally {
      setExportando("");
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
      mostrarNotificacao("Nota excluida com sucesso.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel excluir a nota.");
      mostrarNotificacao("Nao foi possivel excluir a nota.", "error");
    }
  }

  useEffect(() => {
    void carregarDashboard();
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1800px] px-6 py-8 xl:px-10 2xl:px-12">
      <div className="mb-8 rounded-3xl border border-brand-100/70 bg-white/95 p-6 shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de notas fiscais</h1>
            <p className="mt-2 text-slate-600">
              As notas aparecem por urgencia, com busca textual, alertas internos, navegacao paginada
              e exportacao pronta para reunioes e conferencias operacionais.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <button
                type="button"
                onClick={() => void handleExportar("pdf")}
                disabled={exportando !== ""}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {exportando === "pdf" ? "Gerando PDF..." : "Exportar PDF"}
              </button>
              <button
                type="button"
                onClick={() => void handleExportar("csv")}
                disabled={exportando !== ""}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-60"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => void handleExportar("excel")}
                disabled={exportando !== ""}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-60"
              >
                Excel
              </button>
            </div>

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

      {/* 
      {alertas.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-red-700">Alertas prioritarios</p>
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
      */}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardResumo titulo="Atrasadas" valor={resumo.atrasadas} destaque="bg-red-100 text-red-700" />
        <CardResumo titulo="Vencendo" valor={resumo.vencendo} destaque="bg-orange-100 text-orange-700" />
        <CardResumo titulo="No prazo" valor={resumo.noPrazo} destaque="bg-green-100 text-green-700" />
        <CardResumo titulo="Total" valor={resumo.total} destaque="bg-slate-100 text-slate-700" />
      </div>

      <div className="mb-3 rounded-2xl border border-brand-100/70 bg-white/95 p-4 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Busca textual
            </label>
            <input
              type="text"
              value={busca}
              onChange={(event) => void handleBusca(event.target.value)}
              placeholder="Buscar por numero, cidade ou destinatario"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Periodo</p>
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
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Ordenacao</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void atualizarOrdenacao("urgencia", "asc")}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  sortBy === "urgencia" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Urgencia
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

      <div className="mb-8 flex items-center justify-between rounded-2xl border border-brand-100/70 bg-white/95 px-4 py-3 shadow-soft">
        <p className="text-sm text-slate-600">
          Pagina {paginacao.page} de {paginacao.totalPages} • {paginacao.totalItems} notas encontradas
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
            Proxima
          </button>
        </div>
      </div>

      {/*
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-brand-100/70 bg-white/95 p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Entenda as prioridades</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vermelho indica atraso. Laranja representa notas que vencem hoje ou amanha. Amarelo
            sinaliza vencimento em ate tres dias. Verde mostra o que ainda esta confortavel dentro do
            prazo.
          </p>
        </div>
        <GraficoSimples resumo={resumo} />
      </div>
      */}
    </section>
  );
}
