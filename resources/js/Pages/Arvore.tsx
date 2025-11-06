import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import "./styles.css"; // Reutilizando seu CSS unificado
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// --- Definição das Interfaces da Árvore ---
interface Subgrupo {
  id: number;
  nome: string;
}

interface Grupo {
  id: number;
  nome: string;
  subgrupos: Subgrupo[];
}

interface Subcategoria {
  id: number;
  nome: string;
  grupos: Grupo[];
}

interface Categoria {
  id: number;
  nome: string;
  subcategorias: Subcategoria[];
}

// --- Props do Componente de Nó Recursivo ---
interface TreeNodeProps {
  node: any; // Categoria, Subcategoria, Grupo ou Subgrupo
  tipo: 'categoria' | 'subcategoria' | 'grupo' | 'subgrupo';
  onAdd: (tipo: string, parent_id: number | null) => void;
  onEdit: (node: any, tipo: string) => void;
  onDelete: (id: number, tipo: string) => void;
}

// --- Componente Recursivo para renderizar cada Nó da Árvore ---
const TreeNode: React.FC<TreeNodeProps> = ({ node, tipo, onAdd, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);

  let children: any[] = [];
  let proximoTipo: string = "";

  if (tipo === 'categoria') {
    children = node.subcategorias || [];
    proximoTipo = 'subcategoria';
  } else if (tipo === 'subcategoria') {
    children = node.grupos || [];
    proximoTipo = 'grupo';
  } else if (tipo === 'grupo') {
    children = node.subgrupos || [];
    proximoTipo = 'subgrupo';
  }

  return (
    <li style={{ marginLeft: "20px", listStyle: "none" }}>
      <div>
        <span onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer", fontWeight: "bold" }}>
          {expanded ? "[-] " : "[+] "}
          {node.nome} (ID: {node.id})
        </span>

        {/* Botões de Ação */}
        <button onClick={() => onEdit(node, tipo)} className="edit-btn" style={{ marginLeft: 10 }}>Editar</button>
        <button onClick={() => onDelete(node.id, tipo)} className="delete-btn">Excluir</button>
        {tipo !== 'subgrupo' && (
          <button onClick={() => onAdd(proximoTipo, node.id)} className="btn-submit" style={{ marginLeft: 5 }}>
            + Add {proximoTipo}
          </button>
        )}
      </div>

      {/* Renderiza os filhos recursivamente */}
      {expanded && children.length > 0 && (
        <ul>
          {children.map((child: any) => (
            <TreeNode
              key={child.id}
              node={child}
              tipo={proximoTipo as any}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// --- Componente Principal da Página ---
const Arvore: React.FC = () => {
  const [arvore, setArvore] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");

  // Estado para o formulário
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<string>('categoria'); // 'categoria', 'subcategoria', 'grupo', 'subgrupo'
  const [parentId, setParentId] = useState<number | null>(null);


  const fetchArvore = async () => {
    try {
      const response = await axios.get<Categoria[]>("/api/arvore");
      setArvore(response.data);
    } catch (error) {
      console.error("Erro ao buscar árvore:", error);
    }
  };

  useEffect(() => {
    fetchArvore();
  }, []);

  const handleResetForm = () => {
    setNome("");
    setEditingId(null);
    setTipo('categoria');
    setParentId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar
        await axios.put(`/api/arvore/${editingId}`, { nome, tipo });
      } else {
        // Criar
        await axios.post("/api/arvore", { nome, tipo, parent_id: parentId });
      }
      handleResetForm();
      fetchArvore(); // Recarrega a árvore
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // Prepara o formulário para Adicionar um novo nó filho
  const handleAdd = (tipo: string, parent_id: number | null) => {
    handleResetForm();
    setTipo(tipo);
    setParentId(parent_id);
    window.scrollTo(0, 0); // Rola para o topo onde o formulário está
  };

  // Prepara o formulário para Editar um nó existente
  const handleEdit = (node: any, tipo: string) => {
    setNome(node.nome);
    setEditingId(node.id);
    setTipo(tipo);
    setParentId(null); // ParentId não é relevante para edição de nome
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number, tipo: string) => {
    if (window.confirm("Tem certeza que deseja excluir este item e TODOS os seus filhos?")) {
      try {
        // O controller de destroy precisa saber o tipo para encontrar o model certo
        await axios.delete(`/api/arvore/${id}`, { data: { tipo } });
        fetchArvore();
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="Create">

        {/* --- Formulário Unificado --- */}
        <h3>
          {editingId
            ? `Editando ${tipo} (ID: ${editingId})`
            : `Cadastrar novo ${tipo}` + (parentId ? ` (Filho de ID: ${parentId})` : '')}
        </h3>
        <form className="formulario" onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Formulário da Árvore</th>
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
            </tbody>
          </table>
          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingId ? "Atualizar" : "Cadastrar"}
            </button>
            <button type="button" className="btn-reset" onClick={handleResetForm}>
              Limpar / Cancelar
            </button>
          </div>
        </form>

        <hr style={{ margin: "20px 0" }} />

        {/* --- Visualizador da Árvore --- */}
        <h2>Visualizador da Árvore</h2>
        <button onClick={() => handleAdd('categoria', null)} className="btn-submit" style={{ marginBottom: 10 }}>
          + Adicionar Categoria Raiz
        </button>

        <ul>
          {arvore.map((categoria) => (
            <TreeNode
              key={categoria.id}
              node={categoria}
              tipo="categoria"
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      </div>
    </AuthenticatedLayout>
  );
};

export default Arvore;