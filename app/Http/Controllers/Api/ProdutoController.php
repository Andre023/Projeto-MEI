<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;
use App\Services\EstoqueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Exception;

class ProdutoController extends Controller
{
    public function __construct(private EstoqueService $estoqueService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json(Produto::with('categoria')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $dadosValidados = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:500',
            'codigo' => 'nullable|string|max:25|unique:produtos,codigo',
            'categoria_id' => 'required|exists:categorias,id',
            'preco' => 'required|numeric|min:0',
            'quantidade_estoque' => 'nullable|integer|min:0',
        ]);

        $produto = Produto::create($dadosValidados);

        if ($produto->quantidade_estoque > 0) {
            try {
                $this->estoqueService->movimentarEstoque(
                    $produto,
                    'entrada',
                    $produto->quantidade_estoque,
                    'Estoque inicial'
                );
            } catch (Exception $e) {
            }
        }

        return response()->json($produto->load('categoria'), 201);
    }

    public function show(Produto $produto): JsonResponse
    {
        return response()->json(
            $produto->load('categoria', 'movimentacoes')
        );
    }

    public function update(Request $request, Produto $produto): JsonResponse
    {
        $dadosValidados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string|max:500',
            'codigo' => ['sometimes', 'nullable', 'string', 'max:25', Rule::unique('produtos')->ignore($produto->id)],
            'categoria_id' => 'sometimes|exists:categorias,id',
            'preco' => 'sometimes|numeric|min:0',
            'quantidade_estoque' => 'prohibited',
        ]);

        $produto->update($dadosValidados);

        return response()->json($produto->load('categoria'));
    }

    public function destroy(Produto $produto): JsonResponse
    {
        $produto->delete();
        return response()->json(null, 204);
    }

    public function movimentarEstoque(Request $request, Produto $produto): JsonResponse
    {
        $dadosValidados = $request->validate([
            'quantidade' => 'required|integer|min:1',
            'tipo' => ['required', Rule::in(['entrada', 'saida'])],
            'descricao' => 'nullable|string|max:255',
        ]);

        try {
            $produtoAtualizado = $this->estoqueService->movimentarEstoque(
                $produto,
                $dadosValidados['tipo'],
                $dadosValidados['quantidade'],
                $dadosValidados['descricao'] ?? null
            );

            return response()->json(
                $produtoAtualizado->load('movimentacoes')
            );
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}