import React, { useState, useEffect, FormEvent, useCallback } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal"; // Assumindo que este componente existe
import InputLabel from "@/Components/InputLabel"; // Componentes padrão do Breeze
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Search, X } from "lucide-react";

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
}

interface PaginatedClientes {
  data: Cliente[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number;
  to: number;
}

const Clientes: React.FC = () => {
  // Estados de Dados e Controle
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Paginação e Filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Cliente; direction: "asc" | "desc" }>({
    key: 'id',
    direction: "desc",
  });

  // Estados do Formulário/Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('per_page', String(itemsPerPage));
      params.append('sort_key', sortConfig.key);
      params.append('sort_direction', sortConfig.direction);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get<PaginatedClientes>(`/api/clientes?${params.toString()}`);
      const data = response.data;

      setClientes(data.data);
      setTotalItems(data.total);
      setTotalPages(data.last_page);
      setStartIndex(data.from ? data.from - 1 : 0);
      setEndIndex(data.to ? data.to : 0);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchTerm]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Reinicia para página 1 ao buscar
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleSort = (key: keyof Cliente) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Cliente) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingId(cliente.id);
      setNome(cliente.nome);
      setTelefone(cliente.telefone);
    } else {
      setEditingId(null);
      setNome("");
      setTelefone("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNome("");
    setTelefone("");
    setProcessing(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (editingId) {
        await axios.put(`/api/clientes/${editingId}`, { nome, telefone });
      } else {
        await axios.post("/api/clientes", { nome, telefone });
      }
      fetchClientes();
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente. Verifique os dados.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await axios.delete(`/api/clientes/${id}`);
      fetchClientes();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="py-12">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

          {/* Barra de Topo: Busca e Botão Novo */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 transition ease-in-out duration-150"
            >
              <Plus size={16} className="mr-2" />
              Novo Cliente
            </button>
          </div>

          {/* Tabela Responsiva */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-700">
                  <tr>
                    <th onClick={() => handleSort("id")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer w-24">
                      ID {getSortIcon("id")}
                    </th>
                    <th onClick={() => handleSort("nome")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                      Nome {getSortIcon("nome")}
                    </th>
                    <th onClick={() => handleSort("telefone")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                      Telefone {getSortIcon("telefone")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider w-32">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">Carregando...</td></tr>
                  ) : clientes.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">Nenhum cliente encontrado.</td></tr>
                  ) : (
                    clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {cliente.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cliente.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cliente.telefone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleOpenModal(cliente)}
                            className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition duration-150"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition duration-150"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white border border-gray-200 rounded-lg gap-4 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="font-medium">Itens por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-600">
                  {startIndex + 1} - {endIndex} de {totalItems}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      <Modal show={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingId ? "Editar Cliente" : "Novo Cliente"}
            </h2>
            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="mt-4">
            <InputLabel htmlFor="nome" value="Nome" />
            <TextInput
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full"
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div className="mt-4">
            <InputLabel htmlFor="telefone" value="Telefone" />
            <TextInput
              id="telefone"
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="mt-1 block w-full"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={closeModal} disabled={processing}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={processing}>
              {editingId ? "Atualizar" : "Salvar"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Clientes;