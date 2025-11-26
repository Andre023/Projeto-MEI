import React, { useState, FormEvent, useEffect, useMemo } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Produto, CategoriaArvore } from "@/types";

interface ProdutoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produto: Produto | null;
  arvore: CategoriaArvore[];
}

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
  const [precoCusto, setPrecoCusto] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");

  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | string>("");
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | string>("");
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | string>("");
  const [selectedSubgrupoId, setSelectedSubgrupoId] = useState<number | string>("");

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const isEditing = produto !== null;

  // Bloqueia o scroll da página principal (Body) quando o modal abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && produto) {
        setNome(produto.nome);
        setDescricao(produto.descricao);
        setCodigo(produto.codigo || "");
        setPreco(produto.preco.toString());
        setPrecoCusto(produto.preco_de_custo?.toString() || "");
        setQuantidadeEstoque("");

        let found = false;
        for (const cat of arvore) {
          if (cat.subcategorias) {
            for (const sub of cat.subcategorias) {
              if (sub.grupos) {
                for (const grp of sub.grupos) {
                  if (grp.subgrupos) {
                    const targetSubgrupo = grp.subgrupos.find((sg: any) => sg.id === produto.subgrupo_id);
                    if (targetSubgrupo) {
                      setSelectedCategoriaId(cat.id);
                      setSelectedSubcategoriaId(sub.id);
                      setSelectedGrupoId(grp.id);
                      setSelectedSubgrupoId(targetSubgrupo.id);
                      found = true;
                      break;
                    }
                  }
                }
              }
              if (found) break;
            }
          }
          if (found) break;
        }
      } else {
        handleReset();
      }
      setErrors({});
    }
  }, [isOpen, produto, isEditing, arvore]);

  const subcategoriaOptions = useMemo(() => {
    if (!selectedCategoriaId) return [];
    const cat = arvore.find(c => c.id == selectedCategoriaId);
    return cat?.subcategorias || [];
  }, [selectedCategoriaId, arvore]);

  const grupoOptions = useMemo(() => {
    if (!selectedSubcategoriaId) return [];
    const sub = subcategoriaOptions.find((s: any) => s.id == selectedSubcategoriaId);
    return sub?.grupos || [];
  }, [selectedSubcategoriaId, subcategoriaOptions]);

  const subgrupoOptions = useMemo(() => {
    if (!selectedGrupoId) return [];
    const grp = grupoOptions.find((g: any) => g.id == selectedGrupoId);
    return grp?.subgrupos || [];
  }, [selectedGrupoId, grupoOptions]);

  const handleReset = () => {
    setNome("");
    setDescricao("");
    setCodigo("");
    setPreco("");
    setPrecoCusto("");
    setQuantidadeEstoque("");
    setSelectedCategoriaId("");
    setSelectedSubcategoriaId("");
    setSelectedGrupoId("");
    setSelectedSubgrupoId("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const precoNumero = Number(preco);
      const precoCustoNumero = Number(precoCusto) || 0;
      const payload: any = {
        nome,
        descricao,
        codigo: codigo || null,
        preco: precoNumero,
        preco_de_custo: precoCustoNumero,
        subgrupo_id: Number(selectedSubgrupoId),
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
        console.error("Erro", error);
        alert("Ocorreu um erro inesperado.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[89vh] overflow-hidden bg-white rounded-lg shadow-xl">

        {/* CABEÇALHO (Fixo) */}
        <div className="px-6 py-4 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            {isEditing ? `Editar Produto` : "Criar Novo Produto"}
          </h2>
          {/* Botão X para fechar (opcional, mas bom para UX) */}
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Fechar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTEÚDO (Com Scroll Interno) */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">

            {/* Nome */}
            <div>
              <InputLabel htmlFor="nome" value="Nome do Produto" />
              <TextInput id="nome" className="mt-1 block w-full" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
              <InputError message={errors.nome} className="mt-2" />
            </div>

            {/* Descrição */}
            <div>
              <InputLabel htmlFor="descricao" value="Descrição" />
              <TextInput id="descricao" className="mt-1 block w-full" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
              <InputError message={errors.descricao} className="mt-2" />
            </div>

            {/* Árvore Mercadológica (Grid 2 colunas) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <InputLabel value="Classificação (Árvore Mercadológica)" className="mb-1" />
              <div className="p-4 bg-white/60 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={selectedCategoriaId}
                    onChange={(e) => { setSelectedCategoriaId(e.target.value); setSelectedSubcategoriaId(""); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Categoria</option>
                    {arvore.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </select>

                  <select
                    value={selectedSubcategoriaId}
                    onChange={(e) => { setSelectedSubcategoriaId(e.target.value); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
                    disabled={!selectedCategoriaId}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Subcategoria</option>
                    {subcategoriaOptions.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>

                  <select
                    value={selectedGrupoId}
                    onChange={(e) => { setSelectedGrupoId(e.target.value); setSelectedSubgrupoId(""); }}
                    disabled={!selectedSubcategoriaId}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Grupo</option>
                    {grupoOptions.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>

                  <select
                    value={selectedSubgrupoId}
                    onChange={(e) => setSelectedSubgrupoId(e.target.value)}
                    disabled={!selectedGrupoId}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Subgrupo</option>
                    {subgrupoOptions.map(sg => <option key={sg.id} value={sg.id}>{sg.nome}</option>)}
                  </select>
                </div>
              </div>
              <InputError message={errors.subgrupo_id} className="mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Preço de Custo */}
              <div>
                <InputLabel htmlFor="preco_custo" value="Preço de Custo (R$)" />
                <TextInput id="preco_custo" type="number" step="0.01" min="0" className="mt-1 block w-full" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)} placeholder="0.00" />
                <InputError message={errors.preco_de_custo} className="mt-2" />
              </div>

              {/* Preço de Venda */}
              <div>
                <InputLabel htmlFor="preco" value="Preço de Venda (R$)" />
                <TextInput id="preco" type="number" step="0.01" min="0" className="mt-1 block w-full" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                <InputError message={errors.preco} className="mt-2" />
              </div>
            </div>

            <div>
              <InputLabel htmlFor="codigo" value="Código (EAN/SKU) (Opcional)" />
              <TextInput id="codigo" className="mt-1 block w-full" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <InputError message={errors.codigo} className="mt-2" />
            </div>

            {!isEditing && (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                <InputLabel htmlFor="quantidadeEstoque" value="Estoque Inicial" className="text-yellow-800" />
                <TextInput id="quantidadeEstoque" type="number" min="0" step="1" className="mt-1 block w-full border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500" value={quantidadeEstoque} onChange={(e) => setQuantidadeEstoque(e.target.value)} placeholder="0" />
                <InputError message={errors.quantidade_estoque} className="mt-2" />
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ (Fixo) */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-gray-50 rounded-b-lg">
          <SecondaryButton onClick={onClose} disabled={processing} className="mr-3">
            Cancelar
          </SecondaryButton>
          <PrimaryButton disabled={processing}>
            {processing ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Produto")}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}