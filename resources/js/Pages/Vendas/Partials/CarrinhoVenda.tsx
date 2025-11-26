import React, { useMemo, useState, useEffect } from 'react';
import { Cliente } from '@/types';
import { ItemCarrinho } from '../Create';
import { Trash2, Search, X, Loader2, User } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useDebounce } from "@uidotdev/usehooks";
import axios from 'axios';

interface Props {
  // Dados que vêm do "Pai"
  // clientes: Cliente[]; // Não precisamos mais da lista completa via props
  items: ItemCarrinho[];
  selectedClienteId: string;
  isSubmitting: boolean;

  // Funções que o "Pai" executa
  onClienteChange: (id: string) => void;
  onQuantidadeChange: (produto_id: number, novaQuantidade: number) => void;
  onItemRemove: (produto_id: number) => void;
  onSubmit: () => void;
}

const CarrinhoVenda: React.FC<Props> = ({
  items,
  selectedClienteId,
  isSubmitting,
  onClienteChange,
  onQuantidadeChange,
  onItemRemove,
  onSubmit
}) => {
  // --- Estados da Busca de Cliente ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce para evitar muitas requisições enquanto digita
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Lógica de Totalização (Mantida) ---
  const totalCarrinho = useMemo(() => {
    return items.reduce((total, item) => total + (item.preco_unitario * item.quantidade), 0);
  }, [items]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // --- Efeito: Buscar Clientes na API ---
  useEffect(() => {
    // Só busca se tiver texto e se o texto não for exatamente o nome do cliente já selecionado
    // (Isso evita buscar de novo logo após clicar numa opção)
    if (debouncedSearchTerm) {
      // Se já temos um cliente selecionado e o termo de busca é igual ao nome dele, não buscamos
      // (assumindo que o usuário só está vendo o nome selecionado)
      const isJustViewingSelected = selectedClienteId && searchResults.find(c => c.id.toString() === selectedClienteId)?.nome === debouncedSearchTerm;

      if (!isJustViewingSelected) {
        setIsLoadingClients(true);
        axios.get('/api/clientes', {
          params: {
            search: debouncedSearchTerm,
            per_page: 5 // Limita a 5 resultados no dropdown para não poluir
          }
        })
          .then(res => {
            setSearchResults(res.data.data);
            setShowResults(true);
          })
          .catch(err => console.error("Erro ao buscar clientes:", err))
          .finally(() => setIsLoadingClients(false));
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchTerm]);

  // --- Efeito: Carregar nome do cliente inicial (se vier ID preenchido do pai, ex: edição) ---
  useEffect(() => {
    if (selectedClienteId && !searchTerm) {
      // Se tem ID mas não tem termo (ex: carregou a página agora), busca o nome desse ID específico
      axios.get(`/api/clientes/${selectedClienteId}`)
        .then(res => {
          setSearchTerm(res.data.nome);
        })
        .catch(() => {
          // Se der erro (ex: cliente deletado), limpa a seleção
          onClienteChange("");
        });
    }
  }, [selectedClienteId]);


  // --- Handlers ---
  const handleSelectCliente = (cliente: Cliente) => {
    setSearchTerm(cliente.nome);
    onClienteChange(cliente.id.toString());
    setShowResults(false);
  };

  const handleClearCliente = () => {
    setSearchTerm("");
    onClienteChange("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Se o usuário altera o texto, desmarcamos o ID atual para forçar uma nova seleção
    if (selectedClienteId) {
      onClienteChange("");
    }
    setShowResults(true);
  };

  return (
    <div className="space-y-6">

      {/* --- SELEÇÃO DE CLIENTE (COM BUSCA) --- */}
      <div className="relative">
        <label htmlFor="cliente-search" className="block text-sm font-medium text-gray-700 mb-1">
          Cliente *
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoadingClients ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>

          <input
            id="cliente-search"
            type="text"
            className={`
                    pl-9 pr-8 block w-full rounded-md shadow-sm sm:text-sm
                    ${!selectedClienteId ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' : 'border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50 text-green-900 font-medium'}
                `}
            placeholder="Buscar cliente por nome ou telefone..."
            value={searchTerm}
            onChange={handleInputChange}
            disabled={isSubmitting}
            autoComplete="off"
          />

          {/* Botão de Limpar (aparece se tiver algo digitado) */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearCliente}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* --- Dropdown de Resultados --- */}
        {showResults && searchResults.length > 0 && !selectedClienteId && (
          <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {searchResults.map((cliente) => (
              <li
                key={cliente.id}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 text-gray-900"
                onClick={() => handleSelectCliente(cliente)}
              >
                <div className="flex items-center">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                    <User size={14} />
                  </span>
                  <div className="ml-3">
                    <span className="block truncate font-medium">{cliente.nome}</span>
                    <span className="block truncate text-xs text-gray-500">{cliente.telefone}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Mensagem se não encontrar nada */}
        {showResults && searchResults.length === 0 && searchTerm && !isLoadingClients && !selectedClienteId && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500 border border-gray-100">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* --- LISTA DE ITENS NO CARRINHO (Mantido igual) --- */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Itens</h3>

        <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {items.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              Adicione produtos do catálogo.
            </p>
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
                  onChange={(e) => onQuantidadeChange(item.produto_id, Number.parseInt(e.target.value))}
                  min="1"
                  max={item.estoque_atual}
                  className="w-20 text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => onItemRemove(item.produto_id)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Remover Item"
                  disabled={isSubmitting}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- TOTAL E BOTÕES (Mantido igual) --- */}
      <div className="mt-8 pt-5 border-t space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">
            Total:
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalCarrinho)}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <PrimaryButton
            onClick={onSubmit}
            disabled={isSubmitting || items.length === 0 || !selectedClienteId}
            className="w-full justify-center text-lg py-3"
          >
            {isSubmitting ? 'Finalizando...' : 'Finalizar Venda'}
          </PrimaryButton>
          <Link
            href={route('vendas')}
            as="button"
            className="w-full text-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarrinhoVenda;