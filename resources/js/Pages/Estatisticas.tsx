import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Package
} from "lucide-react";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  faturamento: number;
  lucro: number;
  vendas_count: number;
  clientes_count: number;
  ticket_medio: number;
  grafico_vendas: { mes: string; total: number }[];
  estoque_baixo: { id: number; nome: string; quantidade_estoque: number }[];
  top_produtos: { nome: string; total_vendido: number }[];
}

export default function Estatisticas() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/estatisticas");
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading || !data) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-screen text-gray-500">
          Carregando dashboard...
        </div>
      </AuthenticatedLayout>
    );
  }

  // Configuração do Gráfico de Linha (Vendas Mensais)
  const lineChartData = {
    labels: data.grafico_vendas.map((d) => {
      const [ano, mes] = d.mes.split("-");
      return `${mes}/${ano}`;
    }),
    datasets: [
      {
        label: "Faturamento Mensal",
        data: data.grafico_vendas.map((d) => d.total),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  };

  // Configuração do Gráfico de Barra (Top Produtos)
  const barChartData = {
    labels: data.top_produtos.map((p) => p.nome),
    datasets: [
      {
        label: "Unidades Vendidas",
        data: data.top_produtos.map((p) => p.total_vendido),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
      },
    ],
  };

  return (
    <AuthenticatedLayout>
      <Head title="Estatísticas" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* --- CARDS DE RESUMO --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Faturamento */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.faturamento)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Lucro Estimado */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Lucro Estimado</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.lucro)}</p>
                  <p className="text-xs text-green-600 mt-1">Margem: {data.faturamento > 0 ? ((data.lucro / data.faturamento) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Vendas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendas Realizadas</p>
                  <p className="text-2xl font-bold text-gray-800">{data.vendas_count}</p>
                  <p className="text-xs text-gray-500 mt-1">Ticket Médio: {formatCurrency(data.ticket_medio)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Clientes */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Base de Clientes</p>
                  <p className="text-2xl font-bold text-gray-800">{data.clientes_count}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* --- GRÁFICOS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Linha */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução do Faturamento</h3>
              <div className="h-64">
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Produtos Mais Vendidos</h3>
              <div className="h-64">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const, // Barra horizontal
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>
          </div>

          {/* --- TABELAS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alerta de Estoque */}
            <div className="bg-white rounded-lg shadow-sm col-span-1 lg:col-span-1">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50 rounded-t-lg">
                <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                  <AlertTriangle size={20} /> Estoque Crítico
                </h3>
              </div>
              <div className="p-4">
                {data.estoque_baixo.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum produto com estoque baixo.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {data.estoque_baixo.map((prod) => (
                      <li key={prod.id} className="py-3 flex justify-between items-center">
                        <span className="text-gray-700 font-medium truncate pr-2">{prod.nome}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${prod.quantidade_estoque === 0 ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {prod.quantidade_estoque} un
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Lista de Top Produtos (Texto) */}
            <div className="bg-white rounded-lg shadow-sm col-span-1 lg:col-span-2">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={20} className="text-blue-500" /> Detalhes dos Campeões de Venda
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-semibold">
                    <tr>
                      <th className="p-4">Produto</th>
                      <th className="p-4 text-center">Unidades Vendidas</th>
                      <th className="p-4 text-right">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.top_produtos.map((prod, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{prod.nome}</td>
                        <td className="p-4 text-center">{prod.total_vendido}</td>
                        <td className="p-4 text-right">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 inline-block max-w-[100px]">
                            <div
                              className="bg-green-500 h-2.5 rounded-full"
                              style={{ width: `${(prod.total_vendido / Math.max(...data.top_produtos.map(p => p.total_vendido))) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}