import { Link, useNavigate } from "react-router-dom";
import logoEmpresa from "../assets/logo-empresa.svg";
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
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-6 py-4 xl:px-10 2xl:px-12">
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center">
          <img src={logoEmpresa} alt="Logo da empresa" className="h-10 w-auto xl:h-12 2xl:h-14" />
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
