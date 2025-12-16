import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Produto, CategoriaArvore } from '@/types';
import { Search, PackagePlus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useDebounce } from "@uidotdev/usehooks";

interface Props {
  onAddProduto: (produto: Produto) => void;
}

const CatalogoProdutos: React.FC<Props> = ({ onAddProduto }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [arvore, setArvore] = useState<CategoriaArvore[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("");
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<string>("");
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>("");
  const [selectedSubgrupoId, setSelectedSubgrupoId] = useState<string>("");

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

  const fetchProdutos = useCallback(async (pagina: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('per_page', String(itemsPerPage));
      params.append('page', String(pagina));

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      if (selectedSubgrupoId) params.append('subgrupo_id', selectedSubgrupoId);
      else if (selectedGrupoId) params.append('grupo_id', selectedGrupoId);
      else if (selectedSubcategoriaId) params.append('subcategoria_id', selectedSubcategoriaId);
      else if (selectedCategoriaId) params.append('categoria_id', selectedCategoriaId);

      const response = await axios.get(`/api/produtos`, { params });
      const data = response.data;

      setProdutos(data.data || []);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setTotalItems(data.total);

    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, debouncedSearchTerm, selectedCategoriaId, selectedSubcategoriaId, selectedGrupoId, selectedSubgrupoId]);

  useEffect(() => {
    axios.get("/api/arvore")
      .then(res => setArvore(res.data))
      .catch(err => console.error("Erro ao buscar árvore:", err));
  }, []);

  useEffect(() => {
    fetchProdutos(1);
  }, [fetchProdutos]);

  const handlePageChange = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= lastPage) {
      fetchProdutos(novaPagina);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategoriaId("");
    setSelectedSubcategoriaId("");
    setSelectedGrupoId("");
    setSelectedSubgrupoId("");
    setSearchTerm("");
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Busca */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        <select
          value={selectedCategoriaId}
          onChange={(e) => { setSelectedCategoriaId(e.target.value); setSelectedSubcategoriaId(""); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
          className="w-full py-1.5 px-2 border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Categoria</option>
          {arvore.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
        </select>
        <select
          value={selectedSubcategoriaId}
          onChange={(e) => { setSelectedSubcategoriaId(e.target.value); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
          disabled={!selectedCategoriaId}
          className="w-full py-1.5 px-2 border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Subcategoria</option>
          {subcategoriaOptions.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select
          value={selectedGrupoId}
          onChange={(e) => { setSelectedGrupoId(e.target.value); setSelectedSubgrupoId(""); }}
          disabled={!selectedSubcategoriaId}
          className="w-full py-1.5 px-2 border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Grupo</option>
          {grupoOptions.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
        </select>
        <select
          value={selectedSubgrupoId}
          onChange={(e) => setSelectedSubgrupoId(e.target.value)}
          disabled={!selectedGrupoId}
          className="w-full py-1.5 px-2 border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Subgrupo</option>
          {subgrupoOptions.map(sg => <option key={sg.id} value={sg.id}>{sg.nome}</option>)}
        </select>
      </div>

      {(selectedCategoriaId || debouncedSearchTerm) && (
        <button onClick={handleResetFilters} className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1 shrink-0">
          <X size={12} /> Limpar filtros
        </button>
      )}

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto min-h-[300px] border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50 p-1 custom-scrollbar relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex justify-center items-center z-10">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 w-6 h-6" />
          </div>
        )}

        {produtos.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400 text-sm">
            <p>Nenhum produto encontrado.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-1">
          {produtos.map(produto => {
            const temEstoque = (produto.quantidade_estoque ?? 0) > 0;
            return (
              <button
                key={produto.id}
                onClick={() => onAddProduto(produto)}
                disabled={!temEstoque}
                className={`
                  flex justify-between items-center p-2 rounded border text-left transition-all
                  ${temEstoque
                    ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60 cursor-not-allowed'}
                `}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{produto.nome}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mt-0.5">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                      {formatCurrency(produto.preco)}
                    </span>
                    <span>Estoque: {produto.quantidade_estoque ?? 0}</span>
                  </div>
                </div>
                {temEstoque && <PackagePlus size={18} className="text-blue-500 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rodapé de Paginação */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 gap-2 shrink-0">

          <div className="relative">
            <select
              id="itemsPerPageSelect"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="appearance-none border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Página {currentPage} de {lastPage}
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Página Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage || isLoading}
              className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Próxima Página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoProdutos;