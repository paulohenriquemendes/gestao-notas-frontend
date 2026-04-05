import { AuthResponse, DashboardResponse, NotaFiscal, NotaPayload } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

/**
 * Lê o token salvo no navegador para autenticar as requisições protegidas.
 */
export function obterToken(): string | null {
  return localStorage.getItem("gestao-notas-token");
}

/**
 * Salva o token JWT após login ou cadastro bem-sucedido.
 */
export function salvarToken(token: string): void {
  localStorage.setItem("gestao-notas-token", token);
}

/**
 * Remove o token salvo ao encerrar a sessão do usuário.
 */
export function limparToken(): void {
  localStorage.removeItem("gestao-notas-token");
}

/**
 * Executa uma requisição HTTP usando o fetch nativo e trata erros de API.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = obterToken();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message ?? "Ocorreu um erro na requisição.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Cadastra um novo usuário na API.
 */
export function cadastrar(payload: {
  nome: string;
  email: string;
  senha: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Autentica um usuário e obtém o token JWT.
 */
export function login(payload: { email: string; senha: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Busca os dados do dashboard conforme os filtros selecionados.
 */
export function listarNotas(periodo: string, status: string): Promise<DashboardResponse> {
  const params = new URLSearchParams();

  if (periodo && periodo !== "todos") {
    params.set("periodo", periodo);
  }

  if (status && status !== "todos") {
    params.set("status", status);
  }

  const query = params.toString();
  return request<DashboardResponse>(`/notas${query ? `?${query}` : ""}`);
}

/**
 * Carrega uma nota fiscal específica para edição.
 */
export function obterNota(id: string): Promise<NotaFiscal> {
  return request<NotaFiscal>(`/notas/${id}`);
}

/**
 * Cria uma nova nota fiscal.
 */
export function criarNota(payload: NotaPayload): Promise<NotaFiscal> {
  return request<NotaFiscal>("/notas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Atualiza uma nota fiscal existente.
 */
export function atualizarNota(id: string, payload: NotaPayload): Promise<NotaFiscal> {
  return request<NotaFiscal>(`/notas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Exclui uma nota fiscal do usuário autenticado.
 */
export function excluirNota(id: string): Promise<void> {
  return request<void>(`/notas/${id}`, {
    method: "DELETE",
  });
}
