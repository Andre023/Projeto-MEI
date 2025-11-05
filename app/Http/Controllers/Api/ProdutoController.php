<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;
use App\Services\EstoqueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Exception;
// --- ADICIONE ESTES IMPORTS ---
use App\Models\AuditoriaProduto;
use App\Models\MovimentacaoEstoque;
use Illuminate\Support\Facades\Auth; // <--- ADICIONE ESTE

class ProdutoController extends Controller
{
    public function __construct(private EstoqueService $estoqueService)
    {
    }

    public function index(): JsonResponse
    {
        // Apenas produtos do usuário autenticado
        return response()->json(
            Produto::with('categoria')
                ->where('user_id', Auth::id()) // <--- ADICIONADO
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $dadosValidados = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:500',
            // Corrigido para verificar unicidade do código APENAS para o user_id
            'codigo' => [
                'nullable',
                'string',
                'max:25',
                Rule::unique('produtos', 'codigo')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
            'categoria_id' => 'required|exists:categorias,id', // Você também pode querer filtrar isso
            'preco' => 'required|numeric|min:0',
            'quantidade_estoque' => 'nullable|integer|min:0',
        ]);

        // Atribui o ID do usuário logado ao dado antes de criar
        $dadosValidados['user_id'] = Auth::id(); // <--- ADICIONADO

        // --- Resto do método 'store' permanece o mesmo ---
        // 1. Guardar a quantidade inicial e removê-la dos dados de criação
        $estoqueInicial = $dadosValidados['quantidade_estoque'] ?? 0;
        unset($dadosValidados['quantidade_estoque']);

        // 2. Criar o produto
        $produto = Produto::create($dadosValidados);

        // 3. Se foi informada uma quantidade inicial, registar no histórico
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
        
        // 4. Recarregar o produto
        $produto->refresh()->load('categoria');
        // --- FIM DA CORREÇÃO ---

        return response()->json($produto, 201);
    }
    
    // Altera a assinatura de Produto $produto para $id
    public function show($id): JsonResponse // <--- ALTERADA A ASSINATURA
    {
        // Busca o produto pelo ID, mas restrito ao usuário autenticado
        $produto = Produto::where('user_id', Auth::id())
            ->with('categoria', 'movimentacoes')
            ->findOrFail($id); // <--- ALTERADO
            
        return response()->json($produto);
    }

    // Altera a assinatura de Produto $produto para $id
    public function update(Request $request, $id): JsonResponse // <--- ALTERADA A ASSINATURA
    {
        // Busca o produto pelo ID, mas restrito ao usuário autenticado
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id); // <--- ADICIONADO

        $dadosValidados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string|max:500',
            // Corrigido para verificar unicidade do código APENAS para o user_id e ignorando o produto atual
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
            'categoria_id' => 'sometimes|exists:categorias,id', // Você pode querer filtrar isso também
            'preco' => 'sometimes|numeric|min:0',
            'quantidade_estoque' => 'prohibited',
        ]);

        $produto->update($dadosValidados);
        return response()->json($produto->load('categoria'));
    }

    // Altera a assinatura de Produto $produto para $id
    public function destroy($id): JsonResponse // <--- ALTERADA A ASSINATURA
    {
        // Busca o produto pelo ID, mas restrito ao usuário autenticado
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id); // <--- ADICIONADO
        $produto->delete();
        return response()->json(null, 204);
    }

    // Altera a assinatura de Produto $produto para $id
    public function movimentarEstoque(Request $request, $id): JsonResponse // <--- ALTERADA A ASSINATURA
    {
        // Busca o produto pelo ID, mas restrito ao usuário autenticado
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id); // <--- ADICIONADO
        
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


    /**
     * Busca o histórico unificado de um produto.
     */
    // Altera a assinatura de Produto $produto para $id
    public function historico($id): JsonResponse // <--- ALTERADA A ASSINATURA
    {
        // Busca o produto pelo ID, mas restrito ao usuário autenticado
        $produto = Produto::where('user_id', Auth::id())->findOrFail($id); // <--- ADICIONADO
        
        // 1. Busca o histórico de estoque (usando sua relação 'movimentacoes')
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
                    'id' => 'est-' . $mov->id, // ID único
                    'data' => $mov->created_at,
                    'tipo' => 'Estoque',
                    'descricao' => $desc,
                    'cor' => $mov->tipo === 'entrada' ? 'text-green-600' : 'text-red-600',
                ];
            });

        // 2. Busca o histórico de alterações (auditoria)
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

        // 3. Junta as duas coleções e ordena pela data
        $historico = $movimentacoes->merge($alteracoes)
                                ->sortByDesc('data') // Ordena pela data de criação
                                ->values(); // Reseta as chaves do array

        return response()->json($historico);
    }
}