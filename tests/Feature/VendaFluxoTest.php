<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendaFluxoTest extends TestCase
{
  use RefreshDatabase;

  public function test_deve_realizar_venda_baixar_estoque_e_calcular_total()
  {
    // 1. Preparação (Arrange)
    $user = User::factory()->create();
    $cliente = Cliente::factory()->create(['user_id' => $user->id]);

    $produtoA = Produto::factory()->create([
      'user_id' => $user->id,
      'preco' => 100.00,
      'quantidade_estoque' => 10
    ]);

    $produtoB = Produto::factory()->create([
      'user_id' => $user->id,
      'preco' => 50.00,
      'quantidade_estoque' => 5
    ]);

    // Autentica como o usuário
    $this->actingAs($user);

    // 2. Ação (Act) - Simula requisição para API
    $payload = [
      'cliente_id' => $cliente->id,
      'items' => [
        ['produto_id' => $produtoA->id, 'quantidade' => 2], // 2x 100 = 200
        ['produto_id' => $produtoB->id, 'quantidade' => 1], // 1x 50 = 50
      ]
    ];

    $response = $this->postJson('/api/vendas', $payload);

    // 3. Verificação (Assert)
    $response->assertStatus(201); // Created

    // Verifica o JSON de resposta
    $response->assertJsonPath('total_venda', 250); // 200 + 50

    // Verifica se o estoque baixou no banco
    $this->assertDatabaseHas('produtos', [
      'id' => $produtoA->id,
      'quantidade_estoque' => 8 // 10 - 2
    ]);

    $this->assertDatabaseHas('produtos', [
      'id' => $produtoB->id,
      'quantidade_estoque' => 4 // 5 - 1
    ]);
  }

  public function test_nao_deve_vender_sem_estoque_via_api()
  {
    $user = User::factory()->create();
    $cliente = Cliente::factory()->create(['user_id' => $user->id]);
    $produto = Produto::factory()->create([
      'user_id' => $user->id,
      'quantidade_estoque' => 2,
      'nome' => 'Produto Teste'
    ]);

    $this->actingAs($user);

    $payload = [
      'cliente_id' => $cliente->id,
      'items' => [
        ['produto_id' => $produto->id, 'quantidade' => 5] // Tenta vender 5, tem 2
      ]
    ];

    $response = $this->postJson('/api/vendas', $payload);

    $response->assertStatus(422); // Unprocessable Entity (ou erro tratado)
    $response->assertJsonFragment(['message' => "Estoque insuficiente para o produto: Produto Teste"]);
  }

  public function test_exclusao_de_venda_deve_estornar_estoque()
  {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Cria produto com 10 no estoque
    $produto = Produto::factory()->create(['user_id' => $user->id, 'quantidade_estoque' => 10]);
    $cliente = Cliente::factory()->create(['user_id' => $user->id]);

    // Cria uma venda (manual ou via factory se tiver)
    // Vamos simular que a venda tirou 2 itens, então estoque atual deve ser 8
    $produto->update(['quantidade_estoque' => 8]);

    $venda = \App\Models\Venda::create([
      'user_id' => $user->id,
      'cliente_id' => $cliente->id,
      'total_venda' => 200
    ]);

    \App\Models\VendaItem::create([
      'venda_id' => $venda->id,
      'produto_id' => $produto->id,
      'quantidade' => 2,
      'preco_unitario' => 100
    ]);

    // Ação: Deletar a venda
    $response = $this->deleteJson("/api/vendas/{$venda->id}");

    $response->assertStatus(204);

    // O estoque deve ter voltado para 10
    $this->assertDatabaseHas('produtos', [
      'id' => $produto->id,
      'quantidade_estoque' => 10
    ]);
  }
}
