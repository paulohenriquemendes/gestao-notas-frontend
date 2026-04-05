import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardResumo } from "../types";

interface GraficoSimplesProps {
  resumo: DashboardResumo;
}

/**
 * Converte o resumo do dashboard em dados prontos para o gráfico de barras.
 */
function montarDados(resumo: DashboardResumo) {
  return [
    { nome: "Atrasadas", total: resumo.atrasadas, cor: "#ef4444" },
    { nome: "Vencendo", total: resumo.vencendo, cor: "#f59e0b" },
    { nome: "No prazo", total: resumo.noPrazo, cor: "#22c55e" },
  ];
}

/**
 * Exibe uma visualização simples da distribuição das notas por criticidade.
 */
export function GraficoSimples({ resumo }: GraficoSimplesProps) {
  const dados = montarDados(resumo);

  return (
    <div className="rounded-2xl border border-brand-100/70 bg-white/95 p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Distribuição por status</h2>
        <p className="text-sm text-slate-500">Visão rápida da criticidade atual das notas fiscais.</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="nome" stroke="#64748b" />
            <YAxis allowDecimals={false} stroke="#64748b" />
            <Tooltip />
            <Bar dataKey="total" radius={[10, 10, 0, 0]}>
              {dados.map((item) => (
                <Cell key={item.nome} fill={item.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
