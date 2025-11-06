import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Produto, CategoriaArvore } from "@/types";

interface SubgrupoOption {
  id: number;
  nomeCompleto: string;
}

interface ProdutoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produto: Produto | null;
  arvore: CategoriaArvore[];
}

const flattenTree = (arvore: CategoriaArvore[]): SubgrupoOption[] => {
  const options: SubgrupoOption[] = [];

  arvore.forEach(cat => {
    cat.subcategorias?.forEach(sub => {
      sub.grupos?.forEach(grp => {
        grp.subgrupos?.forEach(subgrp => {
          options.push({
            id: subgrp.id,
            nomeCompleto: `${cat.nome} > ${sub.nome} > ${grp.nome} > ${subgrp.nome}`
          });
        });
      });
    });
  });

  return options;
};


export default function ProdutoFormModal({
  isOpen,
  onClose,
  onSuccess,
  produto,
  arvore,
}: ProdutoFormModalProps) {

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [preco, setPreco] = useState("");
  const [subgrupoId, setSubgrupoId] = useState<number | string>("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [subgrupoOptions, setSubgrupoOptions] = useState<SubgrupoOption[]>([]);

  const isEditing = produto !== null;

  useEffect(() => {
    if (isOpen && arvore) {
      setSubgrupoOptions(flattenTree(arvore));
    }
  }, [isOpen, arvore]);


  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setNome(produto.nome);
        setDescricao(produto.descricao);
        setCodigo(produto.codigo || "");
        setPreco(produto.preco.toString());
        setSubgrupoId(produto.subgrupo_id);
        setQuantidadeEstoque("");
      } else {
        handleReset();
      }
      setErrors({});
    }
  }, [isOpen, produto, isEditing]);

  const handleReset = () => {
    setNome("");
    setDescricao("");
    setCodigo("");
    setPreco("");
    setSubgrupoId("");
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
        subgrupo_id: Number(subgrupoId),
      };

      if (isEditing) {
        await axios.put(`/api/produtos/${produto.id}`, payload);
      } else {
        payload.quantidade_estoque = Number(quantidadeEstoque) || 0;
        await axios.post("/api/produtos", payload);
      }

      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
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
          <div>
            <InputLabel htmlFor="nome" value="Nome do Produto" />
            <TextInput id="nome" className="mt-1 block w-full" value={nome} onChange={(e) => setNome(e.target.value)} required isFocused />
            <InputError message={errors.nome} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="descricao" value="Descrição" />
            <TextInput id="descricao" className="mt-1 block w-full" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            <InputError message={errors.descricao} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="codigo" value="Código (EAN, SKU, etc.) (Opcional)" />
            <TextInput id="codigo" className="mt-1 block w-full" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            <InputError message={errors.codigo} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="preco" value="Preço de Venda (R$)" />
            <TextInput id="preco" type="number" step="0.01" min="0" className="mt-1 block w-full" value={preco} onChange={(e) => setPreco(e.target.value)} required />
            <InputError message={errors.preco} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="subgrupo" value="Classificação (Subgrupo)" />
            <select
              id="subgrupo"
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
              value={subgrupoId}
              onChange={(e) => setSubgrupoId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Selecione o nível mais baixo da árvore...</option>
              {subgrupoOptions.length === 0 && arvore.length > 0 && (
                <option disabled>Nenhum subgrupo encontrado. Crie-os na página Árvore.</option>
              )}
              {subgrupoOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nomeCompleto}
                </option>
              ))}
            </select>
            <InputError message={errors.subgrupo_id} className="mt-2" />
          </div>

          {!isEditing && (
            <div>
              <InputLabel htmlFor="quantidadeEstoque" value="Estoque Inicial (Opcional)" />
              <TextInput id="quantidadeEstoque" type="number" min="0" step="1" className="mt-1 block w-full" value={quantidadeEstoque} onChange={(e) => setQuantidadeEstoque(e.target.value)} placeholder="0" />
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