<?php

namespace Tests\Unit;

use App\Models\Venda;
use PHPUnit\Framework\TestCase;

class VendaUnitTest extends TestCase
{
  public function test_deve_identificar_venda_grande()
  {
    // Instancia a classe em memória (sem salvar no banco)
    $venda = new Venda([
      'total_venda' => 1500.00
    ]);

    $this->assertTrue($venda->isVendaGrande());
  }

  public function test_deve_identificar_venda_pequena()
  {
    $venda = new Venda([
      'total_venda' => 50.00
    ]);

    $this->assertFalse($venda->isVendaGrande());
  }
}
