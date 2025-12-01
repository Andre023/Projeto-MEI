import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Search, Package, DollarSign, TrendingUp, TrendingDown,
  Box, Activity, Zap, Target, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, AlertOctagon, Hourglass
} from "lucide-react";
import { Produto } from "@/types";

interface VisaoEspecificaProps {
  dateRange: { start_date: string; end_date: string };
}

interface ProductStats {
  produto_nome: string;
  estoque_atual: number;
  preco_atual: number;
  faturamento: number;
  qtd_vendida: number;
  dias_para_acabar: number;
  share_faturamento: number;
  lucro: number;
  growth_rate: number;
  previsao_proximo_periodo: number;
  tendencia_slope: number;
  grafico_vendas: { mes: string; total: number }[];
}

export default function VisaoEspecifica({ dateRange }: VisaoEspecificaProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Produto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length > 2) {
        axios.get(`/api/produtos?search=${search}&per_page=5`)
          .then(res => setSearchResults(res.data.data))
          .catch(console.error);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Carregar dados
  useEffect(() => {
    if (selectedProduct) {
      setLoadingStats(true);
      axios.get(`/api/estatisticas/produto/${selectedProduct.id}`, { params: dateRange })
        .then(res => setStats(res.data))
        .catch(console.error)
        .finally(() => setLoadingStats(false));
    }
  }, [selectedProduct, dateRange]);

  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Determina a cor baseada na tendência (Slope) ou Crescimento
  const isPositiveTrend = stats ? stats.tendencia_slope >= 0 : true;
  const isPositiveGrowth = stats ? stats.growth_rate >= 0 : true;

  // Cores dinâmicas
  const trendColor = isPositiveTrend ? "text-emerald-600" : "text-rose-600";
  const trendBg = isPositiveTrend ? "bg-emerald-50" : "bg-rose-50";
  const trendBorder = isPositiveTrend ? "border-emerald-100" : "border-rose-100";
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const ArrowIcon = isPositiveGrowth ? ArrowUpRight : ArrowDownRight;

  const trendData = useMemo(() => {
    if (!stats || !stats.grafico_vendas || stats.grafico_vendas.length < 2) return [];

    const n = stats.grafico_vendas.length;
    // Mapeia para X (índice 0, 1, 2...) e Y (valor total)
    const dataPoints = stats.grafico_vendas.map((d, i) => ({ x: i, y: d.total }));

    // Somas necessárias para o método dos Mínimos Quadrados
    const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + (p.x * p.y), 0);
    const sumXX = dataPoints.reduce((acc, p) => acc + (p.x * p.x), 0);

    // Calcula Slope (m) e Intercept (b) da equação y = mx + b
    // Nota: O denominador pode ser zero se todos os X forem iguais, mas aqui X é índice sequencial.
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Gera os pontos da reta para cada dia
    return dataPoints.map(p => slope * p.x + intercept);
  }, [stats]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* --- BARRA DE BUSCA --- */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="relative transform transition-all duration-300 focus-within:scale-105">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Digite o nome do produto para análise avançada..."
            className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg transition-colors bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && !selectedProduct && (
            <div className="absolute z-50 w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto divide-y divide-gray-50">
              {searchResults.map(p => (
                <div
                  key={p.id}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center group/item"
                  onClick={() => {
                    setSelectedProduct(p);
                    setSearch(p.nome);
                    setSearchResults([]);
                  }}
                >
                  <div>
                    <p className="font-semibold text-gray-800 group-hover/item:text-blue-700">{p.nome}</p>
                    <p className="text-xs text-gray-500">Cód: {p.codigo || 'N/A'}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    R$ {p.preco}
                  </span>
                </div>
              ))}
            </div>
          )}
          {selectedProduct && (
            <button
              onClick={() => { setSelectedProduct(null); setSearch(""); setStats(null); }}
              className="absolute right-4 top-4 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              LIMPAR
            </button>
          )}
        </div>
      </div>

      {/* --- EMPTY STATE --- */}
      {!selectedProduct && (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">Aguardando Seleção</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Pesquise um produto acima para ver indicadores de trading, previsões e análise de rentabilidade.</p>
        </div>
      )}

      {/* --- LOADING --- */}
      {loadingStats && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* --- DASHBOARD DO PRODUTO --- */}
      {stats && selectedProduct && !loadingStats && (
        <>
          <div className="flex items-center justify-between border-b pb-4 border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {stats.produto_nome}
                {stats.tendencia_slope > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Em Alta</span>}
                {stats.tendencia_slope < 0 && <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Em Queda</span>}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Análise de desempenho no período selecionado</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-semibold">Preço Atual</p>
              <p className="text-2xl font-black text-gray-800">{formatCurrency(stats.preco_atual)}</p>
            </div>
          </div>

          {/* STATS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* CARD 1: Faturamento & Growth */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${isPositiveGrowth ? 'text-emerald-500' : 'text-rose-500'}`}>
                <Activity size={60} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Faturamento Total</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(stats.faturamento)}</h3>
                <div className={`flex items-center gap-1 text-sm font-semibold ${isPositiveGrowth ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <ArrowIcon size={16} />
                  <span>{Math.abs(stats.growth_rate)}%</span>
                  <span className="text-gray-400 font-normal text-xs ml-1">vs. período anterior</span>
                </div>
              </div>
            </div>

            {/* CARD 2: Lucro Real */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lucro Líquido</p>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={18} /></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(stats.lucro)}</h3>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${stats.faturamento > 0 ? Math.min((stats.lucro / stats.faturamento) * 100, 100) : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-right">{stats.faturamento > 0 ? ((stats.lucro / stats.faturamento) * 100).toFixed(1) : 0}% margem</p>
            </div>

            {/* CARD 3: Previsão (Forecast) */}
            <div className={`p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all ${trendBg} ${trendBorder}`}>
              <div className="flex justify-between items-start mb-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${trendColor}`}>Previsão (Próx. Dia)</p>
                <div className={`p-1.5 rounded-lg bg-white/60 ${trendColor}`}><Target size={18} /></div>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${trendColor}`}>
                {formatCurrency(stats.previsao_proximo_periodo)}
              </h3>
              <p className={`text-xs font-medium ${trendColor} opacity-80 flex items-center gap-1`}>
                <Zap size={12} /> Baseado na tendência linear atual
              </p>
            </div>

            {/* CARD 4: Estoque & Giro */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume & Estoque</p>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Package size={18} /></div>
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{stats.qtd_vendida} <span className="text-sm font-normal text-gray-500">vendidos</span></h3>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Restante:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-xs ${stats.estoque_atual < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {stats.estoque_atual} un
                </span>
              </div>
            </div>
          </div>
          {/* --- SEÇÃO ESTRATÉGICA (NOVA) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">

            {/* CARD 5: RUNWAY DE ESTOQUE (Previsão de Esgotamento) */}
            <div className={`p-5 rounded-2xl shadow-sm border flex items-center justify-between transition-all hover:shadow-md
                            ${stats.dias_para_acabar <= 7 ? 'bg-red-50 border-red-200' :
                stats.dias_para_acabar <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}
            >
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1
                                    ${stats.dias_para_acabar <= 7 ? 'text-red-600' :
                    stats.dias_para_acabar <= 30 ? 'text-amber-600' : 'text-gray-400'}`}
                >
                  Previsão de Ruptura
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.dias_para_acabar === 9999 ? 'Estagnado' :
                    stats.dias_para_acabar === 0 ? 'Esgotado' :
                      `${stats.dias_para_acabar} dias`}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.dias_para_acabar <= 7 && stats.dias_para_acabar > 0 ? 'REPOSIÇÃO URGENTE NECESSÁRIA' :
                    stats.dias_para_acabar === 0 ? 'Você está perdendo vendas!' :
                      'Baseado na velocidade atual'}
                </p>
              </div>
              <div className={`p-3 rounded-xl 
                                ${stats.dias_para_acabar <= 7 ? 'bg-red-100 text-red-600' :
                  stats.dias_para_acabar <= 30 ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}
              >
                {stats.dias_para_acabar <= 7 ? <AlertOctagon size={24} /> : <Hourglass size={24} />}
              </div>
            </div>

            {/* CARD 6: SHARE DE FATURAMENTO (Importância do Produto) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex-1 pr-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Participação no Faturamento
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.share_faturamento}%</h3>
                  <span className="text-xs text-gray-400">da receita total da loja</span>
                </div>
                {/* Barra de progresso visual */}
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(stats.share_faturamento, 2)}%` }} // Minimo 2% visual
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.share_faturamento > 20 ? 'Produto Estrela (Curva A)' :
                    stats.share_faturamento > 5 ? 'Produto Importante (Curva B)' : 'Produto Complementar (Curva C)'}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <PieChart size={24} />
              </div>
            </div>
          </div>

          {/* GRÁFICO PRINCIPAL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendIcon className={trendColor} size={20} />
                Evolução e Tendência
              </h3>
              {/* Legenda Customizada */}
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span> Vendas Reais
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${isPositiveTrend ? 'bg-emerald-400' : 'bg-rose-400'}`}></span> Linha de Tendência
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <Line
                data={{
                  labels: stats.grafico_vendas.map(d => d.mes),
                  datasets: [
                    {
                      label: "Vendas (R$)",
                      data: stats.grafico_vendas.map(d => d.total),
                      borderColor: "#3b82f6",
                      backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
                        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
                        return gradient;
                      },
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      order: 2
                    },
                    {
                      label: "Tendência",
                      data: trendData,
                      borderColor: isPositiveTrend ? "#10b981" : "#f43f5e",
                      borderWidth: 2,
                      borderDash: [5, 5],
                      pointRadius: 0,
                      fill: false,
                      tension: 0,
                      order: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      titleColor: '#1f2937',
                      bodyColor: '#4b5563',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 10,
                      callbacks: {
                        label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f3f4f6' },
                      ticks: { callback: (v) => new Intl.NumberFormat('pt-BR', { notation: "compact" }).format(Number(v)) }
                    },
                    x: {
                      grid: { display: false }
                    }
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}