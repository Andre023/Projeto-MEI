import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { User, Produto, Cliente } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';

// (Em breve vamos criar estes dois componentes)
import CarrinhoVenda from './Partials/CarrinhoVenda';
import CatalogoProdutos from './Partials/CatalogoProdutos';

// A interface do item no carrinho
export interface ItemCarrinho {
  produto_id: number;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  estoque_atual: number;
}

interface CreateVendaProps {
  auth: { user: User };
  // (Podemos passar clientes e produtos pré-carregados aqui se quisermos)
  clientes: Cliente[];
  produtos: Produto[];
}

// Nota: Estamos passando 'clientes' e 'produtos' via props
// Para otimizar, podemos fazer a rota 'vendas.create' no PHP
// já buscar isso e passar para a página.
const CreateVenda: React.FC<CreateVendaProps> = ({ auth, clientes, produtos }) => {

  // O "cérebro" da página: o estado do carrinho
  const [items, setItems] = useState<ItemCarrinho[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LÓGICA DO CARRINHO ---
  // (Esta lógica estava no VendaFormModal e subiu para o "Pai")

  const handleAddProduto = (produto: Produto) => {
    // 1. Verifica se o item já existe
    const itemExistente = items.find(i => i.produto_id === produto.id);

    if (itemExistente) {
      // 2. Se existe, só aumenta a quantidade (respeitando o estoque)
      if (itemExistente.quantidade < itemExistente.estoque_atual) {
        setItems(items.map(i =>
          i.produto_id === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        ));
      }
    } else {
      const estoque = produto.quantidade_estoque ?? 0;

      // 3. Se não existe, adiciona ao carrinho
      if (estoque > 0) { // 2. Verifique usando a variável segura 'estoque'
        setItems([...items, {
          produto_id: produto.id,
          nome: produto.nome,
          preco_unitario: produto.preco,
          quantidade: 1,
          estoque_atual: estoque, // 3. Atribua a variável segura 'estoque'
        }]);
      }
    }
  };

  const handleQuantidadeChange = (produto_id: number, novaQuantidade: number) => {
    const item = items.find(i => i.produto_id === produto_id);
    if (!item) return;

    // Não permite 0 ou negativo, e não permite mais que o estoque
    if (novaQuantidade <= 0) novaQuantidade = 1;
    if (novaQuantidade > item.estoque_atual) novaQuantidade = item.estoque_atual;

    setItems(prevItems =>
      prevItems.map(i =>
        i.produto_id === produto_id ? { ...i, quantidade: novaQuantidade } : i
      )
    );
  };

  const handleRemoveItem = (produto_id: number) => {
    setItems(prevItems => prevItems.filter(i => i.produto_id !== produto_id));
  };

  // --- LÓGICA DE SUBMISSÃO ---
  const handleSubmitVenda = async () => {
    setIsSubmitting(true);

    const dadosVenda = {
      cliente_id: selectedClienteId,
      items: items.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      })),
    };

    try {
      await axios.post(route('vendas.store'), dadosVenda); // Usa a rota da API

      // Sucesso! Limpa o carrinho e redireciona para a lista de vendas
      setItems([]);
      setSelectedClienteId("");
      router.visit(route('vendas'), {
        // Podemos adicionar uma notificação de sucesso aqui
      });

    } catch (error: any) {
      setIsSubmitting(false);
      // (Lidar com erros de validação ou estoque)
      if (error.response && error.response.data.message) {
        alert("Erro: " + error.response.data.message); // Alerta simples
      } else {
        alert("Ocorreu um erro inesperado.");
      }
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nova Venda" />

      {/* 1. Fundo geral escuro */}
      <div className="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* --- COLUNA DA ESQUERDA (CATÁLOGO) --- */}
            <div className="w-full lg:w-3/5">
              {/* 2. Container catálogo escuro */}
              <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Catálogo de Produtos</h2>
                <CatalogoProdutos
                  onAddProduto={handleAddProduto}
                />
              </div>
            </div>

            {/* --- COLUNA DA DIREITA (CARRINHO/PEDIDO) --- */}
            <div className="w-full lg:w-2/5">
              {/* 3. Container carrinho escuro */}
              <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 sticky top-24 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pedido</h2>
                </div>
                <CarrinhoVenda
                  items={items}
                  selectedClienteId={selectedClienteId}
                  isSubmitting={isSubmitting}
                  onClienteChange={(id) => setSelectedClienteId(id)}
                  onQuantidadeChange={handleQuantidadeChange}
                  onItemRemove={handleRemoveItem}
                  onSubmit={handleSubmitVenda}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default CreateVenda;