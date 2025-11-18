import React, { useMemo } from 'react';
import { Cliente } from '@/types';
import { ItemCarrinho } from '../Create';
import { Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Link } from '@inertiajs/react';

interface Props {
  // Dados que vêm do "Pai"
  clientes: Cliente[];
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
  clientes,
  items,
  selectedClienteId,
  isSubmitting,
  onClienteChange,
  onQuantidadeChange,
  onItemRemove,
  onSubmit
}) => {

  const totalCarrinho = useMemo(() => {
    return items.reduce((total, item) => total + (item.preco_unitario * item.quantidade), 0);
  }, [items]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="space-y-6">

      {/* --- SELEÇÃO DE CLIENTE --- */}
      <div>
        <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
          Cliente *
        </label>
        <select
          id="cliente"
          value={selectedClienteId}
          onChange={(e) => onClienteChange(e.target.value)}
          className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
          disabled={isSubmitting}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map(cli => (
            <option key={cli.id} value={cli.id}>{cli.nome}</option>
          ))}
        </select>
      </div>

      {/* --- LISTA DE ITENS NO CARRINHO --- */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Itens</h3>

        <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2">
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
                  onChange={(e) => onQuantidadeChange(item.produto_id, parseInt(e.target.value))}
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

      {/* --- TOTAL E BOTÕES --- */}
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