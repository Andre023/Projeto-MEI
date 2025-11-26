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
  public function index(Request $request)
  {
    $userId = Auth::id();

    // 1. Definição de Datas (Padrão: Últimos 30 dias)
    $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
    $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

    $startDateTime = Carbon::parse($startDate)->startOfDay();
    $endDateTime = Carbon::parse($endDate)->endOfDay();

    // 2. Totais Gerais (Filtrados por Data)
    // Usamos clone para reutilizar a query base de vendas
    $vendasQuery = Venda::where('user_id', $userId)
      ->whereBetween('created_at', [$startDateTime, $endDateTime]);

    $totalFaturamento = (clone $vendasQuery)->sum('total_venda');
    $totalVendas = (clone $vendasQuery)->count();

    // Totais Globais (Independentes de Data)
    $totalClientes = Cliente::where('user_id', $userId)->count();
    $totalProdutos = Produto::where('user_id', $userId)->count();

    // 3. Valor Total em Estoque (Novo KPI)
    // Custo * Quantidade atual em estoque
    $valorEstoque = Produto::where('user_id', $userId)
      ->sum(DB::raw('quantidade_estoque * preco_de_custo'));

    // 4. Lucro Estimado (Filtrado)
    $lucroEstimado = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$startDateTime, $endDateTime])
      ->selectRaw('SUM((venda_items.preco_unitario - COALESCE(produtos.preco_de_custo, 0)) * venda_items.quantidade) as lucro')
      ->value('lucro') ?? 0;

    // 5. Ticket Médio
    $ticketMedio = $totalVendas > 0 ? $totalFaturamento / $totalVendas : 0;

    // 6. Gráfico de Vendas (Evolução)
    // Ajusta agrupamento (Dia vs Mês) baseado no intervalo
    $diffInDays = $startDateTime->diffInDays($endDateTime);
    $sqliteFormat = $diffInDays <= 60 ? '%Y-%m-%d' : '%Y-%m'; // Agrupa por dia se intervalo curto

    $graficoVendas = Venda::where('user_id', $userId)
      ->whereBetween('created_at', [$startDateTime, $endDateTime])
      ->selectRaw("strftime('$sqliteFormat', created_at) as mes, SUM(total_venda) as total")
      ->groupBy('mes')
      ->orderBy('mes')
      ->get();

    // 7. Vendas por Grupo/Categoria (Novo Gráfico)
    $vendasPorGrupo = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->join('subgrupos', 'produtos.subgrupo_id', '=', 'subgrupos.id')
      ->join('grupos', 'subgrupos.grupo_id', '=', 'grupos.id')
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$startDateTime, $endDateTime])
      ->select('grupos.nome', DB::raw('SUM(venda_items.quantidade * venda_items.preco_unitario) as total'))
      ->groupBy('grupos.id', 'grupos.nome')
      ->orderByDesc('total')
      ->get();

    // 8. Top Produtos Mais Vendidos
    $topProdutos = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$startDateTime, $endDateTime])
      ->select(
        'produtos.nome',
        DB::raw('SUM(venda_items.quantidade) as total_vendido'),
        DB::raw('SUM(venda_items.quantidade * venda_items.preco_unitario) as valor_total')
      )
      ->groupBy('produtos.id', 'produtos.nome')
      ->orderByDesc('total_vendido')
      ->limit(5)
      ->get();

    // 9. Top Clientes (Novo)
    $topClientes = Venda::where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$startDateTime, $endDateTime])
      ->join('clientes', 'vendas.cliente_id', '=', 'clientes.id')
      ->select(
        'clientes.nome',
        DB::raw('COUNT(vendas.id) as compras'),
        DB::raw('SUM(vendas.total_venda) as total')
      )
      ->groupBy('clientes.id', 'clientes.nome')
      ->orderByDesc('total')
      ->limit(5)
      ->get();

    // 10. Produtos com Estoque Baixo (Sempre Atual)
    $estoqueBaixo = Produto::where('user_id', $userId)
      ->where('quantidade_estoque', '<', 5)
      ->orderBy('quantidade_estoque', 'asc')
      ->limit(5)
      ->get();

    return response()->json([
      'faturamento'     => $totalFaturamento,
      'lucro'           => $lucroEstimado,
      'vendas_count'    => $totalVendas,
      'clientes_count'  => $totalClientes,
      'ticket_medio'    => $ticketMedio,
      'valor_estoque'   => $valorEstoque,
      'grafico_vendas'  => $graficoVendas,
      'vendas_por_grupo' => $vendasPorGrupo,
      'top_produtos'    => $topProdutos,
      'top_clientes'    => $topClientes,
      'estoque_baixo'   => $estoqueBaixo,
    ]);
  }
}
