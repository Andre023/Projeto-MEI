import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Produto, CategoriaArvore } from '@/types';
import { Search, PackagePlus, X } from 'lucide-react';
import { useDebounce } from "@uidotdev/usehooks";


// 1. Definição das Props
interface Props {
  // A função que este componente chama para adicionar um item ao "Pai"
  onAddProduto: (produto: Produto) => void;
}

const CatalogoProdutos: React.FC<Props> = ({ onAddProduto }) => {
  // --- 2. ESTADOS INTERNOS ---
  const [isLoading, setIsLoading] = useState(false);

  // Lista de produtos vindos da API
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Termo da busca de texto
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Atraso de 300ms

  // Filtros da Árvore
  const [arvore, setArvore] = useState<CategoriaArvore[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("");
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<string>("");
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>("");
  const [selectedSubgrupoId, setSelectedSubgrupoId] = useState<string>("");

  // --- 3. LÓGICA DE FILTROS (CASCADING) ---
  // (Exatamente como em Produtos.tsx)
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

  // --- 4. BUSCA DE DADOS ---
  const fetchProdutos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      // Vamos limitar a 20 resultados para uma lista rápida
      params.append('per_page', '20');

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      // Lógica dos filtros da árvore
      if (selectedSubgrupoId) params.append('subgrupo_id', selectedSubgrupoId);
      else if (selectedGrupoId) params.append('grupo_id', selectedGrupoId);
      else if (selectedSubcategoriaId) params.append('subcategoria_id', selectedSubcategoriaId);
      else if (selectedCategoriaId) params.append('categoria_id', selectedCategoriaId);

      const response = await axios.get(`/api/produtos`, { params });
      setProdutos(response.data.data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearchTerm, selectedCategoriaId, selectedSubcategoriaId,
    selectedGrupoId, selectedSubgrupoId
  ]);

  // Busca a árvore de categorias 1x
  useEffect(() => {
    axios.get("/api/arvore")
      .then(res => setArvore(res.data))
      .catch(err => console.error("Erro ao buscar árvore:", err));
  }, []);

  // Busca produtos sempre que os filtros ou a busca mudarem
  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  // --- Handlers de mudança dos filtros ---
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
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // --- 5. RENDERIZAÇÃO (JSX) ---
  return (
    <div className="space-y-4">
      {/* --- BARRA DE BUSCA --- */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nome, código ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* --- FILTROS DA ÁRVORE --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          value={selectedCategoriaId}
          onChange={handleCategoriaChange}
          className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
        >
          <option value="">Categoria</option>
          {arvore.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
        <select
          value={selectedSubcategoriaId}
          onChange={handleSubcategoriaChange}
          disabled={!selectedCategoriaId || subcategoriaOptions.length === 0}
          className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm disabled:bg-gray-100"
        >
          <option value="">Subcategoria</option>
          {subcategoriaOptions.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.nome}</option>
          ))}
        </select>
        <select
          value={selectedGrupoId}
          onChange={handleGrupoChange}
          disabled={!selectedSubcategoriaId || grupoOptions.length === 0}
          className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm disabled:bg-gray-100"
        >
          <option value="">Grupo</option>
          {grupoOptions.map(grp => (
            <option key={grp.id} value={grp.id}>{grp.nome}</option>
          ))}
        </select>
        <select
          value={selectedSubgrupoId}
          onChange={(e) => setSelectedSubgrupoId(e.target.value)}
          disabled={!selectedGrupoId || subgrupoOptions.length === 0}
          className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm disabled:bg-gray-100"
        >
          <option value="">Subgrupo</option>
          {subgrupoOptions.map(subgrp => (
            <option key={subgrp.id} value={subgrp.id}>{subgrp.nome}</option>
          ))}
        </select>
      </div>

      {(selectedCategoriaId || selectedSubgrupoId || selectedGrupoId || selectedSubcategoriaId) && (
        <button
          onClick={handleResetFilters}
          className="text-xs text-red-600 hover:text-red-800 inline-flex items-center gap-1"
        >
          <X size={14} /> Limpar filtros
        </button>
      )}

      {/* --- LISTA DE RESULTADOS --- */}
      <div className="mt-4 border-t pt-4 min-h-[300px] max-h-[60vh] overflow-y-auto pr-2 space-y-2">
        {isLoading && (
          <p className="text-center text-gray-500 py-10">Buscando...</p>
        )}

        {!isLoading && produtos.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Nenhum produto encontrado.
          </p>
        )}

        {!isLoading && produtos.map(produto => {
          const temEstoque = (produto.quantidade_estoque ?? 0) > 0;
          return (
            <button
              key={produto.id}
              // 6. AQUI ESTÁ A MÁGICA:
              // Chama a função do "Pai" ao clicar
              onClick={() => onAddProduto(produto)}

              disabled={!temEstoque}
              className={`w-full text-left p-3 flex justify-between items-center rounded-md border
                                        ${temEstoque
                  ? 'bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                                        transition-colors duration-150
                                      `}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{produto.nome}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(produto.preco)}
                  <span className="mx-2">|</span>
                  Estoque: {produto.quantidade_estoque ?? 0}
                </p>
              </div>
              <PackagePlus
                size={20}
                className={temEstoque ? 'text-blue-600' : 'text-gray-400'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogoProdutos;