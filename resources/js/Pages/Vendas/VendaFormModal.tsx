import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { Cliente, Produto } from '@/types';
import { Plus, Trash2, Search, ChevronDown, Loader2 } from 'lucide-react';
import { useDebounce } from "@uidotdev/usehooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemCarrinho {
  produto_id: number;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  estoque_atual: number;
}

const VendaFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  // Dados Mestres
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Estado do Carrinho
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [items, setItems] = useState<ItemCarrinho[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado da Busca de Produtos (Paginação API)
  const [produtoSearch, setProdutoSearch] = useState("");
  const debouncedSearchTerm = useDebounce(produtoSearch, 300);
  const [produtosEncontrados, setProdutosEncontrados] = useState<Produto[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    if (isOpen) {
      // Resetar estados ao abrir o modal
      setSelectedClienteId("");
      setItems([]);
      setErrors({});
      setProdutoSearch("");
      setProdutosEncontrados([]);
      setShowDropdown(false);

      // Buscar clientes (todos para o select)
      axios.get('/api/clientes', { params: { per_page: -1 } })
        .then(res => setClientes(res.data.data || res.data))
        .catch(err => console.error("Erro clientes:", err));
    }
  }, [isOpen]);

  // --- BUSCA DE PRODUTOS (API) ---
  const fetchProdutos = useCallback(async (isLoadMore = false) => {
    if (!debouncedSearchTerm && !isLoadMore && produtoSearch === "") return;

    setIsLoadingProdutos(true);
    try {
      const nextPage = isLoadMore ? page + 1 : 1;
      const params = {
        page: nextPage,
        per_page: 10, // Traz apenas 10 por vez para não pesar
        search: debouncedSearchTerm
      };

      const response = await axios.get('/api/produtos', { params });
      const novos = response.data.data || [];

      if (isLoadMore) {
        setProdutosEncontrados(prev => [...prev, ...novos]);
      } else {
        setProdutosEncontrados(novos);
        setShowDropdown(true); // Abre o dropdown ao receber resultados
      }

      setPage(nextPage);
      setHasMore(response.data.current_page < response.data.last_page);

    } catch (error) {
      console.error("Erro produtos:", error);
    } finally {
      setIsLoadingProdutos(false);
    }
  }, [debouncedSearchTerm, page]);

  // Dispara busca ao digitar (com debounce)
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
      fetchProdutos(false);
    } else if (produtoSearch === "") {
      setProdutosEncontrados([]);
      setShowDropdown(false);
    }
  }, [debouncedSearchTerm]);


  // --- MANIPULAÇÃO DO CARRINHO ---
  const handleAddProduto = (produto: Produto) => {
    if (items.find(item => item.produto_id === produto.id)) {
      alert("Este produto já foi adicionado.");
      return;
    }

    setItems(prev => [...prev, {
      produto_id: produto.id,
      nome: produto.nome,
      preco_unitario: produto.preco,
      quantidade: 1,
      estoque_atual: produto.quantidade_estoque ?? 0,
    }]);

    // Limpa a busca e fecha o dropdown para facilitar a próxima inserção
    setProdutoSearch("");
    setShowDropdown(false);
  };

  const handleQuantidadeChange = (produto_id: number, qtd: number) => {
    const item = items.find(i => i.produto_id === produto_id);
    if (!item) return;

    let novaQtd = qtd;
    if (novaQtd <= 0) novaQtd = 1;
    if (novaQtd > item.estoque_atual) novaQtd = item.estoque_atual;

    setItems(prev => prev.map(i => i.produto_id === produto_id ? { ...i, quantidade: novaQtd } : i));
  };

  const handleRemoveItem = (id: number) => {
    setItems(prev => prev.filter(i => i.produto_id !== id));
  };

  // --- SUBMISSÃO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await axios.post('/api/vendas', {
        cliente_id: selectedClienteId,
        items: items.map(i => ({ produto_id: i.produto_id, quantidade: i.quantidade }))
      });
      onSuccess();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        if (error.response.data.message) setErrors((e: any) => ({ ...e, general: error.response.data.message }));
      } else {
        setErrors({ general: 'Erro inesperado ao salvar venda.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCarrinho = useMemo(() => items.reduce((acc, i) => acc + (i.preco_unitario * i.quantidade), 0), [items]);
  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="xl">
      {/* 1. Classes dark adicionadas ao container principal */}
      <form onSubmit={handleSubmit} className="p-6 flex flex-col h-[85vh] md:h-auto bg-white dark:bg-gray-800 transition-colors">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Nova Venda</h2>

        {errors.general && <InputError message={errors.general} className="mb-4" />}

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {errors.cliente_id && <InputError message={errors.cliente_id[0]} className="mt-1" />}
          </div>

          {/* Busca de Produtos (Com Dropdown e Paginação) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adicionar Produto</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Digite nome ou código..."
                value={produtoSearch}
                onChange={(e) => setProdutoSearch(e.target.value)}
                onFocus={() => { if (produtosEncontrados.length > 0) setShowDropdown(true); }}
                className="w-full pl-9 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="off"
              />
              {isLoadingProdutos && <Loader2 className="absolute right-3 top-2.5 animate-spin text-gray-400 w-4 h-4" />}
            </div>

            {/* Dropdown de Resultados */}
            {showDropdown && (
              <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto custom-scrollbar">
                {produtosEncontrados.length === 0 && !isLoadingProdutos ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">Nenhum produto encontrado.</div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {produtosEncontrados.map(p => {
                      const stock = p.quantidade_estoque ?? 0;
                      return (
                        <li
                          key={p.id}
                          onClick={() => stock > 0 && handleAddProduto(p)}
                          className={`px-4 py-2 flex justify-between items-center text-sm cursor-pointer transition-colors 
                            ${stock > 0
                              ? 'hover:bg-blue-50 dark:hover:bg-gray-700'
                              : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700/50'}`}
                        >
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{p.nome}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{p.codigo ? `Cod: ${p.codigo}` : ''}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(p.preco)}</div>
                            <div className={`text-xs ${stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>Estoque: {stock}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Botão Carregar Mais dentro do dropdown */}
                {hasMore && !isLoadingProdutos && (
                  <button
                    type="button"
                    onClick={() => fetchProdutos(true)}
                    className="w-full py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-center items-center"
                  >
                    <ChevronDown size={14} className="mr-1" /> Carregar mais...
                  </button>
                )}
              </div>
            )}

            {/* Overlay invisível para fechar dropdown ao clicar fora */}
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
          </div>

          {/* Lista de Itens Selecionados */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 min-h-[150px]">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Itens do Pedido</h3>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                <p className="text-sm">O carrinho está vazio.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.produto_id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.nome}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(item.preco_unitario)} un.</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleQuantidadeChange(item.produto_id, parseInt(e.target.value))}
                        className="w-16 py-1 px-2 text-sm border-gray-300 dark:border-gray-600 rounded text-center focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        min="1"
                      />
                      <button type="button" onClick={() => handleRemoveItem(item.produto_id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Rodapé (Total e Botões) */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">Total Geral</span>
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalCarrinho)}</span>
          </div>
          <div className="flex gap-3 justify-end">
            <SecondaryButton onClick={onClose} disabled={isSubmitting}>Cancelar</SecondaryButton>
            <PrimaryButton disabled={isSubmitting || items.length === 0 || !selectedClienteId} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Finalizar Venda
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default VendaFormModal;