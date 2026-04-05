import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Cadastro } from "./pages/Cadastro";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { NotaForm } from "./pages/NotaForm";
import { obterToken } from "./services/api";

interface ProtectedRouteProps {
  children: ReactElement;
}

/**
 * Protege as rotas privadas exigindo token JWT salvo no navegador.
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = obterToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Organiza as rotas principais do frontend.
 */
export default function App() {
  const isAuthenticated = Boolean(obterToken());

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/notas/nova"
          element={
            <ProtectedRoute>
              <NotaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notas/:id"
          element={
            <ProtectedRoute>
              <NotaForm />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
