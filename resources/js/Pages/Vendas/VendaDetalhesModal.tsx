import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Venda, VendaItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  venda: Venda | null;
}

const VendaDetalhesModal: React.FC<Props> = ({ isOpen, onClose, venda }) => {
  const [detalhes, setDetalhes] = useState<Venda | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Busca os detalhes completos (incluindo itens) ao abrir o modal
  useEffect(() => {
    if (isOpen && venda?.id) {
      setIsLoading(true);
      axios.get(`/api/vendas/${venda.id}`)
        .then(response => {
          setDetalhes(response.data);
        })
        .catch(error => {
          console.error("Erro ao buscar detalhes da venda:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDetalhes(null);
    }
  }, [isOpen, venda]);

  const dadosParaExibir = detalhes || venda;

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Detalhes da Venda #{dadosParaExibir?.id}
        </h2>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">Carregando itens...</div>
        ) : dadosParaExibir ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Cliente: </span>
                <span className="text-gray-900">{dadosParaExibir.cliente?.nome || 'Consumidor Final'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Data: </span>
                <span className="text-gray-900">{formatDate(dadosParaExibir.created_at)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Itens Vendidos</h3>
              <div className="max-h-60 overflow-y-auto pr-2 bg-gray-50 rounded-md p-2 border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {dadosParaExibir.items && dadosParaExibir.items.length > 0 ? (
                    dadosParaExibir.items.map((item: VendaItem) => (
                      <li key={item.id} className="py-2 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium text-gray-800 block">{item.produto?.nome || "Produto Removido"}</span>
                          <span className="text-xs text-gray-500">
                            {item.quantidade} un. x {formatCurrency(item.preco_unitario)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.quantidade * item.preco_unitario)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-center py-4 text-gray-500">
                      Nenhum item encontrado para esta venda.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end items-center">
              <span className="text-xl font-bold text-gray-900">
                Total: {formatCurrency(dadosParaExibir.total_venda)}
              </span>
            </div>

          </div>
        ) : (
          <p className="text-center text-gray-500">Venda não encontrada.</p>
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