import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import './styles.css'; // Importa o CSS unificado
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Categoria {
  id: number;
  categoria: string;
}

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoria, setCategoria] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get<Categoria[]>('/api/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/categorias/${editingId}`, { categoria });
      } else {
        await axios.post('/api/categorias', { categoria });
      }
      setCategoria('');
      setEditingId(null);
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setCategoria(categoria.categoria);
    setEditingId(categoria.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/categorias/${id}`);
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  const handleReset = () => {
    setCategoria('');
    setEditingId(null);
  };

  return (
    <AuthenticatedLayout>
      <div className="Create">
        <h3>
          {editingId
            ? `Editando categoria (ID: ${editingId})`
            : `Cadastro de categoria: ${categoria}`}
        </h3>

        <form className="formulario" onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Formulário de Categoria react</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><label htmlFor="nome">Categoria</label></td>
                <td>
                  <input
                    type="text"
                    id="nome"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  />
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
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.categoria}</td>
                <td>
                  <button onClick={() => handleEdit(categoria)} className="edit-btn">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(categoria.id)} className="delete-btn">
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

export default Categorias;