import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import './styles.css'; // O seu arquivo de estilos
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Caminho corrigido com '@'
import { User } from '@/types'; // Caminho corrigido com '@'
import EstoqueModal from '@/Pages/Produtos/EstoqueModal'; // 1. IMPORTAR O MODAL (com '@')

// Interface para as props do AuthenticatedLayout
interface ProdutosPageProps {
    auth: {
        user: User;
    };
}

// Interface Categoria
interface Categoria {
    id: number;
    categoria: string;
}

// Interface Produto (garantindo que tem quantidade_estoque)
interface Produto {
    id: number;
    nome: string;
    descricao: string;
    codigo: string;
    preco: number;
    categoria_id: number;
    categoria?: Categoria;
    quantidade_estoque?: number;
}

const Produtos: React.FC<ProdutosPageProps> = ({ auth }) => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    // Estado do formulário
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [codigo, setCodigo] = useState<string>('');
    const [preco, setPreco] = useState<string>('');
    const [categoriaId, setCategoriaId] = useState<number>(0);
    const [quantidadeEstoque, setQuantidadeEstoque] = useState<string>('');
    const [editingId, setEditingId] = useState<number | null>(null);

    // --- 2. ESTADO PARA CONTROLAR O MODAL ---
    const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    // ----------------------------------------

    const fetchProdutos = async () => {
        try {
            const response = await axios.get('/api/produtos');
            console.log('Produtos recebidos:', response.data);
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await axios.get('/api/categorias');
            console.log('Categorias recebidas:', response.data);
            setCategorias(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    useEffect(() => {
        fetchProdutos();
        fetchCategorias();
    }, []);

    // Limpa o formulário
    const handleReset = () => {
        setNome('');
        setDescricao('');
        setCodigo('');
        setPreco('');
        setCategoriaId(0);
        setQuantidadeEstoque('');
        setEditingId(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!nome || !descricao || categoriaId === 0 || !preco) {
            alert('Por favor, preencha Nome, Descrição, Preço e Categoria.');
            return;
        }

        try {
            const precoNumero = Number(preco);
            const payload: any = {
                nome,
                descricao,
                codigo: codigo || null,
                preco: precoNumero,
                categoria_id: categoriaId,
            };

            if (editingId) {
                await axios.put(`/api/produtos/${editingId}`, payload);
            } else {
                payload.quantidade_estoque = Number(quantidadeEstoque) || 0;
                console.log('Dados a serem enviados:', payload);
                await axios.post('/api/produtos', payload);
            }

            handleReset();
            fetchProdutos();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Erro ao salvar produto:', error.response?.data);
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    const errorMessages = Object.values(errors).flat().join('\n');
                    alert('Erro de validação:\n' + errorMessages);
                } else {
                    alert('Ocorreu um erro ao salvar o produto.');
                }
            } else {
                console.error('Erro ao salvar produto:', error);
                alert('Ocorreu um erro inesperado.');
            }
        }
    };

    const handleEdit = (produto: Produto) => {
        setNome(produto.nome);
        setDescricao(produto.descricao);
        setCodigo(produto.codigo || '');
        setPreco(produto.preco.toString());
        setCategoriaId(produto.categoria_id);
        setEditingId(produto.id);
        setQuantidadeEstoque('');
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este produto?")) {
            return;
        }
        try {
            await axios.delete(`/api/produtos/${id}`);
            fetchProdutos();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert('Ocorreu um erro ao excluir o produto.');
        }
    };

    // --- 3. FUNÇÃO PARA ABRIR O MODAL DE ESTOQUE ---
    const handleAbrirEstoqueModal = (produto: Produto) => {
        setProdutoSelecionado(produto);
        setIsEstoqueModalOpen(true);
    };
    // ---------------------------------------------

    return (
        <AuthenticatedLayout>
            <div className="Create">
                <h3 className='titulo'>
                    {editingId
                        ? `Editando produto (ID: ${editingId})`
                        : `Cadastro de produto`}
                </h3>

                <form className="formulario" onSubmit={handleSubmit}>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={2}>Formulário de Produto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><label htmlFor="nome">Nome</label></td>
                                <td>
                                    <input
                                        type="text"
                                        id="nome"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        required
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="descricao">Descrição</label></td>
                                <td>
                                    <input
                                        type="text"
                                        id="descricao"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        required
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="codigo">Código (EAN)</label></td>
                                <td>
                                    <input
                                        type="text"
                                        id="codigo"
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value)}
                                        placeholder="Ex: 7891234567890 (Opcional)"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="preco">Preço (R$)</label></td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        id="preco"
                                        value={preco}
                                        onChange={(e) => setPreco(e.target.value)}
                                        required
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="categoria">Categoria</label></td>
                                <td>
                                    <select
                                        id="categoria"
                                        value={categoriaId}
                                        onChange={(e) => setCategoriaId(Number(e.target.value))}
                                        required
                                    >
                                        <option value={0} disabled>Selecione uma categoria</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.categoria}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            {!editingId && (
                                <tr>
                                    <td><label htmlFor="quantidadeEstoque">Estoque Inicial</label></td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            id="quantidadeEstoque"
                                            value={quantidadeEstoque}
                                            onChange={(e) => setQuantidadeEstoque(e.target.value)}
                                            placeholder="0 (Opcional)"
                                            disabled={!!editingId}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="form-buttons">
                        <button type="submit" className="btn-submit">
                            {editingId ? 'Atualizar' : 'Cadastrar'}
                        </button>
                        <button type="button" className="btn-reset" onClick={handleReset}>
                            Limpar
                        </button>
                    </div>
                </form>

                <table className="DataTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            {/* <th>Descrição</th> */}
                            <th>Código</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Categoria</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((produto) => (
                            <tr key={produto.id}>
                                <td>{produto.id}</td>
                                <td>{produto.nome}</td>
                                {/* <td>{produto.descricao}</td> */}
                                <td>{produto.codigo || 'N/A'}</td>
                                <td>{produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td>{produto.quantidade_estoque ?? 0}</td>
                                <td>{produto.categoria ? produto.categoria.categoria : 'Sem categoria'}</td>
                                <td>
                                    <button onClick={() => handleEdit(produto)} className="edit-btn">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(produto.id)} className="delete-btn">
                                        Excluir
                                    </button>
                                    {/* --- 4. BOTÃO DE ESTOQUE AGORA FUNCIONA --- */}
                                    <button
                                        onClick={() => handleAbrirEstoqueModal(produto)}
                                        className="edit-btn"
                                        style={{ backgroundColor: '#17a2b8', color: 'white', marginLeft: '5px' }}
                                    >
                                        Estoque
                                    </button>
                                    {/* -------------------------------------- */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- 5. ADICIONAR O MODAL À PÁGINA --- */}
            <EstoqueModal
                isOpen={isEstoqueModalOpen}
                onClose={() => setIsEstoqueModalOpen(false)}
                produto={produtoSelecionado}
                onSuccess={() => {
                    // Quando o modal for salvo com sucesso,
                    // fechamos o modal e recarregamos a lista de produtos.
                    setIsEstoqueModalOpen(false);
                    fetchProdutos();
                }}
            />
            {/* ---------------------------------- */}
        </AuthenticatedLayout>
    );
};

export default Produtos;