import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cadastrar, salvarToken } from "../services/api";

/**
 * Exibe o formulário de cadastro para novos usuários do sistema.
 */
export function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Cria a conta do usuário e salva a sessão local automaticamente.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await cadastrar({ nome, email, senha });
      salvarToken(response.token);
      navigate("/");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-3xl bg-white p-8 shadow-soft">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Criar conta</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cadastre sua equipe e comece a monitorar os prazos das notas fiscais.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
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
            required
          />
        </div>

        {erro ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p className="text-sm text-slate-500">
          Já possui conta?{" "}
          <Link to="/login" className="font-semibold text-brand-700">
            Fazer login
          </Link>
        </p>
      </form>
    </section>
  );
}
