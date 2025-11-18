<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendas', function (Blueprint $table) {
            $table->id();

            // Chave estrangeira para o usuário (para multitenancy)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Chave estrangeira para o cliente
            // Usamos nullableOnDelete para que a venda não seja apagada se o cliente for.
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();

            $table->decimal('total_venda', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendas');
    }
};
