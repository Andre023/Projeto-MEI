import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import { Produto } from "@/types";
import SecondaryButton from "@/Components/SecondaryButton";
import { Loader2 } from "lucide-react";

interface HistoricoItem {
  id: string;
  data: string;
  tipo: "Estoque" | "Alteração";
  descricao: string;
  cor: string;
}

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
}

export default function HistoricoModal({
  isOpen,
  onClose,
  produto,
}: HistoricoModalProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && produto) {
      const fetchHistorico = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get<HistoricoItem[]>(
            `/api/produtos/${produto.id}/historico`
          );
          setHistorico(response.data);
        } catch (error) {
          console.error("Erro ao buscar histórico:", error);
          alert("Não foi possível carregar o histórico.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistorico();
    }
  }, [isOpen, produto]);

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
      {/* Fundo escuro adicionado */}
      <div className="p-6 bg-white dark:bg-gray-800 transition-colors">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Histórico do Produto: {produto?.nome}
        </h2>

        <div className="mt-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
          )}

          {!isLoading && historico.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Nenhuma movimentação ou alteração registrada.
            </p>
          )}

          {!isLoading && historico.length > 0 && (
            // Borda lateral mais escura no dark mode
            <div className="relative border-l border-gray-300 dark:border-gray-700 space-y-6 ml-3">
              {historico.map((item) => (
                <div key={item.id} className="relative pl-8">
                  {/* Bolinha da timeline */}
                  <span className="absolute left-[-9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                    <span className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                  </span>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className={`font-semibold ${item.cor} dark:brightness-110`}>
                      {item.tipo}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                      {new Date(item.data).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {item.descricao}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={onClose}>Fechar</SecondaryButton>
        </div>
      </div>
    </Modal>
  );
}