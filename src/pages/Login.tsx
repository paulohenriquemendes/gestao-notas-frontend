import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoEmpresa from "../assets/logo-empresa.svg";
import { cadastrar, forgotPassword, login, resetPassword, salvarToken } from "../services/api";
import { mostrarNotificacao } from "../services/notifications";

/**
 * Exibe a primeira tela do sistema com login, cadastro e recuperação de senha.
 */
export function Login() {
  const navigate = useNavigate();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tokenRecuperacao, setTokenRecuperacao] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Alterna entre login e cadastro.
   */
  function alternarModoCadastro() {
    setErro("");
    setMensagem("");
    setModoRecuperacao(false);
    setModoCadastro((valorAtual) => !valorAtual);
  }

  /**
   * Alterna entre login e recuperação de senha.
   */
  function alternarModoRecuperacao() {
    setErro("");
    setMensagem("");
    setModoCadastro(false);
    setModoRecuperacao((valorAtual) => !valorAtual);
  }

  /**
   * Envia os dados de login ou cadastro.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);

    try {
      const response = modoCadastro
        ? await cadastrar({ nome, email, senha })
        : await login({ email, senha });

      salvarToken(response.token);
      mostrarNotificacao(modoCadastro ? "Acesso criado e login realizado." : "Login realizado com sucesso.");
      navigate("/");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível concluir o acesso.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Gera um token de recuperação e exibe na própria interface para uso interno.
   */
  async function handleGerarRecuperacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      setTokenRecuperacao(response.resetToken);
      setMensagem(`Token gerado com sucesso. Expira em ${new Date(response.expiresAt).toLocaleString("pt-BR")}.`);
      mostrarNotificacao("Token de recuperacao gerado com sucesso.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível gerar o token.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Redefine a senha usando o token temporário.
   */
  async function handleResetarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);

    try {
      const response = await resetPassword({ token: tokenRecuperacao, novaSenha });
      setMensagem(response.message);
      mostrarNotificacao("Senha redefinida com sucesso.");
      setModoRecuperacao(false);
      setSenha("");
      setNovaSenha("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-[1800px] items-center px-6 py-10 xl:px-10 2xl:px-12">
      <div className="grid w-full gap-8 rounded-3xl bg-white p-8 shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-slate-900 p-8 text-white">
          <div className="mb-6 inline-flex rounded-2xl bg-white px-5 py-4">
            <img src={logoEmpresa} alt="Logo da empresa" className="h-14 w-auto xl:h-16 2xl:h-20" />
          </div>

          <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Operação química</p>
          <h1 className="mt-4 text-4xl font-bold">Controle notas, prazos, alertas e histórico em um só lugar.</h1>
          <p className="mt-4 text-slate-300">
            O sistema agora traz papéis de acesso, recuperação de senha, alertas internos e trilha de
            alterações para auditoria operacional.
          </p>

          <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-white">Alertas internos</p>
              <p className="mt-2 text-sm text-slate-300">Notas críticas aparecem com prioridade no dashboard.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Histórico completo</p>
              <p className="mt-2 text-sm text-slate-300">Mudanças de prazo e destinatário ficam rastreadas.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {modoRecuperacao ? "Recuperar senha" : modoCadastro ? "Criar acesso inicial" : "Entrar"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {modoRecuperacao
                ? "Gere um token interno de recuperação e redefina a senha do usuário."
                : modoCadastro
                  ? "Cadastre um usuário e entre no sistema sem sair desta tela."
                  : "Use seu e-mail e senha para acessar o dashboard."}
            </p>
          </div>

          {mensagem ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</p> : null}
          {erro ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}

          {!modoRecuperacao ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {modoCadastro ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
                    placeholder="Seu nome"
                    required
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
                  placeholder="Use 8+ caracteres com letras e números"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
              >
                {loading ? "Processando..." : modoCadastro ? "Cadastrar e entrar" : "Entrar"}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <form onSubmit={handleGerarRecuperacao} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
                >
                  {loading ? "Gerando token..." : "Gerar token de recuperação"}
                </button>
              </form>

              <form onSubmit={handleResetarSenha} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Token</label>
                  <input
                    type="text"
                    value={tokenRecuperacao}
                    onChange={(event) => setTokenRecuperacao(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
                    placeholder="Cole o token aqui"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nova senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500"
                    placeholder="Nova senha"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
                >
                  {loading ? "Atualizando..." : "Redefinir senha"}
                </button>
              </form>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={alternarModoCadastro}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {modoCadastro ? "Já tenho conta" : "Criar novo acesso"}
            </button>

            <button
              type="button"
              onClick={alternarModoRecuperacao}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {modoRecuperacao ? "Voltar ao login" : "Recuperar senha"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
