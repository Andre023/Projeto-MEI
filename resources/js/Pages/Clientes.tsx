import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './Clientes.css'; // Se tiver um arquivo de estilo

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Função para buscar clientes do backend
  const fetchClientes = async () => {
    try {
      const response = await axios.get<Cliente[]>('/api/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  // Carrega a lista de clientes ao montar o componente
  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Editando
        await axios.put(`/api/clientes/${editingId}`, {
          nome,
          telefone,
        });
      } else {
        // Criando
        await axios.post('/api/clientes', {
          nome,
          telefone,
        });
      }
      // Limpa o formulário e recarrega a lista
      setNome('');
      setTelefone('');
      setEditingId(null);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setEditingId(cliente.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/clientes/${id}`);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  const handleReset = () => {
    setNome('');
    setTelefone('');
    setEditingId(null);
  };

  return (
    <div className="Create">
      <h3>
        {editingId
          ? `Editando cliente (ID: ${editingId})`
          : `Cadastro de cliente: ${nome} - ${telefone}`}
      </h3>

      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th colSpan={2}>Formulário de Cliente react</th>
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
              <td><label htmlFor="telefone">Telefone</label></td>
              <td>
                <input
                  type="text"
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit">
          {editingId ? 'Atualizar' : 'Cadastrar'}
        </button>
        <button type="button" onClick={handleReset}>Limpar</button>
      </form>

      <table className="ClientesTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.id}</td>
              <td>{cliente.nome}</td>
              <td>{cliente.telefone}</td>
              <td>
                <button onClick={() => handleEdit(cliente)}>Editar</button>
                <button onClick={() => handleDelete(cliente.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clientes;
