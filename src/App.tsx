import { ReactElement, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ToastContainer } from "./components/ToastContainer";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { NotaForm } from "./pages/NotaForm";
import { NotasTv } from "./pages/NotasTv";
import { obterEventoAuth, obterToken } from "./services/api";

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
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(obterToken()));
  const location = useLocation();
  const isTvRoute = location.pathname.startsWith("/tv/notas");

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(Boolean(obterToken()));
    };

    window.addEventListener(obterEventoAuth(), syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(obterEventoAuth(), syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <ToastContainer />
      {!isTvRoute ? <Navbar isAuthenticated={isAuthenticated} /> : null}

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
        <Route
          path="/tv/notas"
          element={<NotasTv />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
