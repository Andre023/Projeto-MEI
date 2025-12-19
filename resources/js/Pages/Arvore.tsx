import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Transition } from "@headlessui/react";

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

interface TreeNodeProps {
  node: any;
  tipo: 'categoria' | 'subcategoria' | 'grupo' | 'subgrupo';
  onAdd: (tipo: string, parent_id: number | null) => void;
  onEdit: (node: any, tipo: string) => void;
  onDelete: (id: number, tipo: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, tipo, onAdd, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

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
    <li className="list-none ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 relative">
      <span className="absolute -left-px top-2.5 w-px h-full bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
        <div className="w-7 h-7 flex-shrink-0">
          {children.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>

        <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 min-w-0 break-words">
          {node.nome}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(node, tipo)}
            className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30 transition duration-150"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(node.id, tipo)}
            className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition duration-150"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
          {tipo !== 'subgrupo' && (
            <button
              onClick={() => onAdd(proximoTipo, node.id)}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition duration-150"
              title={`Adicionar ${proximoTipo}`}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      <Transition
        show={expanded && children.length > 0}
        enter="transition-all duration-300 ease-out overflow-hidden"
        enterFrom="max-h-0 opacity-0"
        enterTo="max-h-screen opacity-100"
        leave="transition-all duration-200 ease-in overflow-hidden"
        leaveFrom="max-h-screen opacity-100"
        leaveTo="max-h-0 opacity-0"
      >
        <ul className="mt-1">
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
      </Transition>
    </li>
  );
};

const Arvore: React.FC = () => {
  const [arvore, setArvore] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<string>('categoria');
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
    if (!nome) {
      alert("O nome é obrigatório.");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/arvore/${editingId}`, { nome, tipo });
      } else {
        await axios.post("/api/arvore", { nome, tipo, parent_id: parentId });
      }
      handleResetForm();
      fetchArvore();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleAdd = (tipo: string, parent_id: number | null) => {
    handleResetForm();
    setTipo(tipo);
    setParentId(parent_id);
    window.scrollTo(0, 0);
  };

  const handleEdit = (node: any, tipo: string) => {
    setNome(node.nome);
    setEditingId(node.id);
    setTipo(tipo);
    setParentId(null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number, tipo: string) => {
    if (window.confirm("Tem certeza que deseja excluir este item e TODOS os seus filhos?")) {
      try {
        await axios.delete(`/api/arvore/${id}`, { data: { tipo } });
        fetchArvore();
        handleResetForm();
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

          {/* --- Formulário --- */}
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {editingId
                ? `Editando ${tipo}`
                : `Cadastrar ${tipo}`}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  placeholder="Nome do item"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  <Plus size={16} className="mr-2 -ml-1" />
                  {editingId ? "Atualizar" : "Cadastrar"}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  Limpar / Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* --- Visualizador --- */}
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Visualizador da Árvore
              </h2>
            </div>

            <ul className="space-y-1">
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
              {arvore.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhuma categoria encontrada. Comece adicionando uma.
                </p>
              )}
            </ul>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Arvore;