import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { Cliente, Produto } from '@/types';
import { Plus, Trash2, Search } from 'lucide-react';

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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [items, setItems] = useState<ItemCarrinho[]>([]);

  const [produtoSearch, setProdutoSearch] = useState("");
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    if (isOpen) {
      // Resetar formulário ao abrir
      setSelectedClienteId("");
      setItems([]);
      setErrors({});
      setProdutoSearch("");

      // Buscar clientes
      axios.get('/api/clientes', { params: { per_page: -1 } })
        .then(res => setClientes(res.data.data || res.data))
        .catch(err => console.error("Erro ao buscar clientes:", err));

      // Buscar produtos
      axios.get('/api/produtos', { params: { per_page: -1 } })
        .then(res => setProdutos(res.data.data || res.data))
        .catch(err => console.error("Erro ao buscar produtos:", err));
    }
  }, [isOpen]);

  // --- LÓGICA DO CARRINHO ---

  // Filtro de produtos para o dropdown
  useEffect(() => {
    if (produtoSearch.length < 2) {
      setFilteredProdutos([]);
      return;
    }
    setFilteredProdutos(
      produtos.filter(p =>
        p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
        String(p.codigo).includes(produtoSearch)
      ).slice(0, 10) // Limita a 10 resultados
    );
  }, [produtoSearch, produtos]);

  const handleAddProduto = (produto: Produto) => {
    // Verifica se o item já está no carrinho
    if (items.find(item => item.produto_id === produto.id)) {
      setProdutoSearch("");
      setFilteredProdutos([]);
      return; // Não adiciona se já existe
    }

    setItems(prevItems => [
      ...prevItems,
      {
        produto_id: produto.id,
        nome: produto.nome,
        preco_unitario: produto.preco,
        quantidade: 1,
        estoque_atual: produto.quantidade_estoque ?? 0,
      }
    ]);
    setProdutoSearch("");
    setFilteredProdutos([]);
  };

  const handleQuantidadeChange = (produto_id: number, novaQuantidade: number) => {
    const item = items.find(i => i.produto_id === produto_id);
    if (!item) return;

    // Não permite 0 ou negativo, e não permite mais que o estoque
    if (novaQuantidade <= 0) novaQuantidade = 1;
    if (novaQuantidade > item.estoque_atual) novaQuantidade = item.estoque_atual;

    setItems(prevItems =>
      prevItems.map(i =>
        i.produto_id === produto_id ? { ...i, quantidade: novaQuantidade } : i
      )
    );
  };

  const handleRemoveItem = (produto_id: number) => {
    setItems(prevItems => prevItems.filter(i => i.produto_id !== produto_id));
  };

  const totalCarrinho = useMemo(() => {
    return items.reduce((total, item) => total + (item.preco_unitario * item.quantidade), 0);
  }, [items]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // --- SUBMISSÃO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const dadosVenda = {
      cliente_id: selectedClienteId,
      items: items.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      })),
    };

    try {
      await axios.post('/api/vendas', dadosVenda);
      setIsSubmitting(false);
      onSuccess(); // Fecha o modal e recarrega a lista
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        // Erro de estoque do backend
        if (error.response.data.message) {
          setErrors({ ...errors, general: error.response.data.message });
        }
      } else {
        setErrors({ general: 'Ocorreu um erro inesperado.' });
      }
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="xl">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Registrar Nova Venda
        </h2>

        {errors.general && <InputError message={errors.general} className="mb-4" />}

        <div className="space-y-6">
          {/* --- SELEÇÃO DE CLIENTE --- */}
          <div>
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <select
              id="cliente"
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>{cli.nome}</option>
              ))}
            </select>
            {errors.cliente_id && <InputError message={errors.cliente_id[0]} className="mt-2" />}
          </div>

          {/* --- BUSCA E ITENS DO CARRINHO --- */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Itens da Venda *</h3>

            {/* Campo de Busca de Produto */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produto por nome ou código..."
                value={produtoSearch}
                onChange={(e) => setProdutoSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Dropdown de resultados */}
              {filteredProdutos.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {filteredProdutos.map(p => (
                    <li
                      key={p.id}
                      onClick={() => handleAddProduto(p)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {p.nome} ({p.quantidade_estoque} em estoque)
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.items && <InputError message={errors.items[0]} className="mt-2" />}

            {/* Lista de Itens Adicionados */}
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.length === 0 && (
                <p className="text-center text-gray-500 text-sm">Nenhum produto adicionado.</p>
              )}
              {items.map(item => (
                <div key={item.produto_id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.nome}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.preco_unitario)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => handleQuantidadeChange(item.produto_id, parseInt(e.target.value))}
                      min="1"
                      max={item.estoque_atual}
                      className="w-20 text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.produto_id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Remover Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- TOTAL E BOTÕES --- */}
        <div className="mt-8 pt-5 border-t flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              Total: {formatCurrency(totalCarrinho)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting || items.length === 0 || !selectedClienteId}>
              {isSubmitting ? 'Salvando...' : 'Salvar Venda'}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default VendaFormModal;