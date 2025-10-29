import React, { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Modal from '@/Components/Modal'; // Caminho corrigido com '@'
import InputLabel from '@/Components/InputLabel'; // Caminho corrigido com '@'
import TextInput from '@/Components/TextInput'; // Caminho corrigido com '@'
import SecondaryButton from '@/Components/SecondaryButton'; // Caminho corrigido com '@'
import PrimaryButton from '@/Components/PrimaryButton'; // Caminho corrigido com '@'
import InputError from '@/Components/InputError'; // Caminho corrigido com '@'

// Definindo a interface do Produto (pode ser movida para ../types)
interface Produto {
    id: number;
    nome: string;
    descricao: string;
    codigo: string;
    preco: number;
    categoria_id: number;
    categoria?: any;
    quantidade_estoque?: number;
}

interface EstoqueModalProps {
    isOpen: boolean;
    onClose: () => void;
    produto: Produto | null;
    onSuccess: () => void; // Função para ser chamada após o sucesso (ex: recarregar lista)
}

export default function EstoqueModal({ isOpen, onClose, produto, onSuccess }: EstoqueModalProps) {
    // Estado do formulário do modal
    const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
    const [quantidade, setQuantidade] = useState<string>('');
    const [descricao, setDescricao] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Limpa o formulário quando o modal é fechado ou o produto muda
    useEffect(() => {
        if (isOpen) {
            setTipo('entrada');
            setQuantidade('');
            setDescricao('');
            setError(null);
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!produto || processing) return;

        const qtdNumero = Number(quantidade);
        if (qtdNumero <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Chamada para a API que já criamos
            await axios.post(`/api/produtos/${produto.id}/movimentar-estoque`, {
                tipo,
                quantidade: qtdNumero,
                descricao: descricao || (tipo === 'entrada' ? 'Entrada manual' : 'Saída manual'),
            });

            onSuccess(); // Recarrega a lista de produtos na página principal
            onClose();   // Fecha o modal

        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response) {
                // Captura a mensagem de erro do backend (ex: "Estoque insuficiente")
                setError(err.response.data.message || 'Ocorreu um erro.');
            } else {
                setError('Ocorreu um erro inesperado.');
            }
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6" style={{ background: 'white', borderRadius: '8px' }}>
                <h2 className="text-lg font-medium text-gray-900">
                    Movimentar Estoque: <span style={{ fontWeight: 'bold' }}>{produto?.nome}</span>
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Estoque atual: {produto?.quantidade_estoque ?? 0}
                </p>

                {/* Exibe o erro de estoque insuficiente */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-6">
                    <InputLabel htmlFor="tipo" value="Tipo de Movimentação" />
                    <select
                        id="tipo"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as 'entrada' | 'saida')}
                        required
                    >
                        <option value="entrada">Entrada (Compra/Ajuste)</option>
                        <option value="saida">Saída (Venda/Perda)</option>
                    </select>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="quantidade" value="Quantidade" />
                    <TextInput
                        id="quantidade"
                        type="number"
                        min="1"
                        className="mt-1 block w-full"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        required
                        isFocused
                    />
                    {/* Exibe erro de quantidade (se não for o erro principal) */}
                    {!error && Number(quantidade) < 0 && (
                         <InputError message="A quantidade não pode ser negativa." className="mt-2" />
                    )}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="descricao" value="Motivo / Descrição (Opcional)" />
                    <TextInput
                        id="descricao"
                        type="text"
                        className="mt-1 block w-full"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Ex: Compra fornecedor X, Ajuste..."
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancelar
                    </SecondaryButton>

                    <PrimaryButton className="ms-3" disabled={processing}>
                        {processing ? 'Processando...' : 'Confirmar'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}