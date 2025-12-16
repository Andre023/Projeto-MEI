import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Produto } from "@/types";

interface EstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produto: Produto | null;
}

export default function EstoqueModal({
  isOpen,
  onClose,
  onSuccess,
  produto,
}: EstoqueModalProps) {

  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setTipo("entrada");
      setQuantidade("");
      setDescricao("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!produto) return;

    // --- VALIDAÇÃO CLIENT-SIDE ---
    if (tipo === 'saida') {
      const qtdAtual = produto.quantidade_estoque || 0;
      const qtdSaida = Number(quantidade);

      if (qtdSaida > qtdAtual) {
        setErrors({
          quantidade: `Saldo insuficiente. Atual: ${qtdAtual}, Tentativa: ${qtdSaida}`
        });
        return;
      }
    }

    setProcessing(true);
    setErrors({});

    try {
      const payload = {
        tipo,
        quantidade: Number(quantidade),
        descricao: descricao || null,
      };

      await axios.post(`/api/produtos/${produto.id}/estoque`, payload);
      onSuccess();

    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const data = error.response.data;

        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setErrors({ quantidade: data.message });
        } else {
          setErrors({});
        }
      } else {
        console.error("Erro ao movimentar estoque:", error);
        alert("Ocorreu um erro inesperado.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      {/* Adicionada cor de fundo e transição */}
      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 transition-colors">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Movimentar Estoque: {produto?.nome}
        </h2>

        {/* Mostra o estoque com destaque visual condicional */}
        <p className={`text-sm mt-1 ${produto?.quantidade_estoque === 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
          Estoque Atual: <strong className="dark:text-gray-200">{produto?.quantidade_estoque ?? 0}</strong>
        </p>

        <div className="mt-6 space-y-4">
          {/* Tipo de Movimentação */}
          <div>
            <InputLabel htmlFor="tipo" value="Tipo de Movimentação" className="dark:text-gray-300" />
            <select
              id="tipo"
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as "entrada" | "saida");
                setErrors({});
              }}
              required
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <InputError message={errors.tipo} className="mt-2" />
          </div>

          {/* Quantidade */}
          <div>
            <InputLabel htmlFor="quantidade" value="Quantidade" className="dark:text-gray-300" />
            <TextInput
              id="quantidade"
              type="number"
              min="1"
              step="1"
              // O TextInput já tem classes dark, mas o erro precisa de ajuste se houver
              className={`mt-1 block w-full ${errors.quantidade ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={quantidade}
              onChange={(e) => {
                setQuantidade(e.target.value);
                if (errors.quantidade) setErrors({ ...errors, quantidade: null });
              }}
              required
            />
            <InputError message={errors.quantidade} className="mt-2" />
          </div>

          {/* Descrição */}
          <div>
            <InputLabel htmlFor="descricao" value="Descrição/Motivo (Opcional)" className="dark:text-gray-300" />
            <TextInput
              id="descricao"
              className="mt-1 block w-full"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Venda, Ajuste de inventário, etc."
            />
            <InputError message={errors.descricao} className="mt-2" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={onClose} disabled={processing}>
            Cancelar
          </SecondaryButton>

          <PrimaryButton className="ms-3" disabled={processing}>
            {processing ? "Salvando..." : "Confirmar Movimentação"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}