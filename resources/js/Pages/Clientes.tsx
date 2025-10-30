import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import "./styles.css"; // Importa o CSS unificado
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchClientes = async () => {
    try {
      const response = await axios.get<Cliente[]>("/api/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/clientes/${editingId}`, { nome, telefone });
      } else {
        await axios.post("/api/clientes", { nome, telefone });
      }
      setNome("");
      setTelefone("");
      setEditingId(null);
      fetchClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
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
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const handleReset = () => {
    setNome("");
    setTelefone("");
    setEditingId(null);
  };

  return (
    <AuthenticatedLayout>
      <div className="Create">
        <h3>
          {editingId
            ? `Editando cliente (ID: ${editingId})`
            : `Cadastro de cliente: ${nome} - ${telefone}`}
        </h3>

        <form className="formulario" onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Formulário de Cliente react</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="nome">Nome</label>
                </td>
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
                <td>
                  <label htmlFor="telefone">Telefone</label>
                </td>
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
          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingId ? "Atualizar" : "Cadastrar"}
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
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="edit-btn"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="delete-btn"
                  >
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

export default Clientes;
