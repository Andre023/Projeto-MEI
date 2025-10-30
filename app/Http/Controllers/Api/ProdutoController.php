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

        // --- CORREÇÃO DO BUG DO ESTOQUE DOBRADO ---
        // 1. Guardar a quantidade inicial e removê-la dos dados de criação
        $estoqueInicial = $dadosValidados['quantidade_estoque'] ?? 0;
        unset($dadosValidados['quantidade_estoque']);

        // 2. Criar o produto (com estoque 0 ou default do banco)
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
                // Se falhar, não trava o cadastro, mas é bom registrar
                report($e);
            }
        }
        
        // 4. Recarregar o produto do banco para garantir que temos o valor atualizado
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


    // --- COPIE E COLE ESTE NOVO MÉTODO NO FINAL DA CLASSE ---

    /**
     * Busca o histórico unificado de um produto.
     */
    public function historico(Produto $produto): JsonResponse
    {
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