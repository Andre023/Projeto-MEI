import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { User, Venda, PaginatedVendas, Cliente } from "@/types";
import { Plus, Trash2, ChevronUp, ChevronDown, Search, Filter, Eye } from "lucide-react";
import VendaFormModal from "@/Pages/Vendas/VendaFormModal";
import VendaDetalhesModal from "@/Pages/Vendas/VendaDetalhesModal";
import { Link } from '@inertiajs/react';

interface VendasPageProps {
  auth: {
    user: User;
  };
}

const Vendas: React.FC<VendasPageProps> = ({ auth }) => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Venda | null; direction: "asc" | "desc" }>({
    key: 'id',
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // --- Estados dos Modais (ainda não implementados) ---
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [vendaEdicao, setVendaEdicao] = useState<Venda | null>(null);
  const [vendaDetalhes, setVendaDetalhes] = useState<Venda | null>(null);
  // --- Fim Estados dos Modais ---

  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // --- Filtros (Simplificados para Vendas) ---
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  // (Poderíamos adicionar filtros de data aqui)

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  // Estado de Loading
  const [isLoading, setIsLoading] = useState(true);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // --- LÓGICA DE BUSCA DE VENDAS ---
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
      setItemsPerPage(data.per_page);
      setStartIndex(data.from ? data.from - 1 : 0);
      setEndIndex(data.to ? data.to : 0);

    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage, itemsPerPage, searchTerm, sortConfig, selectedClienteId
  ]);
  const fetchClientes = async () => {
    try {
      const response = await axios.get('/api/clientes', { params: { per_page: -1 } });
      setClientes(response.data.data || response.data); // Ajuste caso a API pagine ou não
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  useEffect(() => {
    fetchClientes();
  }, []);

  // Resetar página ao mudar filtros
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, itemsPerPage, sortConfig, selectedClienteId]);

  const handleResetFilters = () => {
    setSelectedClienteId("");
    setSearchTerm("");
    setIsFilterBarOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita e NÃO reverte o estoque.")) return;
    try {
      await axios.delete(`/api/vendas/${id}`);
      fetchVendas(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao excluir venda:", error);
    }
  };

  const handleSort = (key: keyof Venda) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Venda) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline ml-1 w-4 h-4" />
    ) : (
      <ChevronDown className="inline ml-1 w-4 h-4" />
    );
  };

  const formatCurrency = (value: number | null | undefined) => {
    const numValue = value || 0;
    return numValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID da Venda ou Nome do Cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                className={`inline-flex items-center px-4 py-2 border rounded-md font-semibold text-xs uppercase tracking-widest transition ease-in-out duration-150
                                ${isFilterBarOpen ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
              >
                <Filter size={16} className="mr-2" />
                Filtros
              </button>
              <Link
                href={route('vendas.create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Nova Venda
              </Link>
            </div>
          </div>
          <div className={`
                        transition-all duration-300 ease-in-out overflow-hidden 
                        ${isFilterBarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                    `}>
            <div className="p-4 bg-white shadow-sm sm:rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="filtro_cliente" className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    id="filtro_cliente"
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  >
                    <option value="">Todos os Clientes</option>
                    {clientes.map(cli => (
                      <option key={cli.id} value={cli.id}>{cli.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-5 flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- Tabela Desktop --- */}
          <div className="hidden md:block overflow-x-auto min-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-700">
                <tr>
                  <th onClick={() => handleSort("id")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                    Venda ID {getSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("cliente_id")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                    Cliente {getSortIcon("cliente_id")}
                  </th>
                  <th onClick={() => handleSort("total_venda")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                    Total {getSortIcon("total_venda")}
                  </th>
                  <th onClick={() => handleSort("created_at")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                    Data {getSortIcon("created_at")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!isLoading && vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{venda.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-left max-w-sm truncate" title={venda.cliente?.nome}>
                      {venda.cliente?.nome || "Cliente não encontrado"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-center">
                      {formatCurrency(venda.total_venda)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                      {formatDate(venda.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setVendaDetalhes(venda);
                          setIsDetalhesModalOpen(true);
                        }}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition duration-150"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(venda.id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 transition duration-150"
                        title="Excluir Venda"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">Carregando...</td>
                  </tr>
                )}
                {!isLoading && totalItems === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">Nenhuma venda encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* --- Fim Tabela Desktop --- */}

          {/* --- Paginação (Idêntica à de Produtos) --- */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5">
                  <label htmlFor="itemsPerPageSelect" className="font-medium text-gray-700 whitespace-nowrap">
                    Itens por página:
                  </label>
                  <select
                    id="itemsPerPageSelect"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span className="text-gray-600 whitespace-nowrap">
                  Mostrando {startIndex + 1} a {endIndex} de {totalItems} vendas
                </span>
              </div>
              <div className="inline-flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-500 px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </AuthenticatedLayout>
  );
};

export default Vendas;