import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { atualizarNota, criarNota, obterNota } from "../services/api";
import { formatarParaInput } from "../utils/dateUtils";

const estadoInicial = {
  numero: "",
  cliente: "",
  destinatario: "",
  dataEmissao: "",
  dataChegada: "",
  dataLimite: "",
};

/**
 * Exibe o formulário de criação e edição de notas fiscais.
 */
export function NotaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(estadoInicial);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(Boolean(id));

  /**
   * Atualiza um campo específico do formulário sem perder o restante do estado.
   */
  function handleChange(campo: keyof typeof estadoInicial, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  /**
   * Carrega a nota existente quando a página é usada em modo de edição.
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
        dataEmissao: formatarParaInput(nota.dataEmissao),
        dataChegada: formatarParaInput(nota.dataChegada),
        dataLimite: formatarParaInput(nota.dataLimite),
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar a nota.");
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Envia os dados do formulário para criar ou atualizar a nota fiscal.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      if (id) {
        await atualizarNota(id, form);
      } else {
        await criarNota(form);
      }

      navigate("/");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar a nota.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarNota();
  }, [id]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {id ? "Editar nota fiscal" : "Cadastrar nota fiscal"}
          </h1>
          <p className="mt-2 text-slate-500">
            Preencha os dados da nota e mantenha o destino final definido antes da chegada do motorista.
          </p>
        </div>

        {erro ? <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        {carregando ? (
          <div className="text-slate-500">Carregando dados da nota...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Número da nota fiscal</label>
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
                type="text"
                value={form.cliente}
                onChange={(event) => handleChange("cliente", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Destinatário final</label>
              <input
                type="text"
                value={form.destinatario}
                onChange={(event) => handleChange("destinatario", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data de emissão</label>
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
                {loading ? "Salvando..." : id ? "Salvar alterações" : "Criar nota"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
