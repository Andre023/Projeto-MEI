<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venda;
use App\Models\Produto;
use App\Services\EstoqueService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class VendaController extends Controller
{
  public function __construct(private EstoqueService $estoqueService) {}

  public function index(Request $request): JsonResponse
  {
    $perPage = $request->input('per_page', 10);
    $sortKey = $request->input('sort_key', 'created_at'); // Padrão por data
    $sortDir = $request->input('sort_direction', 'desc');

    $validSortKeys = ['id', 'total_venda', 'created_at', 'cliente_id'];
    if (!in_array($sortKey, $validSortKeys)) {
      $sortKey = 'created_at';
    }

    $query = Venda::with('cliente')
      ->where('user_id', Auth::id());

    if ($request->filled('search')) {
      $term = $request->input('search');
      $query->where(function ($q) use ($term) {
        $q->where('id', 'LIKE', "%{$term}%")
          ->orWhereHas('cliente', function ($clienteQuery) use ($term) {
            $clienteQuery->where('nome', 'LIKE', "%{$term}%");
          });
      });
    }

    if ($request->filled('cliente_id')) {
      $query->where('cliente_id', $request->input('cliente_id'));
    }

    $query->orderBy($sortKey, $sortDir);
    $vendas = $query->paginate($perPage);

    return response()->json($vendas);
  }

  public function store(Request $request): JsonResponse
  {
    $dadosValidados = $request->validate([
      'cliente_id' => 'required|exists:clientes,id',
      'items' => 'required|array|min:1',
      'items.*.produto_id' => 'required|exists:produtos,id',
      'items.*.quantidade' => 'required|integer|min:1',
    ]);

    $totalVenda = 0;
    $vendaItems = [];
    $produtosParaAtualizarEstoque = [];

    try {
      $venda = DB::transaction(function () use ($dadosValidados, &$totalVenda, &$vendaItems, &$produtosParaAtualizarEstoque) {
        $venda = Venda::create([
          'user_id' => Auth::id(),
          'cliente_id' => $dadosValidados['cliente_id'],
          'total_venda' => 0,
        ]);

        $items = $dadosValidados['items'];

        foreach ($items as $item) {
          $produto = Produto::where('user_id', Auth::id())->find($item['produto_id']);

          if (!$produto) {
            throw new Exception("Produto ID {$item['produto_id']} inválido.");
          }

          // Verifica estoque antes
          if (($produto->quantidade_estoque ?? 0) < $item['quantidade']) {
            throw new Exception("Estoque insuficiente para o produto: {$produto->nome}");
          }

          $precoUnitario = $produto->preco;
          $quantidade = $item['quantidade'];
          $totalVenda += $precoUnitario * $quantidade;

          $vendaItems[] = [
            'venda_id' => $venda->id,
            'produto_id' => $produto->id,
            'quantidade' => $quantidade,
            'preco_unitario' => $precoUnitario,
            'created_at' => now(),
            'updated_at' => now(),
          ];

          $produtosParaAtualizarEstoque[] = [
            'produto' => $produto,
            'quantidade' => $quantidade,
            'venda_id' => $venda->id,
          ];
        }

        DB::table('venda_items')->insert($vendaItems);
        $venda->total_venda = $totalVenda;
        $venda->save();

        foreach ($produtosParaAtualizarEstoque as $mov) {
          $this->estoqueService->movimentarEstoque(
            $mov['produto'],
            'saida',
            $mov['quantidade'],
            "Venda #{$mov['venda_id']}"
          );
        }

        return $venda;
      });

      $venda->load('cliente', 'items.produto');
      return response()->json($venda, 201);
    } catch (Exception $e) {
      return response()->json(['message' => $e->getMessage()], 422);
    }
  }

  public function show($id): JsonResponse
  {
    $venda = Venda::where('user_id', Auth::id())
      ->with('cliente', 'items.produto')
      ->findOrFail($id);
    return response()->json($venda);
  }

  /**
   * Exclui uma venda e ESTORNA o estoque.
   */
  public function destroy($id): JsonResponse
  {
    try {
      DB::transaction(function () use ($id) {
        // 1. Busca a venda com os itens e produtos
        $venda = Venda::where('user_id', Auth::id())
          ->with('items.produto')
          ->findOrFail($id);

        // 2. Estorna o estoque de cada item
        foreach ($venda->items as $item) {
          if ($item->produto) {
            $this->estoqueService->movimentarEstoque(
              $item->produto,
              'entrada', // Devolve ao estoque
              $item->quantidade,
              "Estorno - Exclusão Venda #{$venda->id}"
            );
          }
        }

        // 3. Deleta a venda (cascade deleta os itens)
        $venda->delete();
      });

      return response()->json(null, 204);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      // Se não achar a venda (ou não for do usuário), retorna 404
      return response()->json(['message' => 'Venda não encontrada.'], 404);
    } catch (Exception $e) {
      // Qualquer outro erro (banco, lógica) retorna 500
      return response()->json(['message' => 'Erro ao excluir venda: ' . $e->getMessage()], 500);
    }
  }
}
