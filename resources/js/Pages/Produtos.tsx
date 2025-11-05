import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { User, Produto, Categoria } from "@/types";
import EstoqueModal from "@/Pages/Produtos/EstoqueModal";
import ProdutoFormModal from "@/Pages/Produtos/ProdutoFormModal";
import HistoricoModal from "@/Pages/Produtos/HistoricoModal";
import { Plus, Edit, Trash2, Box, ScrollText, ChevronUp, ChevronDown, Search } from "lucide-react";

interface ProdutosPageProps {
    auth: {
        user: User;
    };
}

const Produtos: React.FC<ProdutosPageProps> = ({ auth }) => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Produto | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc",
    });

    const [searchTerm, setSearchTerm] = useState("");

    // Modais
    const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState(false);
    const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [produtoEstoque, setProdutoEstoque] = useState<Produto | null>(null);
    const [produtoEdicao, setProdutoEdicao] = useState<Produto | null>(null);
    const [produtoHistorico, setProdutoHistorico] = useState<Produto | null>(null);

    // Estados de paginação (Corretos)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const fetchProdutos = async () => {
        try {
            const response = await axios.get("/api/produtos");
            setProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await axios.get("/api/categorias");
            setCategorias(response.data);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    };

    useEffect(() => {
        fetchProdutos();
        fetchCategorias();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            await axios.delete(`/api/produtos/${id}`);
            fetchProdutos();
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
        }
    };

    const handleSort = (key: keyof Produto) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const filteredProdutos = produtos.filter((produto) => {
        const termo = searchTerm.toLowerCase();
        return (
            produto.nome?.toLowerCase().includes(termo) ||
            produto.codigo?.toLowerCase().includes(termo) ||
            produto.id.toString().includes(termo)
        );
    });

    const sortedProdutos = React.useMemo(() => {
        const sorted = [...filteredProdutos];
        if (sortConfig.key !== null) {
            const key = sortConfig.key as keyof Produto;
            sorted.sort((a, b) => {
                const aValue = a[key];
                const bValue = b[key];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (typeof aValue === "number" && typeof bValue === "number") {
                    return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
                }
                return sortConfig.direction === "asc"
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            });
        }
        return sorted;
    }, [filteredProdutos, sortConfig]);

    const totalItems = sortedProdutos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const paginatedProdutos = React.useMemo(() => {
        return sortedProdutos.slice(startIndex, endIndex);
    }, [sortedProdutos, startIndex, endIndex]);

    const getSortIcon = (key: keyof Produto) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="inline ml-1 w-4 h-4" />
        ) : (
            <ChevronDown className="inline ml-1 w-4 h-4" />
        );
    };

    return (
        <AuthenticatedLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
                    {/* Barra superior: busca + botão novo produto */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="relative w-full sm:w-1/3">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, código ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setProdutoEdicao(null);
                                setIsProdutoModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Plus size={16} className="mr-2" />
                            Novo Produto
                        </button>
                    </div>

                    {/* Tabela */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto overflow-y-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th onClick={() => handleSort("id")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            ID {getSortIcon("id")}
                                        </th>
                                        <th onClick={() => handleSort("nome")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Nome {getSortIcon("nome")}
                                        </th>
                                        <th onClick={() => handleSort("codigo")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Código {getSortIcon("codigo")}
                                        </th>
                                        <th onClick={() => handleSort("preco")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Preço {getSortIcon("preco")}
                                        </th>
                                        <th onClick={() => handleSort("quantidade_estoque")} className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Estoque {getSortIcon("quantidade_estoque")}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                            Categoria
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedProdutos.map((produto) => (
                                        <tr key={produto.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produto.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.codigo || "N/A"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{produto.quantidade_estoque ?? 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.categoria ? produto.categoria.categoria : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setProdutoHistorico(produto);
                                                        setIsHistoricoModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition duration-150"
                                                    title="Histórico de Alterações"
                                                >
                                                    <ScrollText size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setProdutoEstoque(produto);
                                                        setIsEstoqueModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-full text-cyan-600 hover:bg-cyan-100 transition duration-150"
                                                    title="Movimentar Estoque"
                                                >
                                                    <Box size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setProdutoEdicao(produto);
                                                        setIsProdutoModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition duration-150"
                                                    title="Editar Produto"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(produto.id)}
                                                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition duration-150"
                                                    title="Excluir Produto"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedProdutos.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-6 text-gray-500">
                                                Nenhum produto encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {sortedProdutos.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-4">

                                {/* LADO ESQUERDO: Seletor de Itens + Contagem */}
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5">
                                        <label
                                            htmlFor="itemsPerPageSelect"
                                            className="font-medium text-gray-700 whitespace-nowrap"
                                        >
                                            Itens por página:
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="itemsPerPageSelect"
                                                value={itemsPerPage}
                                                onChange={handleItemsPerPageChange}
                                                className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>
                                    </div>

                                    <span className="text-gray-600 whitespace-nowrap">
                                        Mostrando {startIndex + 1} a {endIndex} de {totalItems} produtos
                                    </span>
                                </div>

                                {/* LADO DIREITO: Botões de Navegação */}
                                <div className="inline-flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-gray-500 px-2">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Próxima
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modais */}
            <EstoqueModal
                isOpen={isEstoqueModalOpen}
                onClose={() => setIsEstoqueModalOpen(false)}
                produto={produtoEstoque}
                onSuccess={() => {
                    setIsEstoqueModalOpen(false);
                    fetchProdutos();
                }}
            />
            <ProdutoFormModal
                isOpen={isProdutoModalOpen}
                onClose={() => setIsProdutoModalOpen(false)}
                produto={produtoEdicao}
                categorias={categorias}
                onSuccess={() => {
                    setIsProdutoModalOpen(false);
                    fetchProdutos();
                }}
            />
            <HistoricoModal
                isOpen={isHistoricoModalOpen}
                onClose={() => setIsHistoricoModalOpen(false)}
                produto={produtoHistorico}
            />
        </AuthenticatedLayout>
    );
};

export default Produtos;