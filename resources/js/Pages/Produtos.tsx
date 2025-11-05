// resources/js/Pages/Produtos.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { User, Produto, Categoria } from "@/types"; // Importa dos tipos
import EstoqueModal from "@/Pages/Produtos/EstoqueModal";
import ProdutoFormModal from "@/Pages/Produtos/ProdutoFormModal";
import HistoricoModal from "@/Pages/Produtos/HistoricoModal";
import { Plus, Edit, Trash2, Box, ScrollText } from "lucide-react"; // <-- Importa o novo ícone

interface ProdutosPageProps {
    auth: {
        user: User;
    };
}

const Produtos: React.FC<ProdutosPageProps> = ({ auth }) => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    // --- ESTADO PARA OS MODAIS ---
    const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState(false);
    const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false); // <-- NOVO ESTADO

    const [produtoEstoque, setProdutoEstoque] = useState<Produto | null>(null);
    const [produtoEdicao, setProdutoEdicao] = useState<Produto | null>(null);
    const [produtoHistorico, setProdutoHistorico] = useState<Produto | null>(null); // <-- NOVO ESTADO

    // Funções de busca
    const fetchProdutos = async () => {
        try {
            const response = await axios.get("/api/produtos");
            setProdutos(response.data);
        } catch (error) { console.error("Erro ao buscar produtos:", error); }
    };
    const fetchCategorias = async () => {
        try {
            const response = await axios.get("/api/categorias");
            setCategorias(response.data);
        } catch (error) { console.error("Erro ao buscar categorias:", error); }
    };
    useEffect(() => {
        fetchProdutos();
        fetchCategorias();
    }, []);

    // Função Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este produto?")) {
            return;
        }
        try {
            await axios.delete(`/api/produtos/${id}`);
            fetchProdutos();
        } catch (error) { console.error("Erro ao excluir produto:", error); }
    };

    // --- Funções para controlar os Modais ---
    const handleAbrirNovoProduto = () => {
        setProdutoEdicao(null);
        setIsProdutoModalOpen(true);
    };
    const handleAbrirEditarProduto = (produto: Produto) => {
        setProdutoEdicao(produto);
        setIsProdutoModalOpen(true);
    };
    const handleAbrirEstoqueModal = (produto: Produto) => {
        setProdutoEstoque(produto);
        setIsEstoqueModalOpen(true);
    };
    // --- NOVA FUNÇÃO PARA O HISTÓRICO ---
    const handleAbrirHistoricoModal = (produto: Produto) => {
        setProdutoHistorico(produto);
        setIsHistoricoModalOpen(true);
    };

    // --- Funções de Sucesso ---
    const onProdutoSuccess = () => {
        setIsProdutoModalOpen(false);
        fetchProdutos();
    };
    const onEstoqueSuccess = () => {
        setIsEstoqueModalOpen(false);
        fetchProdutos();
    };

    return (
        <AuthenticatedLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Botão de Adicionar Novo Produto */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleAbrirNovoProduto}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Plus size={16} className="mr-2" />
                            Novo Produto
                        </button>
                    </div>

                    {/* Container da Tabela */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto overflow-y-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Código</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Preço</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Estoque</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {produtos.map((produto) => (
                                        <tr key={produto.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produto.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.codigo || "N/A"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{produto.quantidade_estoque ?? 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.categoria ? produto.categoria.categoria : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {/* --- ADICIONE O BOTÃO DE HISTÓRICO AQUI --- */}
                                                <button
                                                    onClick={() => handleAbrirHistoricoModal(produto)}
                                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition duration-150"
                                                    title="Histórico de Alterações"
                                                >
                                                    <ScrollText size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleAbrirEstoqueModal(produto)}
                                                    className="p-2 rounded-full text-cyan-600 hover:bg-cyan-100 transition duration-150"
                                                    title="Movimentar Estoque"
                                                >
                                                    <Box size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAbrirEditarProduto(produto)}
                                                    className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition duration-150"
                                                    title="Editar Produto"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(produto.id)}
                                                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition duration-150"
                                                    title="Excluir Produto"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renderiza os modais */}
            <EstoqueModal
                isOpen={isEstoqueModalOpen}
                onClose={() => setIsEstoqueModalOpen(false)}
                produto={produtoEstoque}
                onSuccess={onEstoqueSuccess}
            />
            <ProdutoFormModal
                isOpen={isProdutoModalOpen}
                onClose={() => setIsProdutoModalOpen(false)}
                produto={produtoEdicao}
                categorias={categorias}
                onSuccess={onProdutoSuccess}
            />
            {/* --- ADICIONE O NOVO MODAL DE HISTÓRICO --- */}
            <HistoricoModal
                isOpen={isHistoricoModalOpen}
                onClose={() => setIsHistoricoModalOpen(false)}
                produto={produtoHistorico}
            />
        </AuthenticatedLayout>
    );
};

export default Produtos;