import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { Produto } from "@/types"; // Agora ele vai encontrar o tipo
import { Edit2, History } from "lucide-react";

// Interface para o item do histórico (como definido na API)
interface HistoricoItem {
  id: string;
  data: string; // A API envia como string ISO
  tipo: 'Estoque' | 'Alteração';
  descricao: string;
  cor: string; // Classe de cor do Tailwind
}

// Props do Modal
interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
}

// Função helper para formatar a data
function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function HistoricoModal({ isOpen, onClose, produto }: HistoricoModalProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Busca o histórico sempre que o modal abrir com um produto
    if (isOpen && produto) {
      setIsLoading(true);
      setHistorico([]); // Limpa o histórico anterior

      axios.get(`/api/produtos/${produto.id}/historico`)
        .then(response => {
          setHistorico(response.data);
        })
        .catch(error => {
          console.error("Erro ao buscar histórico:", error);
          alert("Não foi possível carregar o histórico.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, produto]); // Dependências: rodar quando o modal abrir ou o produto mudar

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          Histórico do Produto: {produto?.nome}
        </h2>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <p className="text-center text-gray-500 py-4">Carregando...</p>
          )}

          {!isLoading && historico.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Nenhum histórico de alterações ou movimentações encontrado.
            </p>
          )}

          {!isLoading && historico.length > 0 && (
            <ul className="space-y-4">
              {/* Mapeia os itens do histórico */}
              {historico.map((item) => (
                <li key={item.id} className="flex items-start space-x-3">
                  {/* Ícone com cor de fundo baseada na 'cor' vinda da API */}
                  <div className={`mt-1 p-1.5 rounded-full ${item.cor.replace('text-', 'bg-').replace('600', '100')}`}>
                    {item.tipo === 'Estoque' ? (
                      <History className={`h-5 w-5 ${item.cor}`} />
                    ) : (
                      <Edit2 className={`h-5 w-5 ${item.cor}`} />
                    )}
                  </div>
                  {/* Descrição da Alteração */}
                  <div>
                    <p className={`text-sm font-medium ${item.cor}`}>{item.tipo}</p>
                    <p className="text-sm text-gray-800">{item.descricao}</p>
                    <p className="text-xs text-gray-500">{formatarData(item.data)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={onClose}>
            Fechar
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
}
