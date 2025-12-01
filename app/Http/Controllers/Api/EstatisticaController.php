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

    // Datas
    $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
    $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
    $currentStart = Carbon::parse($startDate)->startOfDay();
    $currentEnd = Carbon::parse($endDate)->endOfDay();

    // Período Anterior
    $daysDiff = $currentStart->diffInDays($currentEnd) + 1;
    $prevStart = (clone $currentStart)->subDays($daysDiff);
    $prevEnd = (clone $currentStart)->subSecond();

    // --- 1. TOTAIS GERAIS E CRESCIMENTO ---
    $getMetrics = function ($start, $end) use ($userId) {
      $fat = Venda::where('user_id', $userId)->whereBetween('created_at', [$start, $end])->sum('total_venda');
      $count = Venda::where('user_id', $userId)->whereBetween('created_at', [$start, $end])->count();

      $lucro = DB::table('venda_items')
        ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
        ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
        ->where('vendas.user_id', $userId)
        ->whereBetween('vendas.created_at', [$start, $end])
        ->sum(DB::raw('venda_items.quantidade * (venda_items.preco_unitario - COALESCE(produtos.preco_de_custo, 0))'));

      return ['faturamento' => $fat, 'vendas' => $count, 'lucro' => $lucro];
    };

    $atual = $getMetrics($currentStart, $currentEnd);
    $anterior = $getMetrics($prevStart, $prevEnd);

    $calcGrowth = fn($curr, $prev) => $prev > 0 ? (($curr - $prev) / $prev) * 100 : ($curr > 0 ? 100 : 0);

    // Ticket Médio (Atual e Anterior para growth)
    $ticketMedioAtual = $atual['vendas'] > 0 ? $atual['faturamento'] / $atual['vendas'] : 0;
    $ticketMedioAnterior = $anterior['vendas'] > 0 ? $anterior['faturamento'] / $anterior['vendas'] : 0;

    // Novos Clientes (Atual e Anterior)
    $novosClientesAtual = Cliente::where('user_id', $userId)->whereBetween('created_at', [$currentStart, $currentEnd])->count();
    $novosClientesAnterior = Cliente::where('user_id', $userId)->whereBetween('created_at', [$prevStart, $prevEnd])->count();

    $growth = [
      'faturamento' => $calcGrowth($atual['faturamento'], $anterior['faturamento']),
      'lucro' => $calcGrowth($atual['lucro'], $anterior['lucro']),
      'vendas' => $calcGrowth($atual['vendas'], $anterior['vendas']),
      'ticket_medio' => $calcGrowth($ticketMedioAtual, $ticketMedioAnterior), // <--- NOVO
      'novos_clientes' => $calcGrowth($novosClientesAtual, $novosClientesAnterior), // <--- NOVO
    ];

    // --- 2. CURVA ABC ---
    $produtosPerformance = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$currentStart, $currentEnd])
      ->select(
        'produtos.nome',
        DB::raw('SUM(venda_items.quantidade * venda_items.preco_unitario) as total'),
        DB::raw('SUM(venda_items.quantidade * (venda_items.preco_unitario - COALESCE(produtos.preco_de_custo, 0))) as total_lucro'),
        // CORREÇÃO AQUI: Multiplicamos por 1.0 para forçar decimal e usamos NULLIF para evitar divisão por zero
        DB::raw('AVG(((venda_items.preco_unitario - COALESCE(produtos.preco_de_custo, 0)) * 1.0) / NULLIF(venda_items.preco_unitario, 0) * 100) as margem_media')
      )
      ->groupBy('produtos.id', 'produtos.nome')
      ->orderByDesc('total')
      ->get();

    $totalFatPeriodo = $produtosPerformance->sum('total');
    $acumulado = 0;
    $curvaABC = ['A' => 0, 'B' => 0, 'C' => 0];
    foreach ($produtosPerformance as $prod) {
      $acumulado += $prod->total;
      $perc = $totalFatPeriodo > 0 ? ($acumulado / $totalFatPeriodo) * 100 : 0;
      if ($perc <= 80) $curvaABC['A']++;
      elseif ($perc <= 95) $curvaABC['B']++;
      else $curvaABC['C']++;
    }

    // --- 3. DEMAIS DADOS ---
    $produtosCatalogo = Produto::where('user_id', $userId)
      ->where('preco', '>', 0) // Evita divisão por zero
      ->select(
        'nome',
        'preco',
        'preco_de_custo',
        // Fórmula de Margem: (Preço - Custo) / Preço * 100
        DB::raw('((preco - COALESCE(preco_de_custo, 0)) * 1.0 / preco) * 100 as margem_media')
      )
      ->get();

    // Pega os 3 com maior margem
    $topMargem = $produtosCatalogo->sortByDesc('margem_media')->take(3)->values();

    // Pega os 3 com menor margem (incluindo negativas)
    $bottomMargem = $produtosCatalogo->sortBy('margem_media')->take(3)->values();

    $topClientesLucro = DB::table('vendas')
      ->join('clientes', 'vendas.cliente_id', '=', 'clientes.id')
      ->join('venda_items', 'vendas.id', '=', 'venda_items.venda_id')
      ->join('produtos', 'venda_items.produto_id', '=', 'produtos.id')
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$currentStart, $currentEnd])
      ->select(
        'clientes.nome',
        DB::raw('SUM(venda_items.quantidade * venda_items.preco_unitario) as faturamento'),
        DB::raw('SUM(venda_items.quantidade * (venda_items.preco_unitario - COALESCE(produtos.preco_de_custo, 0))) as lucro')
      )
      ->groupBy('clientes.id', 'clientes.nome')
      ->orderByDesc('lucro')
      ->limit(5)
      ->get();

    $valorEstoque = Produto::where('user_id', $userId)->sum(DB::raw('quantidade_estoque * preco_de_custo'));
    $totalClientes = Cliente::where('user_id', $userId)->count();

    $graficoVendas = Venda::where('user_id', $userId)
      ->whereBetween('created_at', [$currentStart, $currentEnd])
      ->selectRaw("strftime('%Y-%m-%d', created_at) as mes, SUM(total_venda) as total")
      ->groupBy('mes')->orderBy('mes')->get();

    $estoqueBaixo = Produto::where('user_id', $userId)
      ->where('quantidade_estoque', '<', 5)
      ->orderBy('quantidade_estoque', 'asc')
      ->limit(5)
      ->get();

    return response()->json([
      'kpi' => [
        'faturamento' => $atual['faturamento'],
        'faturamento_growth' => round($growth['faturamento'], 1),
        'lucro' => $atual['lucro'],
        'lucro_growth' => round($growth['lucro'], 1),
        'vendas' => $atual['vendas'],
        'vendas_growth' => round($growth['vendas'], 1),
        'ticket_medio' => $ticketMedioAtual,
        'ticket_medio_growth' => round($growth['ticket_medio'], 1), // Novo
        'novos_clientes' => $novosClientesAtual,
        'novos_clientes_growth' => round($growth['novos_clientes'], 1), // Novo
        'valor_estoque' => $valorEstoque,
        'clientes_total' => $totalClientes,
      ],
      'curva_abc' => $curvaABC,
      'top_clientes_lucro' => $topClientesLucro,
      'produtos_alta_margem' => $topMargem,
      'produtos_baixa_margem' => $bottomMargem,
      'grafico_vendas' => $graficoVendas,
      'top_produtos_fat' => $produtosPerformance->take(5)->values(),
      'estoque_baixo' => $estoqueBaixo
    ]);
  }

  // --- MÉTODOS PRIVADOS E DE PRODUTO INDIVIDUAL (Mantidos como estavam) ---

  private function calculateLinearRegression($data)
  {
    $n = count($data);
    if ($n < 2) return ['slope' => 0, 'intercept' => 0, 'prediction' => 0];

    $sumX = 0;
    $sumY = 0;
    $sumXY = 0;
    $sumXX = 0;

    foreach ($data as $key => $point) {
      $x = $key + 1;
      $y = $point->total;

      $sumX += $x;
      $sumY += $y;
      $sumXY += ($x * $y);
      $sumXX += ($x * $x);
    }

    $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumXX - $sumX * $sumX);
    $intercept = ($sumY - $slope * $sumX) / $n;
    $prediction = ($slope * ($n + 1)) + $intercept;

    return [
      'slope' => $slope,
      'intercept' => $intercept,
      'prediction' => max(0, $prediction)
    ];
  }

  public function produto(Request $request, $produtoId)
  {
    $userId = Auth::id();
    $produto = Produto::where('id', $produtoId)->where('user_id', $userId)->firstOrFail();

    $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
    $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

    $currentStart = Carbon::parse($startDate)->startOfDay();
    $currentEnd = Carbon::parse($endDate)->endOfDay();

    $daysDiff = $currentStart->diffInDays($currentEnd);
    $groupMode = 'dia';

    if ($daysDiff >= 365) {
      $groupMode = 'mes';
    } elseif ($daysDiff >= 180) {
      $groupMode = 'quinzena';
    }

    $vendasBrutas = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->where('venda_items.produto_id', $produto->id)
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$currentStart, $currentEnd])
      ->selectRaw("strftime('%Y-%m-%d', vendas.created_at) as data_venda, SUM(venda_items.quantidade * venda_items.preco_unitario) as total, SUM(venda_items.quantidade) as qtd")
      ->groupBy('data_venda')
      ->get();

    $chartMap = [];
    $periodo = \Carbon\CarbonPeriod::create($currentStart, $currentEnd);

    foreach ($periodo as $date) {
      if ($groupMode === 'mes') {
        $key = $date->format('Y-m');
        $label = ucfirst($date->translatedFormat('M/y'));
      } elseif ($groupMode === 'quinzena') {
        $quinzena = $date->day <= 15 ? '01' : '02';
        $key = $date->format('Y-m') . '-' . $quinzena;
        $label = ucfirst($date->translatedFormat('M/y')) . " Q{$quinzena}";
      } else {
        $key = $date->format('Y-m-d');
        $label = $date->format('d/m');
      }

      if (!isset($chartMap[$key])) {
        $chartMap[$key] = (object) [
          'mes' => $label,
          'total' => 0,
          'qtd' => 0
        ];
      }

      $vendaDia = $vendasBrutas->firstWhere('data_venda', $date->format('Y-m-d'));
      if ($vendaDia) {
        $chartMap[$key]->total += $vendaDia->total;
        $chartMap[$key]->qtd += $vendaDia->qtd;
      }
    }

    $chartData = array_values($chartMap);

    $faturamentoAtual = array_sum(array_column($chartData, 'total'));
    $qtdAtual = array_sum(array_column($chartData, 'qtd'));

    $prevStart = (clone $currentStart)->subDays($daysDiff + 1);
    $prevEnd = (clone $currentStart)->subSecond();

    $faturamentoAnterior = DB::table('venda_items')
      ->join('vendas', 'venda_items.venda_id', '=', 'vendas.id')
      ->where('venda_items.produto_id', $produto->id)
      ->where('vendas.user_id', $userId)
      ->whereBetween('vendas.created_at', [$prevStart, $prevEnd])
      ->sum(DB::raw('venda_items.quantidade * venda_items.preco_unitario'));

    $growth = 0;
    if ($faturamentoAnterior > 0) {
      $growth = (($faturamentoAtual - $faturamentoAnterior) / $faturamentoAnterior) * 100;
    } elseif ($faturamentoAtual > 0) {
      $growth = 100;
    }

    $regression = $this->calculateLinearRegression($chartData);
    $lucro = $faturamentoAtual - ($qtdAtual * $produto->preco_de_custo);

    $diasNoPeriodo = max(1, $currentStart->diffInDays($currentEnd) + 1);
    $velocidadeVendasDiaria = $qtdAtual / $diasNoPeriodo;

    $diasParaAcabar = null;
    if ($produto->quantidade_estoque <= 0) {
      $diasParaAcabar = 0;
    } elseif ($velocidadeVendasDiaria > 0) {
      $diasParaAcabar = round($produto->quantidade_estoque / $velocidadeVendasDiaria);
    } else {
      $diasParaAcabar = 9999;
    }

    $faturamentoTotalEmpresa = Venda::where('user_id', $userId)
      ->whereBetween('created_at', [$currentStart, $currentEnd])
      ->sum('total_venda');

    $shareFaturamento = 0;
    if ($faturamentoTotalEmpresa > 0) {
      $shareFaturamento = ($faturamentoAtual / $faturamentoTotalEmpresa) * 100;
    }

    return response()->json([
      'produto_nome' => $produto->nome,
      'estoque_atual' => $produto->quantidade_estoque,
      'preco_atual' => $produto->preco,
      'faturamento' => $faturamentoAtual,
      'qtd_vendida' => $qtdAtual,
      'lucro' => $lucro,
      'growth_rate' => round($growth, 1),
      'previsao_proximo_periodo' => round($regression['prediction'], 2),
      'tendencia_slope' => $regression['slope'],
      'dias_para_acabar' => $diasParaAcabar,
      'share_faturamento' => round($shareFaturamento, 2),
      'grafico_vendas' => $chartData
    ]);
  }
}
