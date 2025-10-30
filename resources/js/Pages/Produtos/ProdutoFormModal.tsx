import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

// Interfaces
interface Categoria {
  id: number;
  categoria: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigo: string;
  preco: number;
  categoria_id: number;
  quantidade_estoque?: number;
}

interface ProdutoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produto: Produto | null; // null = Novo, Produto = Editar
  categorias: Categoria[];
}

export default function ProdutoFormModal({
  isOpen,
  onClose,
  onSuccess,
  produto,
  categorias,
}: ProdutoFormModalProps) {

  // Estado do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | string>("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");

  const [processing, setProcessing] = useState(false);
  // Para erros de validação
  const [errors, setErrors] = useState<any>({});

  const isEditing = produto !== null;

  // Efeito para popular o formulário quando o modal abre (se for edição)
  // ou limpar quando for um novo produto.
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        // Modo Edição: preenche os campos
        setNome(produto.nome);
        setDescricao(produto.descricao);
        setCodigo(produto.codigo || "");
        setPreco(produto.preco.toString());
        setCategoriaId(produto.categoria_id);
        setQuantidadeEstoque(""); // Estoque inicial não é editável aqui
      } else {
        // Modo Novo: limpa os campos
        handleReset();
      }
      setErrors({}); // Limpa erros anteriores ao abrir
    }
  }, [isOpen, produto, isEditing]);

  const handleReset = () => {
    setNome("");
    setDescricao("");
    setCodigo("");
    setPreco("");
    setCategoriaId("");
    setQuantidadeEstoque("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const precoNumero = Number(preco);
      const payload: any = {
        nome,
        descricao,
        codigo: codigo || null,
        preco: precoNumero,
        categoria_id: Number(categoriaId),
      };

      if (isEditing) {
        // Rota de ATUALIZAÇÃO (PUT)
        // Note que não enviamos quantidade_estoque aqui
        await axios.put(`/api/produtos/${produto.id}`, payload);
      } else {
        // Rota de CRIAÇÃO (POST)
        payload.quantidade_estoque = Number(quantidadeEstoque) || 0;
        await axios.post("/api/produtos", payload);
      }

      onSuccess(); // Chama a função de sucesso (fecha modal e recarrega lista)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        // Erros de Validação do Laravel
        setErrors(error.response.data.errors);
      } else {
        console.error("Erro ao salvar produto:", error);
        alert("Ocorreu um erro inesperado.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          {isEditing ? `Editar Produto: ${produto.nome}` : "Criar Novo Produto"}
        </h2>

        <div className="mt-6 space-y-4">
          {/* Nome */}
          <div>
            <InputLabel htmlFor="nome" value="Nome do Produto" />
            <TextInput
              id="nome"
              className="mt-1 block w-full"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              isFocused
            />
            <InputError message={errors.nome} className="mt-2" />
          </div>

          {/* Descrição */}
          <div>
            <InputLabel htmlFor="descricao" value="Descrição" />
            <TextInput
              id="descricao"
              className="mt-1 block w-full"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <InputError message={errors.descricao} className="mt-2" />
          </div>

          {/* Código (EAN) */}
          <div>
            <InputLabel htmlFor="codigo" value="Código (EAN, SKU, etc.) (Opcional)" />
            <TextInput
              id="codigo"
              className="mt-1 block w-full"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <InputError message={errors.codigo} className="mt-2" />
          </div>

          {/* Preço */}
          <div>
            <InputLabel htmlFor="preco" value="Preço de Venda (R$)" />
            <TextInput
              id="preco"
              type="number"
              step="0.01"
              min="0"
              className="mt-1 block w-full"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
            <InputError message={errors.preco} className="mt-2" />
          </div>

          {/* Categoria */}
          <div>
            <InputLabel htmlFor="categoria" value="Categoria" />
            <select
              id="categoria"
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Selecione...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoria}
                </option>
              ))}
            </select>
            <InputError message={errors.categoria_id} className="mt-2" />
          </div>

          {/* Estoque Inicial (SOMENTE AO CRIAR) */}
          {!isEditing && (
            <div>
              <InputLabel htmlFor="quantidadeEstoque" value="Estoque Inicial (Opcional)" />
              <TextInput
                id="quantidadeEstoque"
                type="number"
                min="0"
                step="1"
                className="mt-1 block w-full"
                value={quantidadeEstoque}
                onChange={(e) => setQuantidadeEstoque(e.target.value)}
                placeholder="0"
              />
              <InputError message={errors.quantidade_estoque} className="mt-2" />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={onClose} disabled={processing}>
            Cancelar
          </SecondaryButton>

          <PrimaryButton className="ms-3" disabled={processing}>
            {processing ? "Salvando..." : (isEditing ? "Atualizar" : "Cadastrar")}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}