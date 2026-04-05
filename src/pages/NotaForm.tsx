import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { atualizarNota, criarNota, obterNota, obterSugestoes } from "../services/api";
import { mostrarNotificacao } from "../services/notifications";
import { formatarParaInput } from "../utils/dateUtils";

const estadoInicial = {
  numero: "",
  cliente: "",
  destinatario: "",
  observacoes: "",
  dataEmissao: "",
  dataChegada: "",
  dataLimite: "",
};

/**
 * Exibe o formulario de criacao e edicao de notas fiscais.
 */
export function NotaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(estadoInicial);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(Boolean(id));
  const [sugestoesCliente, setSugestoesCliente] = useState<string[]>([]);
  const [sugestoesDestinatario, setSugestoesDestinatario] = useState<string[]>([]);

  /**
   * Atualiza um campo especifico do formulario sem perder o restante do estado.
   */
  function handleChange(campo: keyof typeof estadoInicial, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  /**
   * Valida regras de preenchimento do formulario para evitar erros operacionais.
   */
  function validarFormulario() {
    if (new Date(form.dataChegada) < new Date(form.dataEmissao)) {
      throw new Error("A data de chegada nao pode ser anterior a emissao.");
    }

    if (new Date(form.dataLimite) < new Date(form.dataChegada)) {
      throw new Error("A data limite nao pode ser anterior a data de chegada.");
    }
  }

  /**
   * Carrega sugestoes automaticas de clientes e destinatarios ja utilizados.
   */
  async function carregarSugestoes() {
    try {
      const response = await obterSugestoes();
      setSugestoesCliente(response.clientes);
      setSugestoesDestinatario(response.destinatarios);
    } catch {
      setSugestoesCliente([]);
      setSugestoesDestinatario([]);
    }
  }

  /**
   * Carrega a nota existente quando a pagina e usada em modo de edicao.
   */
  async function carregarNota() {
    if (!id) {
      setCarregando(false);
      return;
    }

    try {
      const nota = await obterNota(id);
      setForm({
        numero: nota.numero,
        cliente: nota.cliente,
        destinatario: nota.destinatario,
        observacoes: nota.observacoes ?? "",
        dataEmissao: formatarParaInput(nota.dataEmissao),
        dataChegada: formatarParaInput(nota.dataChegada),
        dataLimite: formatarParaInput(nota.dataLimite),
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel carregar a nota.");
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Envia os dados do formulario para criar ou atualizar a nota fiscal.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      validarFormulario();

      if (id) {
        await atualizarNota(id, form);
      } else {
        await criarNota(form);
      }

      mostrarNotificacao(id ? "Nota atualizada com sucesso." : "Nota cadastrada com sucesso.");
      navigate("/");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel salvar a nota.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarSugestoes();
    void carregarNota();
  }, [id]);

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-8 xl:px-10 2xl:px-12">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {id ? "Editar nota fiscal" : "Cadastrar nota fiscal"}
          </h1>
          <p className="mt-2 text-slate-500">
            Use sugestoes automaticas, observacoes opcionais e validacoes de prazo para preencher a
            nota com mais velocidade e menos erro operacional.
          </p>
        </div>

        {erro ? <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        {carregando ? (
          <div className="text-slate-500">Carregando dados da nota...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Numero da nota fiscal</label>
              <input
                type="text"
                value={form.numero}
                onChange={(event) => handleChange("numero", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Cliente</label>
              <input
                list="clientes-sugeridos"
                type="text"
                value={form.cliente}
                onChange={(event) => handleChange("cliente", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
              <datalist id="clientes-sugeridos">
                {sugestoesCliente.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Destinatario final</label>
              <input
                list="destinatarios-sugeridos"
                type="text"
                value={form.destinatario}
                onChange={(event) => handleChange("destinatario", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
              <datalist id="destinatarios-sugeridos">
                {sugestoesDestinatario.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Observacoes / detalhes</label>
              <textarea
                value={form.observacoes}
                onChange={(event) => handleChange("observacoes", event.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Campo opcional para registrar detalhes adicionais da nota."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data de emissao</label>
              <input
                type="date"
                value={form.dataEmissao}
                onChange={(event) => handleChange("dataEmissao", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data de chegada</label>
              <input
                type="date"
                value={form.dataChegada}
                onChange={(event) => handleChange("dataChegada", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data limite / prazo</label>
              <input
                type="date"
                value={form.dataLimite}
                onChange={(event) => handleChange("dataLimite", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
              <strong className="block text-slate-900">Dicas para preenchimento rapido</strong>
              O sistema reaproveita clientes e destinatarios ja cadastrados. O prazo precisa ser igual ou
              posterior a data de chegada. Use observacoes para registrar orientacoes operacionais.
            </div>

            <div className="flex items-end justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
              >
                {loading ? "Salvando..." : id ? "Salvar alteracoes" : "Criar nota"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
