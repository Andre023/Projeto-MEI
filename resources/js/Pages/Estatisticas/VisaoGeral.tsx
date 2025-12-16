import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import {
  DollarSign, ShoppingBag, Users, TrendingUp, Archive, Package, ArrowUpRight, ArrowDownRight, Layers, Crown,
  AlertTriangle, CreditCard, UserPlus
} from "lucide-react";

interface VisaoGeralProps {
  dateRange: { start_date: string; end_date: string };
}

export default function VisaoGeral({ dateRange }: VisaoGeralProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/estatisticas", { params: dateRange })
      .then(res => setData(res.data))
      .catch(err => console.error("Erro ao buscar estatísticas:", err))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  if (loading || !data) {
    return <div className="p-10 text-center text-gray-400 dark:text-gray-500 animate-pulse">Carregando painel de rentabilidade...</div>;
  }

  const kpi = data.kpi || {
    faturamento: 0, faturamento_growth: 0,
    lucro: 0, lucro_growth: 0,
    vendas: 0, vendas_growth: 0,
    ticket_medio: 0, ticket_medio_growth: 0,
    novos_clientes: 0, novos_clientes_growth: 0,
    valor_estoque: 0, clientes_total: 0
  };

  const curva_abc = data.curva_abc || { A: 0, B: 0, C: 0 };
  const grafico_vendas = data.grafico_vendas || [];
  const top_clientes_lucro = data.top_clientes_lucro || [];
  const produtos_alta_margem = data.produtos_alta_margem || [];
  const produtos_baixa_margem = data.produtos_baixa_margem || [];

  const abcChartData = {
    labels: ['Curva A', 'Curva B', 'Curva C'],
    datasets: [{
      data: [curva_abc.A, curva_abc.B, curva_abc.C],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GrowthCard title="Faturamento" value={formatCurrency(kpi.faturamento)} growth={kpi.faturamento_growth} icon={<DollarSign size={22} />} color="blue" />
        <GrowthCard title="Lucro Líquido" value={formatCurrency(kpi.lucro)} growth={kpi.lucro_growth} icon={<TrendingUp size={22} />} color="green" />
        <GrowthCard title="Volume de Vendas" value={kpi.vendas} growth={kpi.vendas_growth} icon={<ShoppingBag size={22} />} color="purple" suffix="pedidos" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Curva ABC */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Curva A (80% Receita)</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{curva_abc.A} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">produtos</span></p>
          </div>
          <div className="h-12 w-12"><Doughnut data={abcChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }} /></div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Ticket Médio</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(kpi.ticket_medio)}</p>
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${kpi.ticket_medio_growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {kpi.ticket_medio_growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(kpi.ticket_medio_growth)}% vs. anterior
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <CreditCard size={24} />
          </div>
        </div>

        {/* Novos Clientes */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Novos Clientes</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{kpi.novos_clientes} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">cadastros</span></p>
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${kpi.novos_clientes_growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {kpi.novos_clientes_growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(kpi.novos_clientes_growth)}% vs. anterior
            </div>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <UserPlus size={24} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Evolução de Faturamento</h3>
          <div className="h-64">
            <Line
              data={{
                labels: grafico_vendas.map((d: any) => {
                  if (!d.mes) return "";
                  const p = d.mes.split('-');
                  return p.length === 3 ? `${p[2]}/${p[1]}` : d.mes;
                }),
                datasets: [{
                  label: "Faturamento",
                  data: grafico_vendas.map((d: any) => d.total),
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#9ca3af' } }, y: { beginAtZero: true, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }}
            />
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Clientes Mais Lucrativos</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {top_clientes_lucro.length > 0 ? top_clientes_lucro.map((cli: any, i: number) => (
              <div key={i} className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cli.nome}</p>
                  <p className="text-xs text-gray-400">Fat: {formatCurrency(cli.faturamento)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(cli.lucro)}</p>
                  <p className="text-[10px] text-emerald-400">Lucro</p>
                </div>
              </div>
            )) : (
              <p className="p-4 text-center text-xs text-gray-400">Sem dados de clientes.</p>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-4">Análise de Margem de Produtos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Alta Margem */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/50">
          <div className="p-4 border-b border-emerald-50 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Maiores Margens (%)</h3>
          </div>
          <div className="p-4 space-y-3">
            {produtos_alta_margem.length > 0 ? produtos_alta_margem.map((prod: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate w-2/3">{prod.nome}</span>
                <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                  {Math.round(prod.margem_media)}%
                </span>
              </div>
            )) : <p className="text-xs text-gray-400">Sem dados suficientes.</p>}
          </div>
        </div>

        {/* Baixa Margem */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/50">
          <div className="p-4 border-b border-red-50 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm">Margens Críticas (Atenção)</h3>
          </div>
          <div className="p-4 space-y-3">
            {produtos_baixa_margem.length > 0 ? produtos_baixa_margem.map((prod: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate w-2/3">{prod.nome}</span>
                <span className="text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                  {Math.round(prod.margem_media)}%
                </span>
              </div>
            )) : <p className="text-xs text-gray-400">Sem dados suficientes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const GrowthCard = ({ title, value, growth, icon, color, suffix }: any) => {
  const isPositive = (growth || 0) >= 0;
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const bgClass = isPositive ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-rose-50 dark:bg-rose-900/30";

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass}`}>{icon}</div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${bgClass} ${colorClass}`}>
          <Arrow size={14} />{Math.abs(growth || 0)}%
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value} {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}</h3>
        <p className="text-xs text-gray-400 mt-2">vs. período anterior</p>
      </div>
    </div>
  );
};