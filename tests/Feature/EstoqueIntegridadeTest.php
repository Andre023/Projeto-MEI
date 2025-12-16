<?php

namespace Tests\Feature;

use App\Models\Produto;
use App\Models\User;
use App\Services\EstoqueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Exception;

class EstoqueIntegridadeTest extends TestCase
{
  use RefreshDatabase;

  public function test_nao_deve_permitir_saida_de_estoque_insuficiente_pelo_service()
  {
    $user = User::factory()->create();
    $produto = Produto::factory()->create([
      'user_id' => $user->id,
      'quantidade_estoque' => 5
    ]);

    $service = new EstoqueService();

    $this->expectException(Exception::class);
    $this->expectExceptionMessage('Estoque insuficiente para esta saída.');

    $service->movimentarEstoque($produto, 'saida', 10);
  }

  public function test_deve_atualizar_estoque_corretamente_apos_entrada()
  {
    $user = User::factory()->create();
    $produto = Produto::factory()->create([
      'user_id' => $user->id,
      'quantidade_estoque' => 10
    ]);

    $service = new EstoqueService();
    $service->movimentarEstoque($produto, 'entrada', 5, 'Compra de fornecedor');

    $this->assertDatabaseHas('produtos', [
      'id' => $produto->id,
      'quantidade_estoque' => 15
    ]);

    $this->assertDatabaseHas('movimentacao_estoques', [
      'produto_id' => $produto->id,
      'tipo' => 'entrada',
      'quantidade' => 5,
      'descricao' => 'Compra de fornecedor'
    ]);
  }
}
