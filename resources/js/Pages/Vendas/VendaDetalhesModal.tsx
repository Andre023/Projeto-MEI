import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Venda, VendaItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  venda: Venda | null;
}

const VendaDetalhesModal: React.FC<Props> = ({ isOpen, onClose, venda }) => {

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Função para buscar os detalhes da venda se não estiverem carregados
  // (Por enquanto, vamos assumir que os 'items' vêm da API de 'show' ou 'store')
  // No futuro, podemos adicionar um useEffect aqui para buscar /api/vendas/{venda.id}

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Detalhes da Venda #{venda?.id}
        </h2>

        {venda ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Cliente: </span>
                <span className="text-gray-900">{venda.cliente?.nome}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Data: </span>
                <span className="text-gray-900">{formatDate(venda.created_at)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Itens Vendidos</h3>
              <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="divide-y divide-gray-200">
                  {venda.items && venda.items.length > 0 ? (
                    venda.items.map((item: VendaItem) => (
                      <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">{item.produto?.nome || "Produto não encontrado"}</span>
                          <span className="text-sm text-gray-500 block">
                            {item.quantidade} un. x {formatCurrency(item.preco_unitario)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.quantidade * item.preco_unitario)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Nenhum item encontrado.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end items-center">
              <span className="text-xl font-bold text-gray-900">
                Total: {formatCurrency(venda.total_venda)}
              </span>
            </div>

          </div>
        ) : (
          <p>Carregando detalhes...</p>
        )}

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={onClose}>
            Fechar
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default VendaDetalhesModal;