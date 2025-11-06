import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { User, Produto, CategoriaArvore } from "@/types";
import EstoqueModal from "@/Pages/Produtos/EstoqueModal";
import ProdutoFormModal from "@/Pages/Produtos/ProdutoFormModal";
import HistoricoModal from "@/Pages/Produtos/HistoricoModal";
import { Plus, Edit, Trash2, Box, ScrollText, ChevronUp, ChevronDown, Search, Filter, X } from "lucide-react";

interface PaginatedProdutos {
    data: Produto[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
}

interface ProdutosPageProps {
    auth: {
        user: User;
    };
}

const formatSubgrupoPath = (produto: Produto): string => {
    if (!produto.subgrupo) return "N/A";
    const s = produto.subgrupo;
    const g = s.grupo;
    const sb = g?.subcategoria;
    const c = sb?.categoria;
    let path = [c?.nome, sb?.nome, g?.nome, s.nome].filter(Boolean).join(' > ');
    return path || "N/A";
}

const Produtos: React.FC<ProdutosPageProps> = ({ auth }) => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [arvore, setArvore] = useState<CategoriaArvore[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Produto | null; direction: "asc" | "desc" }>({
        key: 'id',
        direction: "desc",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState(false);
    const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
    const [produtoEstoque, setProdutoEstoque] = useState<Produto | null>(null);
    const [produtoEdicao, setProdutoEdicao] = useState<Produto | null>(null);
    const [produtoHistorico, setProdutoHistorico] = useState<Produto | null>(null);

    // Filtros da Árvore
    const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("");
    const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<string>("");
    const [selectedGrupoId, setSelectedGrupoId] = useState<string>("");
    const [selectedSubgrupoId, setSelectedSubgrupoId] = useState<string>("");
    const [mostrarEstoquePositivo, setMostrarEstoquePositivo] = useState(false);
    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");

    // 5. Estados de paginação (controlados pela API)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);

    // 6. Estado de Loading
    const [isLoading, setIsLoading] = useState(true);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    // --- LÓGICA DOS FILTROS DA ÁRVORE (CASCADING) ---
    const subcategoriaOptions = useMemo(() => {
        if (!selectedCategoriaId) return [];
        const cat = arvore.find(c => c.id === Number(selectedCategoriaId));
        return cat?.subcategorias || [];
    }, [selectedCategoriaId, arvore]);

    const grupoOptions = useMemo(() => {
        if (!selectedSubcategoriaId) return [];
        const sub = subcategoriaOptions.find(s => s.id === Number(selectedSubcategoriaId));
        return sub?.grupos || [];
    }, [selectedSubcategoriaId, subcategoriaOptions]);

    const subgrupoOptions = useMemo(() => {
        if (!selectedGrupoId) return [];
        const grp = grupoOptions.find(g => g.id === Number(selectedGrupoId));
        return grp?.subgrupos || [];
    }, [selectedGrupoId, grupoOptions]);

    const fetchProdutos = useCallback(async () => {
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

            if (selectedSubgrupoId) params.append('subgrupo_id', selectedSubgrupoId);
            else if (selectedGrupoId) params.append('grupo_id', selectedGrupoId);
            else if (selectedSubcategoriaId) params.append('subcategoria_id', selectedSubcategoriaId);
            else if (selectedCategoriaId) params.append('categoria_id', selectedCategoriaId);

            if (precoMin) params.append('preco_min', precoMin);
            if (precoMax) params.append('preco_max', precoMax);
            if (mostrarEstoquePositivo) params.append('estoque_positivo', 'true');

            const response = await axios.get<PaginatedProdutos>(`/api/produtos?${params.toString()}`);
            const data = response.data;

            setProdutos(data.data);
            setTotalItems(data.total);
            setTotalPages(data.last_page);
            setCurrentPage(data.current_page);
            setItemsPerPage(data.per_page);
            setStartIndex(data.from ? data.from - 1 : 0);
            setEndIndex(data.to ? data.to : 0);

        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [
        currentPage, itemsPerPage, searchTerm, sortConfig,
        selectedCategoriaId, selectedSubcategoriaId, selectedGrupoId, selectedSubgrupoId,
        precoMin, precoMax, mostrarEstoquePositivo
    ]);


    const fetchArvore = async () => {
        try {
            const response = await axios.get("/api/arvore");
            setArvore(response.data);
        } catch (error) {
            console.error("Erro ao buscar árvore:", error);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, [fetchProdutos]);

    useEffect(() => {
        fetchArvore();
    }, []);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [
        searchTerm, itemsPerPage, sortConfig,
        selectedCategoriaId, selectedSubcategoriaId, selectedGrupoId, selectedSubgrupoId,
        precoMin, precoMax, mostrarEstoquePositivo
    ]);


    const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategoriaId(e.target.value);
        setSelectedSubcategoriaId("");
        setSelectedGrupoId("");
        setSelectedSubgrupoId("");
    };

    const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubcategoriaId(e.target.value);
        setSelectedGrupoId("");
        setSelectedSubgrupoId("");
    };

    const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGrupoId(e.target.value);
        setSelectedSubgrupoId("");
    };

    const handleResetFilters = () => {
        setSelectedCategoriaId("");
        setSelectedSubcategoriaId("");
        setSelectedGrupoId("");
        setSelectedSubgrupoId("");
        setPrecoMin("");
        setPrecoMax("");
        setMostrarEstoquePositivo(false);
        setSearchTerm("");
        setIsFilterBarOpen(false);
    };

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    {/* Barra superior: busca + botão novo produto */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="relative w-full sm:w-1/3">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                id="search_termo"
                                name="search_termo"
                                placeholder="Buscar por nome, código ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                                className={`inline-flex items-center px-4 py-2 border rounded-md font-semibold text-xs uppercase tracking-widest transition ease-in-out duration-150
                                ${isFilterBarOpen
                                        ? 'bg-gray-700 text-white border-gray-700'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter size={16} className="mr-2" />
                                Filtros
                            </button>
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
                    </div>
                    {/* --- BARRA DE FILTROS AVANÇADOS --- */}
                    <div className={`
                        transition-all duration-300 ease-in-out overflow-hidden 
                        ${isFilterBarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                        <div className="p-4 bg-white shadow-sm sm:rounded-lg space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* ... (Filtros Categoria/Subcategoria) ... */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="filtro_cat" className="block text-sm font-medium text-gray-700">Categoria</label>
                                        <select
                                            id="filtro_cat"
                                            value={selectedCategoriaId}
                                            onChange={handleCategoriaChange}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        >
                                            <option value="">Todas as Categorias</option>
                                            {arvore.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="filtro_sub" className="block text-sm font-medium text-gray-700">Subcategoria</label>
                                        <select
                                            id="filtro_sub"
                                            value={selectedSubcategoriaId}
                                            onChange={handleSubcategoriaChange}
                                            disabled={!selectedCategoriaId || subcategoriaOptions.length === 0}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100"
                                        >
                                            <option value="">Todas as Subcategorias</option>
                                            {subcategoriaOptions.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ... (Filtros Grupo/Subgrupo) ... */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="filtro_grp" className="block text-sm font-medium text-gray-700">Grupo</label>
                                        <select
                                            id="filtro_grp"
                                            value={selectedGrupoId}
                                            onChange={handleGrupoChange}
                                            disabled={!selectedSubcategoriaId || grupoOptions.length === 0}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100"
                                        >
                                            <option value="">Todos os Grupos</option>
                                            {grupoOptions.map(grp => (
                                                <option key={grp.id} value={grp.id}>{grp.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="filtro_subgrp" className="block text-sm font-medium text-gray-700">Subgrupo</label>
                                        <select
                                            id="filtro_subgrp"
                                            value={selectedSubgrupoId}
                                            onChange={(e) => setSelectedSubgrupoId(e.target.value)}
                                            disabled={!selectedGrupoId || subgrupoOptions.length === 0}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:bg-gray-100"
                                        >
                                            <option value="">Todos os Subgrupos</option>
                                            {subgrupoOptions.map(subgrp => (
                                                <option key={subgrp.id} value={subgrp.id}>{subgrp.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ... (Filtros Preço) ... */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="filtro_preco_min" className="block text-sm font-medium text-gray-700">Preço (Mín)</label>
                                        <input
                                            type="number"
                                            id="filtro_preco_min"
                                            value={precoMin}
                                            onChange={(e) => setPrecoMin(e.target.value)}
                                            placeholder="R$ 0,00"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="filtro_preco_max" className="block text-sm font-medium text-gray-700">Preço (Máx)</label>
                                        <input
                                            type="number"
                                            id="filtro_preco_max"
                                            value={precoMax}
                                            onChange={(e) => setPrecoMax(e.target.value)}
                                            placeholder="R$ 1.000,00"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* ... (Filtros Outros - Mudança de <label> para <span>) ... */}
                                <div className="space-y-4">
                                    <div>
                                        <span className="block text-sm font-medium text-gray-700">Outros</span>
                                        <div className="mt-2 flex items-center">
                                            <input
                                                id="filtro_estoque"
                                                type="checkbox"
                                                checked={mostrarEstoquePositivo}
                                                onChange={(e) => setMostrarEstoquePositivo(e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="filtro_estoque" className="ml-2 block text-sm text-gray-900">
                                                Mostrar apenas com estoque positivo
                                            </label>
                                        </div>
                                    </div>
                                    <div className="pt-5 flex justify-end">
                                        <button
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-800"
                                        >
                                            <X size={16} className="mr-2" />
                                            Limpar Filtros
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* --- FIM DA BARRA DE FILTROS AVANÇADOS --- */}

                    {/* Tabela e Lista Mobile */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">

                        {/* --- Início da Lista Mobile --- */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {/* 14. Mapear 'produtos' direto */}
                            {isLoading && (
                                <div className="text-center py-6 text-gray-500">Carregando...</div>
                            )}
                            {!isLoading && produtos.length === 0 && (
                                <div className="text-center py-6 text-gray-500">
                                    Nenhum produto encontrado.
                                </div>
                            )}
                            {!isLoading && produtos.map((produto) => (
                                <div key={produto.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-medium text-gray-900 break-words">
                                            {produto.nome}
                                        </span>
                                        <span className="text-sm text-gray-600 font-mono ml-2 flex-shrink-0">
                                            ID: {produto.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div>
                                            <span className="text-gray-500">Preço: </span>
                                            <span className="font-medium text-gray-800">
                                                {produto.preco.toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Estoque: </span>
                                            <span
                                                className={`font-bold ${(produto.quantidade_estoque ?? 0) > 0
                                                        ? "text-green-700"
                                                        : "text-red-600"
                                                    }`}
                                            >
                                                {produto.quantidade_estoque ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                    {produto.codigo && (
                                        <div className="text-sm">
                                            <span className="text-gray-500">Código: </span>
                                            <span className="text-gray-700">{produto.codigo}</span>
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        <span className="text-gray-500">Árvore: </span>
                                        <span className="text-gray-700 break-words">
                                            {formatSubgrupoPath(produto)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-1 pt-3 mt-3 border-t border-gray-100">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* --- Fim da Lista Mobile --- */}

                        {/* Tabela Desktop */}
                        <div className="hidden md:block overflow-x-auto overflow-y-hidden min-h-[500px]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th onClick={() => handleSort("id")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            ID {getSortIcon("id")}
                                        </th>
                                        <th onClick={() => handleSort("nome")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Nome {getSortIcon("nome")}
                                        </th>
                                        <th onClick={() => handleSort("codigo")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Código {getSortIcon("codigo")}
                                        </th>
                                        <th onClick={() => handleSort("preco")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Preço {getSortIcon("preco")}
                                        </th>
                                        <th onClick={() => handleSort("quantidade_estoque")} className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">
                                            Estoque {getSortIcon("quantidade_estoque")}
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider max-w-xs">
                                            Árvore mercadológica
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* 16. Mapear 'produtos' direto */}
                                    {!isLoading && produtos.map((produto) => (
                                        <tr key={produto.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{produto.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{produto.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{produto.codigo || "N/A"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-center">{produto.quantidade_estoque ?? 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate text-center" title={formatSubgrupoPath(produto)}>
                                                {formatSubgrupoPath(produto)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
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
                                    {isLoading && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-6 text-gray-500">
                                                Carregando...
                                            </td>
                                        </tr>
                                    )}
                                    {!isLoading && totalItems === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-6 text-gray-500">
                                                Nenhum produto encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 17. Paginação agora usa 'totalItems' e 'totalPages' do estado */}
                        {totalItems > 0 && (
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
                                        disabled={currentPage === 1 || isLoading}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-gray-500 px-2">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || isLoading}
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
                arvore={arvore}
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
        </AuthenticatedLayout >
    );
};

export default Produtos;