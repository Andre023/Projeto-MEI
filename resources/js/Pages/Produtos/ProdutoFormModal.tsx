import React, { useState, FormEvent, useEffect, useMemo } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Produto, CategoriaArvore } from "@/types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

  // --- LÓGICA DE CÁLCULO DA MARGEM ---
  const precoNum = parseFloat(preco) || 0;
  const precoCustoNum = parseFloat(precoCusto) || 0;

  // Calcula a porcentagem real de lucro
  const margemPercentual = precoCustoNum > 0 && precoNum > 0
    ? ((precoNum - precoCustoNum) / precoCustoNum) * 100
    : 0;

  const isMargemBaixa = precoCustoNum > 0 && precoNum > 0 && margemPercentual < 30;
  const isMargemBoa = precoCustoNum > 0 && precoNum > 0 && margemPercentual >= 30;
  const margemIdeal = precoCustoNum * 1.3;
  // ------------------------------------

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
        setDescricao(produto.descricao || "");
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
      {/* Container principal com fundo escuro */}
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[89vh] overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors">

        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isEditing ? `Editar Produto` : "Criar Novo Produto"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <span className="sr-only">Fechar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTEÚDO SCROLLABLE */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">

            {/* Nome */}
            <div>
              {/* Note que o InputLabel já deve ter suporte a dark mode se você atualizou o arquivo global, se não, adicione 'dark:text-gray-300' aqui */}
              <InputLabel htmlFor="nome" value="Nome do Produto" className="dark:text-gray-300" />
              <TextInput id="nome" className="mt-1 block w-full" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
              <InputError message={errors.nome} className="mt-2" />
            </div>

            {/* Descrição */}
            <div>
              <InputLabel htmlFor="descricao" value="Descrição" className="dark:text-gray-300" />
              <TextInput id="descricao" className="mt-1 block w-full" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
              <InputError message={errors.descricao} className="mt-2" />
            </div>

            {/* Árvore Mercadológica */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/30">
              <InputLabel value="Classificação (Árvore Mercadológica)" className="mb-1 dark:text-gray-300" />
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                  {/* Selects: Precisam de estilo manual pois são nativos */}
                  <select
                    value={selectedCategoriaId}
                    onChange={(e) => { setSelectedCategoriaId(e.target.value); setSelectedSubcategoriaId(""); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Categoria</option>
                    {arvore.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </select>

                  <select
                    value={selectedSubcategoriaId}
                    onChange={(e) => { setSelectedSubcategoriaId(e.target.value); setSelectedGrupoId(""); setSelectedSubgrupoId(""); }}
                    disabled={!selectedCategoriaId}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Subcategoria</option>
                    {subcategoriaOptions.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>

                  <select
                    value={selectedGrupoId}
                    onChange={(e) => { setSelectedGrupoId(e.target.value); setSelectedSubgrupoId(""); }}
                    disabled={!selectedSubcategoriaId}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Grupo</option>
                    {grupoOptions.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>

                  <select
                    value={selectedSubgrupoId}
                    onChange={(e) => setSelectedSubgrupoId(e.target.value)}
                    disabled={!selectedGrupoId}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
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
                <InputLabel htmlFor="preco_custo" value="Preço de Custo (R$)" className="dark:text-gray-300" />
                <TextInput id="preco_custo" type="number" step="0.01" min="0" className="mt-1 block w-full" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)} placeholder="0.00" />
                <InputError message={errors.preco_de_custo} className="mt-2" />
              </div>

              {/* Preço de Venda */}
              <div>
                <InputLabel htmlFor="preco" value="Preço de Venda (R$)" className="dark:text-gray-300" />
                <TextInput
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`mt-1 block w-full ${isMargemBaixa ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500' : ''} ${isMargemBoa ? 'border-green-400 focus:border-green-500 focus:ring-green-500' : ''}`}
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                />
                <InputError message={errors.preco} className="mt-2" />
              </div>
            </div>

            {/* --- FEEDBACK VISUAL DE MARGEM (Dark Mode Ready) --- */}
            {isMargemBaixa && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-3 flex items-start gap-3 mt-1 animate-pulse-once transition-colors">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-bold block mb-1">
                    Atenção: Margem baixa ({margemPercentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)
                  </span>
                  <span className="dark:text-yellow-300/80">
                    Para atingir 30%, o preço ideal seria <strong className="dark:text-yellow-200">R$ {margemIdeal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                </div>
              </div>
            )}

            {isMargemBoa && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-3 flex items-center gap-3 mt-1 animate-pulse-once transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-bold">
                    Margem excelente!
                  </span>
                  <span className="ml-1 dark:text-green-300/80">
                    Você está tendo <strong className="dark:text-green-200">{margemPercentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong> de lucro bruto.
                  </span>
                </div>
              </div>
            )}
            {/* --------------------------------- */}

            <div>
              <InputLabel htmlFor="codigo" value="Código (EAN/SKU) (Opcional)" className="dark:text-gray-300" />
              <TextInput id="codigo" className="mt-1 block w-full" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <InputError message={errors.codigo} className="mt-2" />
            </div>

            {!isEditing && (
              // Card de Estoque inicial no dark mode
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-800/30">
                <InputLabel htmlFor="quantidadeEstoque" value="Estoque Inicial" className="text-yellow-800 dark:text-yellow-500" />
                <TextInput
                  id="quantidadeEstoque"
                  type="number"
                  min="0"
                  step="1"
                  className="mt-1 block w-full border-yellow-300 dark:border-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:bg-gray-800"
                  value={quantidadeEstoque}
                  onChange={(e) => setQuantidadeEstoque(e.target.value)}
                  placeholder="0"
                />
                <InputError message={errors.quantidade_estoque} className="mt-2" />
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
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