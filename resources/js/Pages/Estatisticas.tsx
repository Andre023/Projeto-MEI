import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Calendar as CalendarIcon, LayoutDashboard, Search } from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";

// Importando os novos sub-componentes
import VisaoGeral from "@/Pages/Estatisticas/VisaoGeral";
import VisaoEspecifica from "@/Pages/Estatisticas/VisaoEspecifica";

// Registrar Chart.js globalmente aqui
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Estatisticas() {
  const [activeTab, setActiveTab] = useState<'geral' | 'especifica'>('geral');

  // Estado de data levantado (compartilhado entre as visões)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Estatísticas e Relatórios" />

      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* --- CABEÇALHO E CONTROLES --- */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">

            {/* Botões de Aba (Transformados em botões grandes e claros) */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
              <button
                onClick={() => setActiveTab('geral')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'geral'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <LayoutDashboard size={18} />
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('especifica')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'especifica'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <Search size={18} />
                Por Produto
              </button>
            </div>

            {/* Filtro de Datas (Global) */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
              <CalendarIcon size={18} className="text-gray-500 ml-2" />
              <input
                type="date"
                name="start_date"
                value={dateRange.start_date}
                onChange={handleDateChange}
                className="border-none text-sm text-gray-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                name="end_date"
                value={dateRange.end_date}
                onChange={handleDateChange}
                className="border-none text-sm text-gray-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* --- CONTEÚDO CONDICIONAL --- */}
          <div className="transition-all duration-300">
            {activeTab === 'geral' ? (
              <VisaoGeral dateRange={dateRange} />
            ) : (
              <VisaoEspecifica dateRange={dateRange} />
            )}
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}