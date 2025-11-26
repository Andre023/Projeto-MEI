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

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtros da Árvore
  const [arvore, setArvore] = useState<CategoriaArvore[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("");
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<string>("");
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>("");
  const [selectedSubgrupoId, setSelectedSubgrupoId] = useState<string>("");

  // --- Lógica Cascata (Mantida) ---
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

  // --- Busca de Dados ---
  const fetchProdutos = useCallback(async (pagina: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('per_page', String(itemsPerPage));
      params.append('page', String(pagina));

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      // Filtros da árvore
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

  // Carregar árvore na montagem
  useEffect(() => {
    axios.get("/api/arvore")
      .then(res => setArvore(res.data))
      .catch(err => console.error("Erro ao buscar árvore:", err));
  }, []);

  // Resetar para página 1 ao mudar filtros
  useEffect(() => {
    fetchProdutos(1);
  }, [fetchProdutos]); // A dependência fetchProdutos já engloba os filtros

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
    // O useEffect disparará a busca automaticamente
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Busca e Configuração */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        <select
          value={selectedCategoriaId}
          onChange={(e) => { setSelectedCategoriaId(e.target.value); setSelectedSubcategoriaId(""); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
          className="w-full py-1.5 px-2 border-gray-300 rounded text-xs focus:ring-blue-500"
        >
          <option value="">Categoria</option>
          {arvore.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
        </select>
        <select
          value={selectedSubcategoriaId}
          onChange={(e) => { setSelectedSubcategoriaId(e.target.value); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
          disabled={!selectedCategoriaId}
          className="w-full py-1.5 px-2 border-gray-300 rounded text-xs focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Subcategoria</option>
          {subcategoriaOptions.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select
          value={selectedGrupoId}
          onChange={(e) => { setSelectedGrupoId(e.target.value); setSelectedSubgrupoId(""); }}
          disabled={!selectedSubcategoriaId}
          className="w-full py-1.5 px-2 border-gray-300 rounded text-xs focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Grupo</option>
          {grupoOptions.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
        </select>
        <select
          value={selectedSubgrupoId}
          onChange={(e) => setSelectedSubgrupoId(e.target.value)}
          disabled={!selectedGrupoId}
          className="w-full py-1.5 px-2 border-gray-300 rounded text-xs focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Subgrupo</option>
          {subgrupoOptions.map(sg => <option key={sg.id} value={sg.id}>{sg.nome}</option>)}
        </select>
      </div>

      {(selectedCategoriaId || debouncedSearchTerm) && (
        <button onClick={handleResetFilters} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 shrink-0">
          <X size={12} /> Limpar filtros
        </button>
      )}

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-md bg-gray-50 p-1 custom-scrollbar relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-10">
            <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
          </div>
        )}

        {produtos.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
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
                    ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm cursor-pointer'
                    : 'bg-gray-100 border-gray-100 opacity-60 cursor-not-allowed'}
                `}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{produto.nome}</p>
                  <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                    <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {formatCurrency(produto.preco)}
                    </span>
                    <span>Estoque: {produto.quantidade_estoque ?? 0}</span>
                  </div>
                </div>
                {temEstoque && <PackagePlus size={18} className="text-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rodapé de Paginação */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-gray-200 gap-2 shrink-0">

          {/* Seletor de Itens */}
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

          {/* Contador de Páginas */}
          <span className="text-xs font-medium text-gray-700">
            Página {currentPage} de {lastPage}
          </span>

          {/* Botões Anterior / Próxima */}
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Página Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage || isLoading}
              className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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