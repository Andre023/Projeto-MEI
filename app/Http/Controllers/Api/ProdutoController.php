<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;
use App\Services\EstoqueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Exception;
use App\Models\AuditoriaProduto;
use App\Models\MovimentacaoEstoque;
use Illuminate\Support\Facades\Auth;

class ProdutoController extends Controller
{
    public function __construct(private EstoqueService $estoqueService) {}

    public function index(): JsonResponse
    {
        return response()->json(
            Produto::with('subgrupo.grupo.subcategoria.categoria')
                ->where('user_id', Auth::id())
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $dadosValidados = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:500',
            'codigo' => [
                'nullable',
                'string',
                'max:25',
                Rule::unique('produtos', 'codigo')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
            'subgrupo_id' => 'required|exists:subgrupos,id',
            'preco' => 'required|numeric|min:0',
            'quantidade_estoque' => 'nullable|integer|min:0',
        ]);

        $dadosValidados['user_id'] = Auth::id();

        $estoqueInicial = $dadosValidados['quantidade_estoque'] ?? 0;
        unset($dadosValidados['quantidade_estoque']);

        $produto = Produto::create($dadosValidados);

        if ($estoqueInicial > 0) {
            try {
                $this->estoqueService->movimentarEstoque(
                    $produto,
                    'entrada',
                    $estoqueInicial,
                    'Estoque inicial'
                );
            } catch (Exception $e) {
                report($e);
            }
        }

        $produto->refresh()->load('subgrupo.grupo.subcategoria.categoria');

        return response()->json($produto, 201);
    }

    public function show($id): JsonResponse
    {
        $produto = Produto::where('user_id', Auth::id())
            ->with('subgrupo.grupo.subcategoria.categoria', 'movimentacoes')
            ->findOrFail($id);

        return response()->json($produto);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id);

        $dadosValidados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string|max:500',
            'codigo' => [
                'sometimes',
                'nullable',
                'string',
                'max:25',
                Rule::unique('produtos', 'codigo')
                    ->ignore($produto->id)
                    ->where(function ($query) {
                        return $query->where('user_id', Auth::id());
                    })
            ],
            'subgrupo_id' => 'sometimes|exists:subgrupos,id',
            'preco' => 'sometimes|numeric|min:0',
            'quantidade_estoque' => 'prohibited',
        ]);

        $produto->update($dadosValidados);
        return response()->json($produto->load('subgrupo.grupo.subcategoria.categoria'));
    }

    public function destroy($id): JsonResponse
    {
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id);
        $produto->delete();
        return response()->json(null, 204);
    }

    public function movimentarEstoque(Request $request, $id): JsonResponse
    {
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id);

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

    public function historico($id): JsonResponse
    {
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id);

        $movimentacoes = $produto->movimentacoes()
            ->select('id', 'tipo', 'quantidade', 'descricao', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (MovimentacaoEstoque $mov) {
                $desc = $mov->tipo === 'entrada' ? 'Entrada de' : 'Saída de';
                $desc .= " {$mov->quantidade} un.";
                if ($mov->descricao) {
                    $desc .= " (Motivo: {$mov->descricao})";
                }

                return [
                    'id' => 'est-' . $mov->id,
                    'data' => $mov->created_at,
                    'tipo' => 'Estoque',
                    'descricao' => $desc,
                    'cor' => $mov->tipo === 'entrada' ? 'text-green-600' : 'text-red-600',
                ];
            });

        $alteracoes = $produto->auditorias()
            ->select('id', 'campo_alterado', 'valor_antigo', 'valor_novo', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (AuditoriaProduto $aud) {
                return [
                    'id' => 'aud-' . $aud->id,
                    'data' => $aud->created_at,
                    'tipo' => 'Alteração',
                    'descricao' => "Campo '{$aud->campo_alterado}' alterado de '{$aud->valor_antigo}' para '{$aud->valor_novo}'.",
                    'cor' => 'text-blue-600',
                ];
            });

        $historico = $movimentacoes->merge($alteracoes)
            ->sortByDesc('data')
            ->values();

        return response()->json($historico);
    }
}
