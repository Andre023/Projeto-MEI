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
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Package,
  Archive,
  Trophy,
  Calendar as CalendarIcon
} from "lucide-react";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  valor_estoque: number;
  grafico_vendas: { mes: string; total: number }[];
  estoque_baixo: { id: number; nome: string; quantidade_estoque: number }[];
  top_produtos: { nome: string; total_vendido: number; valor_total: number }[];
  vendas_por_grupo: { nome: string; total: number }[];
  top_clientes: { nome: string; compras: number; total: number }[];
}

export default function Estatisticas() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para os filtros de data (Padrão: últimos 30 dias)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/estatisticas", {
        params: {
          start_date: dateRange.start_date,
          end_date: dateRange.end_date
        }
      });
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas", error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega quando as datas mudam
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!data && loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-48 bg-gray-300 rounded mb-4"></div>
            <p className="text-gray-500 text-sm">Carregando indicadores...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Cores para gráficos
  const chartColors = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Green
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(107, 114, 128, 0.8)',  // Gray
  ];

  // Configuração Gráfico de Linha
  const lineChartData = data ? {
    labels: data.grafico_vendas.map((d) => {
      // Formata data dependendo se vem YYYY-MM-DD ou YYYY-MM
      const parts = d.mes.split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : `${parts[1]}/${parts[0]}`;
    }),
    datasets: [
      {
        label: "Faturamento",
        data: data.grafico_vendas.map((d) => d.total),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  } : { labels: [], datasets: [] };

  // Configuração Gráfico de Rosca
  const doughnutChartData = data ? {
    labels: data.vendas_por_grupo.map((g) => g.nome),
    datasets: [
      {
        data: data.vendas_por_grupo.map((g) => g.total),
        backgroundColor: chartColors,
        borderWidth: 0,
      },
    ],
  } : { labels: [], datasets: [] };

  return (
    <AuthenticatedLayout>
      <Head title="Painel de Controle" />

      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* --- CABEÇALHO E FILTROS --- */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>

            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
              <CalendarIcon size={18} className="text-gray-500 ml-2" />
              <input
                type="date"
                name="start_date"
                value={dateRange.start_date}
                onChange={handleDateChange}
                className="border-none text-sm text-gray-600 focus:ring-0"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                name="end_date"
                value={dateRange.end_date}
                onChange={handleDateChange}
                className="border-none text-sm text-gray-600 focus:ring-0"
              />
            </div>
          </div>

          {data && (
            <>
              {/* --- CARDS DE KPIs --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Faturamento */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Faturamento</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.faturamento)}</p>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <DollarSign size={20} />
                    </div>
                  </div>
                </div>

                {/* Lucro */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lucro Estimado</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.lucro)}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {data.faturamento > 0 ? ((data.lucro / data.faturamento) * 100).toFixed(1) : 0}% Margem
                      </span>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>

                {/* Vendas */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendas</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{data.vendas_count}</p>
                      <p className="text-xs text-gray-400 mt-1">Ticket: {formatCurrency(data.ticket_medio)}</p>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                </div>

                {/* Valor Estoque */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor em Estoque</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.valor_estoque)}</p>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Archive size={20} />
                    </div>
                  </div>
                </div>

                {/* Clientes */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clientes Total</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{data.clientes_count}</p>
                    </div>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- GRÁFICOS --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="text-base font-semibold text-gray-800 mb-6">Evolução Financeira</h3>
                  <div className="h-72">
                    <Line
                      data={lineChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => formatCurrency(ctx.parsed.y)
                            }
                          }
                        },
                        scales: {
                          y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                          x: { grid: { display: false } }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-6">Vendas por Grupo</h3>
                  <div className="h-64 flex justify-center">
                    {data.vendas_por_grupo.length > 0 ? (
                      <Doughnut
                        data={doughnutChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                            tooltip: {
                              callbacks: {
                                label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw as number)}`
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <p className="text-gray-400 text-sm self-center">Sem dados no período.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* --- TABELAS --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Produtos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Package size={18} className="text-blue-500" /> Produtos Mais Vendidos
                    </h3>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                          <th className="px-5 py-3">Produto</th>
                          <th className="px-5 py-3 text-center">Qtd.</th>
                          <th className="px-5 py-3 text-right">Total Gerado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.top_produtos.map((prod, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-medium text-gray-700">{prod.nome}</td>
                            <td className="px-5 py-3 text-center text-gray-600">{prod.total_vendido}</td>
                            <td className="px-5 py-3 text-right font-medium text-gray-800">{formatCurrency(prod.valor_total)}</td>
                          </tr>
                        ))}
                        {data.top_produtos.length === 0 && (
                          <tr><td colSpan={3} className="p-4 text-center text-gray-400">Sem vendas no período.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Alertas Estoque */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-600" />
                      <h3 className="font-semibold text-red-800 text-sm">Estoque Baixo</h3>
                    </div>
                    <div className="p-0">
                      {data.estoque_baixo.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm">Tudo certo com o estoque.</p>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {data.estoque_baixo.map((prod) => (
                            <li key={prod.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                              <span className="text-gray-700 text-sm truncate w-2/3">{prod.nome}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${prod.quantidade_estoque === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {prod.quantidade_estoque} un
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Top Clientes */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                      <Trophy size={18} className="text-yellow-500" />
                      <h3 className="font-semibold text-gray-800 text-sm">Melhores Clientes</h3>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {data.top_clientes.map((cli, i) => (
                        <li key={i} className="p-3 flex justify-between items-center hover:bg-gray-50">
                          <div className="flex flex-col">
                            <span className="text-gray-700 text-sm font-medium">{cli.nome}</span>
                            <span className="text-xs text-gray-400">{cli.compras} compras</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-600">{formatCurrency(cli.total)}</span>
                        </li>
                      ))}
                      {data.top_clientes.length === 0 && <p className="p-4 text-gray-400 text-sm">Sem dados de clientes.</p>}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </AuthenticatedLayout>
  );
}