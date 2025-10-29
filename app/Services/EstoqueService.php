<?php

namespace App\Services;

use App\Models\Produto;
use Illuminate\Support\Facades\DB;
use Exception;

class EstoqueService
{
    /**
     * Movimenta o estoque de um produto (entrada ou saída).
     *
     * @param Produto $produto O produto a ser movimentado.
     * @param string $tipo 'entrada' ou 'saida'.
     * @param int $quantidade A quantidade a ser movimentada (positiva).
     * @param string|null $descricao Descrição opcional (ex: "Venda #1", "Compra Fornecedor X").
     * @return Produto O produto atualizado.
     * @throws Exception
     */
    public function movimentarEstoque(Produto $produto, string $tipo, int $quantidade, string $descricao = null): Produto
    {
        // Garante que a quantidade seja sempre positiva
        if ($quantidade <= 0) {
            throw new Exception('A quantidade deve ser maior que zero.');
        }

        // Inicia uma transação para garantir que as duas operações (atualizar total e criar histórico)
        // ocorram com sucesso. Se uma falhar, a outra é desfeita.
        return DB::transaction(function () use ($produto, $tipo, $quantidade, $descricao) {
            
            // Se for uma 'saída', verifica se há estoque suficiente
            if ($tipo === 'saida') {
                if ($produto->quantidade_estoque < $quantidade) {
                    throw new Exception('Estoque insuficiente para esta saída.');
                }
                // Atualiza o total de estoque no produto (decrementa)
                $produto->decrement('quantidade_estoque', $quantidade);
            } else {
                // Atualiza o total de estoque no produto (incrementa)
                $produto->increment('quantidade_estoque', $quantidade);
            }

            // Cria o registro no histórico de movimentações
            $produto->movimentacoes()->create([
                'tipo' => $tipo,
                'quantidade' => $quantidade,
                'descricao' => $descricao,
                // 'origem_id' e 'origem_tipo' serão usados depois (ex: em Vendas)
            ]);

            // Recarrega o produto do banco para retornar os dados atualizados
            $produto->refresh();

            return $produto;
        });
    }
}
