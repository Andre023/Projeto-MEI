<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SimulacaoVendasSeeder extends Seeder
{
  public function run()
  {
    // 1. Garante que temos um usuário e cliente base
    $userId = DB::table('users')->value('id') ?? 1;

    // Cria cliente se não existir
    $clienteId = DB::table('clientes')->insertGetId([
      'nome' => 'Cliente Simulação',
      'telefone' => '999999999',
      'user_id' => $userId,
      'created_at' => now(),
      'updated_at' => now()
    ]);

    // Cria estrutura de categoria para não quebrar FKs
    $catId = DB::table('categorias_arvore')->insertGetId(['nome' => 'Simulação', 'user_id' => $userId, 'created_at' => now(), 'updated_at' => now()]);
    $subCatId = DB::table('subcategorias')->insertGetId(['nome' => 'Geral', 'categoria_id' => $catId, 'user_id' => $userId, 'created_at' => now(), 'updated_at' => now()]);
    $grupoId = DB::table('grupos')->insertGetId(['nome' => 'Geral', 'subcategoria_id' => $subCatId, 'user_id' => $userId, 'created_at' => now(), 'updated_at' => now()]);
    $subGrupoId = DB::table('subgrupos')->insertGetId(['nome' => 'Geral', 'grupo_id' => $grupoId, 'user_id' => $userId, 'created_at' => now(), 'updated_at' => now()]);

    // --- DEFINIÇÃO DOS 3 CENÁRIOS ---

    // PRODUTO 1: "A Máquina de Vendas" (Crescimento Constante)
    // Cenário: Vende todo dia, tendência de alta leve. Estoque saudável.
    $prodA = DB::table('produtos')->insertGetId([
      'nome' => 'Café Premium (Crescimento)',
      'descricao' => 'Vendas constantes e saudáveis',
      'preco' => 45.00,
      'preco_de_custo' => 20.00,
      'quantidade_estoque' => 500, // Estoque Bom
      'subgrupo_id' => $subGrupoId,
      'user_id' => $userId,
      'created_at' => now(),
      'updated_at' => now()
    ]);

    // PRODUTO 2: "O Hype" (Explosão Recente)
    // Cenário: Não vendia nada, explodiu nos últimos 2 meses. Risco de ruptura de estoque.
    $prodB = DB::table('produtos')->insertGetId([
      'nome' => 'Smartwatch GenZ (Hype)',
      'descricao' => 'Explosão de vendas recente',
      'preco' => 250.00,
      'preco_de_custo' => 150.00,
      'quantidade_estoque' => 20, // Estoque BAIXO (Vai dar alerta vermelho de Runway)
      'subgrupo_id' => $subGrupoId,
      'user_id' => $userId,
      'created_at' => now(),
      'updated_at' => now()
    ]);

    // PRODUTO 3: "O Obsoleto" (Em Queda)
    // Cenário: Vendia muito no começo do ano, agora parou. Tendência negativa.
    $prodC = DB::table('produtos')->insertGetId([
      'nome' => 'Capa iPhone 6 (Em Queda)',
      'descricao' => 'Produto morrendo',
      'preco' => 15.00,
      'preco_de_custo' => 5.00,
      'quantidade_estoque' => 1000, // Estoque Encalhado
      'subgrupo_id' => $subGrupoId,
      'user_id' => $userId,
      'created_at' => now(),
      'updated_at' => now()
    ]);

    $this->command->info("Produtos criados: IDs $prodA, $prodB, $prodC. Gerando histórico de 365 dias...");

    // --- GERAR 1 ANO DE HISTÓRICO ---
    $startDate = Carbon::now()->subYear();

    for ($i = 0; $i <= 365; $i++) {
      $currentDate = (clone $startDate)->addDays($i);
      $month = $currentDate->month;

      // 1. Lógica Produto A (Constante com leve alta no fim do ano)
      // Vende quase todo dia (80% chance)
      if (rand(1, 100) <= 80) {
        $qtd = rand(1, 4);
        // Aumenta vendas perto de dezembro (simular sazonalidade)
        if ($month == 12) $qtd += rand(1, 3);

        $this->criarVenda($userId, $clienteId, $prodA, $qtd, 45.00, $currentDate);
      }

      // 2. Lógica Produto B (Exponencial)
      // Meses 1-9: Venda rara (10% chance). Meses 10-12: Explosão (90% chance e volume alto)
      $chance = ($i > 270) ? 90 : 10;
      if (rand(1, 100) <= $chance) {
        $qtd = ($i > 270) ? rand(5, 15) : 1; // Volume explode no final
        $this->criarVenda($userId, $clienteId, $prodB, $qtd, 250.00, $currentDate);
      }

      // 3. Lógica Produto C (Queda)
      // Começa vendendo muito (90% chance), termina vendendo nada (10% chance)
      // Invertemos a lógica do loop: quanto maior o $i, menor a chance
      $chance = max(5, 100 - ($i / 3)); // Começa em 100%, cai até 5%
      if (rand(1, 100) <= $chance) {
        $qtd = rand(2, 6);
        $this->criarVenda($userId, $clienteId, $prodC, $qtd, 15.00, $currentDate);
      }
    }

    $this->command->info("Simulação concluída com sucesso!");
  }

  private function criarVenda($userId, $clienteId, $prodId, $qtd, $preco, $data)
  {
    $total = $qtd * $preco;

    // Insere Venda
    $vendaId = DB::table('vendas')->insertGetId([
      'user_id' => $userId,
      'cliente_id' => $clienteId,
      'total_venda' => $total,
      'created_at' => $data,
      'updated_at' => $data
    ]);

    // Insere Item
    DB::table('venda_items')->insert([
      'venda_id' => $vendaId,
      'produto_id' => $prodId,
      'quantidade' => $qtd,
      'preco_unitario' => $preco,
      'created_at' => $data,
      'updated_at' => $data
    ]);
  }
}
