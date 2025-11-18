<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venda_items', function (Blueprint $table) {
            $table->id();

            // Chave estrangeira para a venda (cabeçalho)
            $table->foreignId('venda_id')->constrained('vendas')->onDelete('cascade');

            // Chave estrangeira para o produto
            // Se o produto for apagado, o item da venda também é (ou podemos setar para null)
            $table->foreignId('produto_id')->nullable()->constrained('produtos')->nullOnDelete();

            $table->integer('quantidade');

            // Preço do produto no momento da venda (importante para histórico)
            $table->decimal('preco_unitario', 10, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venda_items');
    }
};
