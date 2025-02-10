<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('financas', function (Blueprint $table) {
            $table->id();
            $table->decimal('lucro', 10, 2);
            $table->decimal('despesas', 10, 2);
            $table->foreignId('venda_id')->constrained('vendas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financas');
    }
};
