import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrar, login, salvarToken } from "../services/api";

/**
 * Exibe a primeira tela do sistema com login e cadastro no mesmo fluxo.
 */
export function Login() {
  const navigate = useNavigate();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Alterna entre o modo de entrada e o modo de cadastro sem sair da primeira tela.
   */
  function alternarModo() {
    setErro("");
    setModoCadastro((valorAtual) => !valorAtual);
  }

  /**
   * Envia os dados para login ou cadastro e abre o dashboard após sucesso.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = modoCadastro
        ? await cadastrar({ nome, email, senha })
        : await login({ email, senha });

      salvarToken(response.token);
      navigate("/");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível concluir o acesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-8 rounded-3xl bg-white p-8 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-slate-900 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Operação química</p>
          <h1 className="mt-4 text-4xl font-bold">Controle os prazos das notas antes que virem atraso.</h1>
          <p className="mt-4 text-slate-300">
            Visualize entregas, destino final e prioridade em uma única central de decisão.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">Cadastro de usuário apenas no início</p>
            <p className="mt-2 text-sm text-slate-300">
              A criação de usuário fica somente nesta primeira tela. Depois do acesso, a navegação fica
              dedicada ao controle das notas fiscais.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {modoCadastro ? "Criar acesso inicial" : "Entrar"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {modoCadastro
                ? "Cadastre um usuário e entre no sistema sem sair desta tela."
                : "Use seu e-mail e senha para acessar o dashboard."}
            </p>
          </div>

          {modoCadastro ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
                placeholder="Seu nome"
                required={modoCadastro}
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
              placeholder="voce@empresa.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
              placeholder="Sua senha"
              required
            />
          </div>

          {erro ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {loading ? "Processando..." : modoCadastro ? "Cadastrar e entrar" : "Entrar"}
          </button>

          <button
            type="button"
            onClick={alternarModo}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {modoCadastro ? "Já tenho conta" : "Ainda não tenho conta"}
          </button>
        </form>
      </div>
    </section>
  );
}
