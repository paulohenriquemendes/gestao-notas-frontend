import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, salvarToken } from "../services/api";

/**
 * Exibe o formulário de login e autentica o usuário na API.
 */
export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Envia as credenciais para a API e redireciona para o dashboard em caso de sucesso.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await login({ email, senha });
      salvarToken(response.token);
      navigate("/");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível entrar.");
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
            <p className="mt-1 text-sm text-slate-500">Use seu e-mail e senha para acessar o dashboard.</p>
          </div>

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
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-sm text-slate-500">
            Ainda não possui conta?{" "}
            <Link to="/cadastro" className="font-semibold text-brand-700">
              Criar cadastro
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
