<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Produto;
use App\Models\Venda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstatisticaController extends Controller
{
  public function index()
  {
    $userId = Auth::id();

    // 1. Totais Gerais
    $totalFaturamento = Venda::where('user_id', $userId)->sum('total_venda');
    $totalVendas = Venda::where('user_id', $userId)->count();
    $totalClientes = Cliente::where('user_id', $userId)->count();
    $totalProdutos = Produto::where('user_id', $userId)->count();

    // 2. Cálculo de Lucro Estimado
    // (VendaItem Preço - Produto Custo Atual) * Quantidade
    // Nota: O ideal seria ter salvo o custo no momento da venda, mas usaremos o atual como base.
    $lucroEstimado = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->where('vendas.user_id', $userId)
      ->selectRaw('SUM((venda_items.preco_unitario - COALESCE(produtos.preco_de_custo, 0)) * venda_items.quantidade) as lucro')
      ->value('lucro');

    // 3. Ticket Médio
    $ticketMedio = $totalVendas > 0 ? $totalFaturamento / $totalVendas : 0;

    // 4. Vendas nos últimos 6 meses (para o gráfico)
    $vendasPorMes = Venda::where('user_id', $userId)
      ->where('created_at', '>=', Carbon::now()->subMonths(6))
      ->selectRaw("strftime('%Y-%m', created_at) as mes, SUM(total_venda) as total") // Para SQLite. Se usar MySQL use DATE_FORMAT(created_at, '%Y-%m')
      ->groupBy('mes')
      ->orderBy('mes')
      ->get();

    // 5. Produtos com Estoque Baixo (Alertas)
    $estoqueBaixo = Produto::where('user_id', $userId)
      ->where('quantidade_estoque', '<', 5) // Supondo que 5 seja o limite
      ->orderBy('quantidade_estoque', 'asc')
      ->limit(5)
      ->get();

    // 6. Top 5 Produtos Mais Vendidos
    $topProdutos = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->where('vendas.user_id', $userId)
      ->select('produtos.nome', DB::raw('SUM(venda_items.quantidade) as total_vendido'))
      ->groupBy('produtos.id', 'produtos.nome')
      ->orderByDesc('total_vendido')
      ->limit(5)
      ->get();

    return response()->json([
      'faturamento' => $totalFaturamento,
      'lucro' => $lucroEstimado,
      'vendas_count' => $totalVendas,
      'clientes_count' => $totalClientes,
      'ticket_medio' => $ticketMedio,
      'grafico_vendas' => $vendasPorMes,
      'estoque_baixo' => $estoqueBaixo,
      'top_produtos' => $topProdutos
    ]);
  }
}
