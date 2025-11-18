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
  // Injetamos o EstoqueService, assim como no ProdutoController
  public function __construct(private EstoqueService $estoqueService) {}

  /**
   * Lista todas as vendas, com paginação e filtros.
   */
  public function index(Request $request): JsonResponse
  {
    $perPage = $request->input('per_page', 10);
    $sortKey = $request->input('sort_key', 'id');
    $sortDir = $request->input('sort_direction', 'desc');

    $validSortKeys = ['id', 'total_venda', 'created_at', 'cliente_id'];
    if (!in_array($sortKey, $validSortKeys)) {
      $sortKey = 'id';
    }

    $query = Venda::with('cliente') // Carrega o relacionamento com o cliente
      ->where('user_id', Auth::id());

    // 1. Filtro de Busca (pode buscar pelo ID da venda ou nome do cliente)
    if ($request->filled('search')) {
      $term = $request->input('search');
      $query->where(function ($q) use ($term) {
        $q->where('id', 'LIKE', "%{$term}%")
          ->orWhereHas('cliente', function ($clienteQuery) use ($term) {
            $clienteQuery->where('nome', 'LIKE', "%{$term}%");
          });
      });
    }

    // 2. Filtro por Cliente
    if ($request->filled('cliente_id')) {
      $query->where('cliente_id', $request->input('cliente_id'));
    }

    // 3. Ordenação
    $query->orderBy($sortKey, $sortDir);

    // 4. Paginação
    $vendas = $query->paginate($perPage);

    return response()->json($vendas);
  }

  /**
   * Cria uma nova venda.
   */
  public function store(Request $request): JsonResponse
  {
    // Validação dos dados
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
      // Inicia uma transação
      $venda = DB::transaction(function () use ($dadosValidados, &$totalVenda, &$vendaItems, &$produtosParaAtualizarEstoque) {

        // 1. Cria a Venda (cabeçalho)
        $venda = Venda::create([
          'user_id' => Auth::id(),
          'cliente_id' => $dadosValidados['cliente_id'],
          'total_venda' => 0, // Total temporário
        ]);

        $items = $dadosValidados['items'];

        // 2. Processa os Itens
        foreach ($items as $item) {
          $produto = Produto::where('user_id', Auth::id())->find($item['produto_id']);

          if (!$produto) {
            throw new Exception("Produto com ID {$item['produto_id']} não encontrado.");
          }

          $precoUnitario = $produto->preco; // Pega o preço de venda atual do produto
          $quantidade = $item['quantidade'];

          // Adiciona ao total
          $totalVenda += $precoUnitario * $quantidade;

          // Prepara o item para ser criado no banco
          $vendaItems[] = [
            'venda_id' => $venda->id,
            'produto_id' => $produto->id,
            'quantidade' => $quantidade,
            'preco_unitario' => $precoUnitario,
            'created_at' => now(),
            'updated_at' => now(),
          ];

          // Prepara a movimentação de estoque
          $produtosParaAtualizarEstoque[] = [
            'produto' => $produto,
            'quantidade' => $quantidade,
            'venda_id' => $venda->id,
          ];
        }

        // 3. Insere todos os itens de uma vez (mais eficiente)
        DB::table('venda_items')->insert($vendaItems);

        // 4. Atualiza o Total da Venda
        $venda->total_venda = $totalVenda;
        $venda->save();

        // 5. Movimenta o Estoque (fora da transação principal se o EstoqueService já usa transação)
        // Mas para garantir a atomicidade, fazemos aqui.
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

      // Recarrega a venda com o cliente e os itens (e os produtos dentro dos itens)
      $venda->load('cliente', 'items.produto');

      return response()->json($venda, 201);
    } catch (Exception $e) {
      // Se algo der errado (ex: estoque insuficiente), o DB::transaction faz o rollback
      return response()->json(['message' => $e->getMessage()], 422);
    }
  }

  /**
   * Exibe uma venda específica com seus itens.
   */
  public function show($id): JsonResponse
  {
    $venda = Venda::where('user_id', Auth::id())
      ->with('cliente', 'items.produto') // Carrega cliente e os itens com seus produtos
      ->findOrFail($id);

    return response()->json($venda);
  }

  /**
   * Exclui uma venda.
   * NOTA: Isso NÃO reverte o estoque. Seria necessário um método 'cancelarVenda'
   * para fazer a lógica de estorno (entrada de estoque).
   */
  public function destroy($id): JsonResponse
  {
    $venda = Venda::where('user_id', Auth::id())->findOrFail($id);

    // O cascade no banco de dados (onDelete('cascade'))
    // deve apagar os 'venda_items' automaticamente.
    $venda->delete();

    return response()->json(null, 204);
  }
}
