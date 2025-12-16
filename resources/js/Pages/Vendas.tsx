import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { User, Venda, PaginatedVendas, Cliente } from "@/types";
import { Plus, Trash2, ChevronUp, ChevronDown, Search, Filter, Eye } from "lucide-react";
import VendaDetalhesModal from "@/Pages/Vendas/VendaDetalhesModal";
import { Link } from '@inertiajs/react';

interface VendasPageProps {
  auth: { user: User; };
}

const Vendas: React.FC<VendasPageProps> = ({ auth }) => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Venda | null; direction: "asc" | "desc" }>({
    key: 'created_at',
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Modal apenas de Detalhes
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [vendaDetalhes, setVendaDetalhes] = useState<Venda | null>(null);

  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendas = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('per_page', String(itemsPerPage));
      if (searchTerm) params.append('search', searchTerm);
      if (sortConfig.key) {
        params.append('sort_key', sortConfig.key);
        params.append('sort_direction', sortConfig.direction);
      }
      if (selectedClienteId) params.append('cliente_id', selectedClienteId);

      const response = await axios.get<PaginatedVendas>(`/api/vendas?${params.toString()}`);
      const data = response.data;

      setVendas(data.data);
      setTotalItems(data.total);
      setTotalPages(data.last_page);
      setCurrentPage(data.current_page);
      setStartIndex(data.from ? data.from : 0);
      setEndIndex(data.to ? data.to : 0);

    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortConfig, selectedClienteId]);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('/api/clientes', { params: { per_page: 100 } });
      setClientes(response.data.data || []);
    } catch (error) {
      console.error("Erro clientes", error);
    }
  };

  useEffect(() => { fetchVendas(); }, [fetchVendas]);
  useEffect(() => { fetchClientes(); }, []);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, itemsPerPage, selectedClienteId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja cancelar esta venda? Os itens serão devolvidos ao estoque.")) return;
    try {
      await axios.delete(`/api/vendas/${id}`);
      fetchVendas();
    } catch (error: any) {
      alert("Erro ao excluir: " + (error.response?.data?.message || "Desconhecido"));
    }
  };

  const handleSort = (key: keyof Venda) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const formatCurrency = (val: number) => val?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatDate = (date: string) => new Date(date).toLocaleString("pt-BR");

  return (
    <AuthenticatedLayout>
      {/* 1. Container Principal Escuro */}
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">

        {/* Header + Busca */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Vendas</h2>

          <div className="flex flex-1 w-full md:w-auto gap-2 justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar ID ou Cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
              className={`p-2 border rounded-md transition-colors ${isFilterBarOpen
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                }`}
            >
              <Filter size={20} />
            </button>
            <Link href={route('vendas.create')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus size={16} className="mr-1" /> Nova Venda
            </Link>
          </div>
        </div>

        {/* Filtros Expansíveis */}
        {isFilterBarOpen && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-fade-in-down border border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Cliente</label>
            <div className="flex gap-2">
              <select
                value={selectedClienteId}
                onChange={(e) => setSelectedClienteId(e.target.value)}
                className="border-gray-300 dark:border-gray-600 rounded-md text-sm w-full md:w-1/3 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">Todos</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <button onClick={() => { setSelectedClienteId(""); setSearchTerm("") }} className="text-sm text-red-600 dark:text-red-400 hover:underline">Limpar</button>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th onClick={() => handleSort("id")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100">ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th onClick={() => handleSort("total_venda")} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Total</th>
                  <th onClick={() => handleSort("created_at")} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Data</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Carregando...</td></tr>
                ) : vendas.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Nenhuma venda encontrada.</td></tr>
                ) : (
                  vendas.map((venda) => (
                    <tr key={venda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">#{venda.id}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{venda.cliente?.nome || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100 font-semibold text-right">{formatCurrency(venda.total_venda)}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">{formatDate(venda.created_at)}</td>
                      <td className="px-6 py-3 text-center text-sm font-medium">
                        <button onClick={() => { setVendaDetalhes(venda); setIsDetalhesModalOpen(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mx-2" title="Detalhes"><Eye size={18} /></button>
                        <button onClick={() => handleDelete(venda.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mx-2" title="Cancelar/Excluir"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Exibindo <span className="font-medium text-gray-700 dark:text-gray-300">{startIndex}</span> a <span className="font-medium text-gray-700 dark:text-gray-300">{endIndex}</span> de <span className="font-medium text-gray-700 dark:text-gray-300">{totalItems}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalhes */}
        <VendaDetalhesModal
          isOpen={isDetalhesModalOpen}
          onClose={() => setIsDetalhesModalOpen(false)}
          venda={vendaDetalhes}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default Vendas;