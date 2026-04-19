import {
  AuthProfile,
  AuthResponse,
  DashboardResponse,
  NotaFiscal,
  NotaPayload,
  SugestoesResponse,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";
const AUTH_EVENT = "gestao-notas-auth-change";

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
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/**
 * Remove o token salvo ao encerrar a sessão do usuário.
 */
export function limparToken(): void {
  localStorage.removeItem("gestao-notas-token");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/**
 * Informa o nome do evento usado para sincronizar login e logout na interface.
 */
export function obterEventoAuth(): string {
  return AUTH_EVENT;
}

/**
 * Encerra a sessao local quando a API informa que o token expirou ou ficou invalido.
 */
function tratarSessaoExpirada(): void {
  limparToken();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

/**
 * Executa uma requisição HTTP usando o fetch nativo e trata erros de API.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = obterToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };

    if (response.status === 401 && path !== "/auth/login") {
      tratarSessaoExpirada();
      throw new Error("Sessao expirada. Faca login novamente.");
    }
    throw new Error(errorData.message ?? "Ocorreu um erro na requisição.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("text/csv")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

/**
 * Executa uma requisicao publica, sem anexar token de autenticacao.
 */
async function requestPublico<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message ?? "Ocorreu um erro na requisicao publica.");
  }

  return (await response.json()) as T;
}

/**
 * Baixa um arquivo autenticado e preserva o nome enviado pela API.
 */
async function requestArquivo(
  path: string,
  options: RequestInit = {},
): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  const token = obterToken();
  const headers = new Headers(options.headers);

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

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const fileName = disposition.match(/filename="?([^"]+)"?/)?.[1] ?? "exportacao-notas";

  return {
    blob: await response.blob(),
    fileName,
    contentType: response.headers.get("Content-Type") ?? "application/octet-stream",
  };
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
 * Solicita um token interno para recuperação de senha.
 */
export function forgotPassword(payload: { email: string }): Promise<{
  message: string;
  resetToken: string;
  expiresAt: string;
}> {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Redefine a senha com base em um token temporário.
 */
export function resetPassword(payload: { token: string; novaSenha: string }): Promise<{ message: string }> {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Carrega o perfil do usuário autenticado.
 */
export function obterPerfil(): Promise<AuthProfile> {
  return request<AuthProfile>("/auth/profile");
}

/**
 * Busca os dados do dashboard conforme os filtros selecionados.
 */
export function listarNotas(params: {
  periodo: string;
  status: string;
  visao: "ativas" | "arquivadas";
  busca: string;
  page: number;
  pageSize: number;
  sortBy: "urgencia" | "prazo" | "cliente" | "chegada";
  sortOrder: "asc" | "desc";
}): Promise<DashboardResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== "" && valor !== "todos") {
      query.set(chave, String(valor));
    }
  });

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.pageSize) {
    query.set("pageSize", String(params.pageSize));
  }

  query.set("sortBy", params.sortBy);
  query.set("sortOrder", params.sortOrder);

  return request<DashboardResponse>(`/notas?${query.toString()}`);
}

/**
 * Busca notas ativas para a visualizacao publica da TV, sem exigir login.
 */
export function listarNotasTvPublicas(): Promise<{ notas: NotaFiscal[]; atualizadoEm: string }> {
  return requestPublico<{ notas: NotaFiscal[]; atualizadoEm: string }>("/notas/tv-publica");
}

/**
 * Busca sugestões de preenchimento para cidade e destinatário.
 */
export function obterSugestoes(): Promise<SugestoesResponse> {
  return request<SugestoesResponse>("/notas/sugestoes");
}

/**
 * Carrega uma nota fiscal específica para edição.
 */
export function obterNota(id: string): Promise<NotaFiscal> {
  return request<NotaFiscal>(`/notas/${id}`);
}

/**
 * Marca uma nota fiscal como entregue e arquiva o registro.
 */
export function marcarNotaComoEntregue(id: string): Promise<NotaFiscal> {
  return request<NotaFiscal>(`/notas/${id}/entregar`, {
    method: "POST",
  });
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

/**
 * Exporta as notas filtradas no formato escolhido pelo usuário.
 */
export function exportarNotas(params: {
  periodo: string;
  status: string;
  visao: "ativas" | "arquivadas";
  busca: string;
  sortBy: "urgencia" | "prazo" | "cliente" | "chegada";
  sortOrder: "asc" | "desc";
  formato: "pdf" | "csv" | "excel";
}): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== "" && valor !== "todos") {
      query.set(chave, String(valor));
    }
  });

  query.set("sortBy", params.sortBy);
  query.set("sortOrder", params.sortOrder);
  query.set("formato", params.formato);

  return requestArquivo(`/notas/exportar?${query.toString()}`);
}
