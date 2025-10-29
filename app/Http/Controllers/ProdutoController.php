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
        // Agora também retorna a quantidade de estoque
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
            'quantidade_estoque' => 'nullable|integer|min:0', // Validamos, mas não usamos para o create
        ]);

        // --- INÍCIO DA CORREÇÃO ---

        // 1. Guardar a quantidade inicial e removê-la dos dados de criação
        $estoqueInicial = $dadosValidados['quantidade_estoque'] ?? 0;
        unset($dadosValidados['quantidade_estoque']);

        // 2. Criar o produto com estoque 0 (o default do banco)
        $produto = Produto::create($dadosValidados);

        // 3. Se foi informada uma quantidade inicial, registar no histórico (isto vai atualizar o total)
        if ($estoqueInicial > 0) {
            try {
                // O EstoqueService vai fazer (0 + $estoqueInicial)
                $this->estoqueService->movimentarEstoque(
                    $produto,
                    'entrada',
                    $estoqueInicial,
                    'Estoque inicial'
                );
            } catch (Exception $e) {
                // Não deve falhar, mas é bom ter
            }
        }
        
        // 4. Recarregar o produto do banco para garantir que temos o valor atualizado (ex: 8)
        // e carregar a categoria para o frontend
        $produto->refresh()->load('categoria');

        // --- FIM DA CORREÇÃO ---

        return response()->json($produto, 201);
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
            'quantidade_estoque' => 'prohibited', // Proibido atualizar estoque por aqui
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

