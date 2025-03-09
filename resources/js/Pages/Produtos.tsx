import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import './styles.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Categoria {
    id: number;
    categoria: string;
}

interface Produto {
    id: number;
    nome: string;
    descricao: string;
    codigo: number;
    preco: number;
    categoria_id: number;
    categoria?: Categoria;
}

const Produtos: React.FC = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [codigo, setCodigo] = useState<string>('');
    const [preco, setPreco] = useState<string>('');
    const [categoriaId, setCategoriaId] = useState<number>(0);
    const [editingId, setEditingId] = useState<number | null>(null);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!nome || !descricao || !codigo || categoriaId === 0) {
            alert('Por favor, preencha todos os campos e selecione uma categoria válida.');
            return;
        }

        try {
            const codigoNumero = Number(codigo); // Converte para número
            const precoNumero = Number(preco);
            if (isNaN(codigoNumero)) {
                alert('O código deve ser um número válido.');
                return;
            }

            if (editingId) {
                await axios.put(`/api/produtos/${editingId}`, {
                    nome,
                    descricao,
                    codigo: codigoNumero,
                    preco: precoNumero,
                    categoria_id: categoriaId,
                });
            } else {
                console.log('Dados a serem enviados:', {
                    nome,
                    descricao,
                    codigo: codigoNumero,
                    preco: precoNumero,
                    categoria_id: categoriaId,
                });
                await axios.post('/api/produtos', {
                    nome,
                    descricao,
                    codigo: codigoNumero,
                    preco: precoNumero,
                    categoria_id: categoriaId,
                });
            }
            setNome('');
            setDescricao('');
            setCodigo('');
            setPreco('');
            setCategoriaId(0);
            setEditingId(null);
            fetchProdutos();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Erro ao salvar produto:', error.response?.data);
            } else {
                console.error('Erro ao salvar produto:', error);
            }
        }
    };

    const handleEdit = (produto: Produto) => {
        setNome(produto.nome);
        setDescricao(produto.descricao);
        setCodigo(produto.codigo.toString());
        setPreco(produto.preco.toString());
        setCategoriaId(produto.categoria_id);
        setEditingId(produto.id);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/produtos/${id}`);
            fetchProdutos();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    };

    const handleReset = () => {
        setNome('');
        setDescricao('');
        setCodigo('');
        setPreco('');
        setCategoriaId(0);
        setEditingId(null);
    };

    return (
        <AuthenticatedLayout>
            <div className="Create">
                <h3 className='titulo'>
                    {editingId
                        ? `Editando produto (ID: ${editingId})`
                        : `Cadastro de produto: ${nome} - ${descricao} - ${codigo}`}
                </h3>

                <form className="formulario" onSubmit={handleSubmit}>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={2}>Formulário de Produto React</th>
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
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="codigo">Código</label></td>
                                <td>
                                    <input
                                        type="number"
                                        id="codigo"
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value)} // Mantém como string
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="preco">Preço</label></td>
                                <td>
                                    <input
                                        type="number"
                                        id="preco"
                                        value={preco}
                                        onChange={(e) => setPreco(e.target.value)} // Mantém como string
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
                                    >
                                        <option value={0}>Selecione uma categoria</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.categoria}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
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
                            <th>Descrição</th>
                            <th>Código</th>
                            <th>Preço</th>
                            <th>Categoria</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((produto) => (
                            <tr key={produto.id}>
                                <td>{produto.id}</td>
                                <td>{produto.nome}</td>
                                <td>{produto.descricao}</td>
                                <td>{produto.codigo}</td>
                                <td>{produto.preco}</td>
                                <td>{produto.categoria ? produto.categoria.categoria : 'Sem categoria'}</td>
                                <td>
                                    <button onClick={() => handleEdit(produto)} className="edit-btn">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(produto.id)} className="delete-btn">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
};

export default Produtos;