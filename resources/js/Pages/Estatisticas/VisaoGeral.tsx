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
    return <div className="p-10 text-center text-gray-400 animate-pulse">Carregando painel de rentabilidade...</div>;
  }

  // Proteção de dados (atualizei o objeto kpi padrão com os novos campos)
  const kpi = data.kpi || {
    faturamento: 0, faturamento_growth: 0,
    lucro: 0, lucro_growth: 0,
    vendas: 0, vendas_growth: 0,
    ticket_medio: 0, ticket_medio_growth: 0, // Novo
    novos_clientes: 0, novos_clientes_growth: 0, // Novo
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

      {/* --- CARDS DE KPI PRINCIPAIS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GrowthCard title="Faturamento" value={formatCurrency(kpi.faturamento)} growth={kpi.faturamento_growth} icon={<DollarSign size={22} />} color="blue" />
        <GrowthCard title="Lucro Líquido" value={formatCurrency(kpi.lucro)} growth={kpi.lucro_growth} icon={<TrendingUp size={22} />} color="green" />
        <GrowthCard title="Volume de Vendas" value={kpi.vendas} growth={kpi.vendas_growth} icon={<ShoppingBag size={22} />} color="purple" suffix="pedidos" />
      </div>

      {/* --- WIDGETS ESTRATÉGICOS (PREENCHENDO O BURACO) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* 1. Widget Curva ABC (Já existia) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Curva A (80% Receita)</p>
            <p className="text-xl font-bold text-emerald-600">{curva_abc.A} <span className="text-xs text-gray-500 font-normal">produtos</span></p>
          </div>
          <div className="h-12 w-12"><Doughnut data={abcChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }} /></div>
        </div>

        {/* 2. Widget Ticket Médio (NOVO) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Ticket Médio</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(kpi.ticket_medio)}</p>
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${kpi.ticket_medio_growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {kpi.ticket_medio_growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(kpi.ticket_medio_growth)}% vs. anterior
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CreditCard size={24} />
          </div>
        </div>

        {/* 3. Widget Novos Clientes (NOVO) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Novos Clientes</p>
            <p className="text-xl font-bold text-gray-800">{kpi.novos_clientes} <span className="text-xs text-gray-500 font-normal">cadastros</span></p>
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${kpi.novos_clientes_growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {kpi.novos_clientes_growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(kpi.novos_clientes_growth)}% vs. anterior
            </div>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <UserPlus size={24} />
          </div>
        </div>

      </div>

      {/* --- GRÁFICO E LISTAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Evolução de Faturamento</h3>
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
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }}
            />
          </div>
        </div>

        {/* Top Clientes (Por Lucro) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Clientes Mais Lucrativos</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {top_clientes_lucro.length > 0 ? top_clientes_lucro.map((cli: any, i: number) => (
              <div key={i} className="p-3 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-700">{cli.nome}</p>
                  <p className="text-xs text-gray-400">Fat: {formatCurrency(cli.faturamento)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">+{formatCurrency(cli.lucro)}</p>
                  <p className="text-[10px] text-emerald-400">Lucro</p>
                </div>
              </div>
            )) : (
              <p className="p-4 text-center text-xs text-gray-400">Sem dados de clientes.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- ANÁLISE DE MARGEM --- */}
      <h3 className="text-lg font-bold text-gray-800 mt-4">Análise de Margem de Produtos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Alta Margem */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100">
          <div className="p-4 border-b border-emerald-50 bg-emerald-50/30 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-emerald-800 text-sm">Maiores Margens (%)</h3>
          </div>
          <div className="p-4 space-y-3">
            {produtos_alta_margem.length > 0 ? produtos_alta_margem.map((prod: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 truncate w-2/3">{prod.nome}</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {Math.round(prod.margem_media)}%
                </span>
              </div>
            )) : <p className="text-xs text-gray-400">Sem dados suficientes.</p>}
          </div>
        </div>

        {/* Baixa Margem */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100">
          <div className="p-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-800 text-sm">Margens Críticas (Atenção)</h3>
          </div>
          <div className="p-4 space-y-3">
            {produtos_baixa_margem.length > 0 ? produtos_baixa_margem.map((prod: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 truncate w-2/3">{prod.nome}</span>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full">
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

// Componente Card de Crescimento
const GrowthCard = ({ title, value, growth, icon, color, suffix }: any) => {
  const isPositive = (growth || 0) >= 0;
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? "text-emerald-600" : "text-rose-600";
  const bgClass = isPositive ? "bg-emerald-50" : "bg-rose-50";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass}`}>{icon}</div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${bgClass} ${colorClass}`}>
          <Arrow size={14} />{Math.abs(growth || 0)}%
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value} {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}</h3>
        <p className="text-xs text-gray-400 mt-2">vs. período anterior</p>
      </div>
    </div>
  );
};