import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Calendar as CalendarIcon, LayoutDashboard, Search } from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";

import VisaoGeral from "@/Pages/Estatisticas/VisaoGeral";
import VisaoEspecifica from "@/Pages/Estatisticas/VisaoEspecifica";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Estatisticas() {
  const [activeTab, setActiveTab] = useState<'geral' | 'especifica'>('geral');

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

      {/* Container Principal Escuro */}
      <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* --- CABEÇALHO --- */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">

            {/* Abas */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex transition-colors">
              <button
                onClick={() => setActiveTab('geral')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'geral'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <LayoutDashboard size={18} />
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('especifica')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'especifica'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Search size={18} />
                Por Produto
              </button>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
              <CalendarIcon size={18} className="text-gray-500 dark:text-gray-400 ml-2" />
              <input
                type="date"
                name="start_date"
                value={dateRange.start_date}
                onChange={handleDateChange}
                className="border-none text-sm text-gray-600 dark:text-gray-300 bg-transparent focus:ring-0 cursor-pointer dark:[color-scheme:dark]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                name="end_date"
                value={dateRange.end_date}
                onChange={handleDateChange}
                className="border-none text-sm text-gray-600 dark:text-gray-300 bg-transparent focus:ring-0 cursor-pointer dark:[color-scheme:dark]"
              />
            </div>
          </div>

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