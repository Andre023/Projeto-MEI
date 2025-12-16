import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import {
  ShoppingBag,
  Users,
  Package,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Wallet,
  Activity
} from "lucide-react";
import { User } from "@/types";

interface DashboardData {
  kpi: {
    faturamento: number;
    lucro: number;
    vendas: number;
    clientes_total: number;
    ticket_medio: number;
    valor_estoque: number;
  };
  estoque_baixo: { id: number; nome: string; quantidade_estoque: number }[];
}

export default function Dashboard() {
  const { user } = usePage().props.auth as { user: User };
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/estatisticas");
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
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

  return (
    <AuthenticatedLayout>
      <Head title="Início" />

      {/* Fundo geral escuro */}
      <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* --- SEÇÃO DE BOAS-VINDAS --- */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {getGreeting()}, {user.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Aqui está o resumo do que está acontecendo no seu negócio hoje.
              </p>
            </div>
            <Link
              href={route('vendas.create')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Nova Venda
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          ) : data ? (
            <>
              {/* --- INDICADORES --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card Faturamento */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faturamento (30d)</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(data.kpi.faturamento)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Wallet size={24} />
                    </div>
                  </div>
                </div>

                {/* Card Vendas */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendas Realizadas</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{data.kpi.vendas}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                      <ShoppingBag size={24} />
                    </div>
                  </div>
                </div>

                {/* Card Clientes */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Base de Clientes</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{data.kpi.clientes_total}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                      <Users size={24} />
                    </div>
                  </div>
                </div>

                {/* Card Lucro */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lucro Estimado</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(data.kpi.lucro)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                      <TrendingUp size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- AÇÕES E ALERTAS --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Ações Rápidas */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <Activity size={20} className="text-gray-400" /> Acesso Rápido
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Botão Clientes */}
                    <Link href={route('clientes')} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Users size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Gerenciar Clientes</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Cadastrar ou editar contatos</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Botão Produtos */}
                    <Link href={route('produtos')} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
                          <Package size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Catálogo de Produtos</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Gerenciar estoque e preços</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Botão Estatísticas */}
                    <Link href={route('estatisticas')} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Relatórios Detalhados</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Ver gráficos e análises</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>

                {/* Alertas de Estoque */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 flex justify-between items-center">
                    <h3 className="font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle size={18} /> Atenção ao Estoque
                    </h3>
                    <Link href={route('produtos')} className="text-xs font-medium text-red-700 dark:text-red-400 hover:underline">
                      Ver todos
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[300px] p-2">
                    {data.estoque_baixo && data.estoque_baixo.length > 0 ? (
                      <ul className="space-y-1">
                        {data.estoque_baixo.map((item) => (
                          <li key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate">{item.nome}</span>
                            </div>
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-md shrink-0">
                              {item.quantidade_estoque} un
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <Package size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Seu estoque está saudável!</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Não foi possível carregar os dados.
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}