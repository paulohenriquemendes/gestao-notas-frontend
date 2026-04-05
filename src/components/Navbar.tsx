import { Link, useNavigate } from "react-router-dom";
import { limparToken } from "../services/api";

interface NavbarProps {
  isAuthenticated: boolean;
}

/**
 * Exibe a navegação principal e permite encerrar a sessão com segurança.
 */
export function Navbar({ isAuthenticated }: NavbarProps) {
  const navigate = useNavigate();

  /**
   * Remove o token local e redireciona o usuário para a tela de login.
   */
  function handleLogout() {
    limparToken();
    navigate("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to={isAuthenticated ? "/" : "/login"} className="text-xl font-bold text-slate-800">
          Gestão de Notas
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              to="/notas/nova"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Nova nota
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex gap-2 text-sm font-medium">
            <Link to="/login" className="text-slate-600 hover:text-brand-700">
              Login
            </Link>
            <Link to="/cadastro" className="text-slate-600 hover:text-brand-700">
              Cadastro
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
