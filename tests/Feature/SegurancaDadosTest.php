<?php

namespace Tests\Feature;

use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SegurancaDadosTest extends TestCase
{
  use RefreshDatabase;

  public function test_usuario_nao_pode_ver_produtos_de_outro_usuario()
  {
    // Usuário A (Dono do produto)
    $userA = User::factory()->create();
    $produtoA = Produto::factory()->create(['user_id' => $userA->id, 'nome' => 'Produto Secreto do A']);

    // Usuário B (Intruso)
    $userB = User::factory()->create();

    // Autentica como B
    $this->actingAs($userB);

    // Tenta listar produtos
    $response = $this->getJson('/api/produtos');

    $response->assertStatus(200);
    // O JSON retornado NÃO deve conter o produto do A
    $response->assertJsonMissing(['nome' => 'Produto Secreto do A']);
  }

  public function test_usuario_nao_pode_excluir_venda_de_outro_usuario()
  {
    $userA = User::factory()->create();
    $vendaA = \App\Models\Venda::factory()->create(['user_id' => $userA->id]);

    $userB = User::factory()->create();

    // Autentica como B
    $this->actingAs($userB);

    // Tenta deletar a venda do A
    $response = $this->deleteJson("/api/vendas/{$vendaA->id}");

    // Deve retornar 404 (Not Found) ou 403, pois o `findOrFail` 
    // no seu controller tem o escopo `where('user_id', Auth::id())`
    $response->assertStatus(404);

    // Garante que a venda ainda existe no banco
    $this->assertDatabaseHas('vendas', ['id' => $vendaA->id]);
  }
}
